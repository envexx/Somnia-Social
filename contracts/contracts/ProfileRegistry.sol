// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ProfileRegistry
 * @dev Manages user profiles with unique handles and IPFS content storage
 * @notice ERC-2771 aware for gasless transactions
 */
contract ProfileRegistry is ERC2771Context, Ownable, ReentrancyGuard {
    // Custom errors for gas optimization
    error HandleAlreadyTaken();
    error ProfileNotFound();
    error Unauthorized();
    error InvalidHandle();
    error ProfileAlreadyExists();

    struct Profile {
        uint64 userId;
        address owner;
        bytes32 handleHash;
        string profileCid;
        uint64 createdAt;
        uint64 updatedAt;
    }

    // Events
    event ProfileCreated(
        address indexed owner, 
        uint64 indexed userId, 
        bytes32 handleHash, 
        string profileCid
    );
    event ProfileUpdated(uint64 indexed userId, string profileCid);

    // Storage
    uint64 private _nextUserId = 1;
    mapping(address => Profile) private _profilesByOwner;
    mapping(bytes32 => address) private _handleOwner;
    mapping(uint64 => Profile) private _profilesById;
    address public badgesContract; // Address of Badges contract

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) Ownable() {}

    /**
     * @dev Set the badges contract address
     * @param _badgesContract Address of the Badges contract
     */
    function setBadgesContract(address _badgesContract) external onlyOwner {
        badgesContract = _badgesContract;
    }

    /**
     * @dev Create a new profile with unique handle
     * @param usernameLower Lowercase username (must be unique)
     * @param profileCid IPFS CID for profile JSON content
     * @param user User address (for gasless transactions, use address(0) for regular transactions)
     */
    function createProfile(
        string calldata usernameLower, 
        string calldata profileCid,
        address user
    ) external nonReentrant {
        // For gasless transactions, use provided user address
        // For regular transactions, use _msgSender()
        address actualUser = user != address(0) ? user : _msgSender();
        
        // Check if user already has a profile
        if (_profilesByOwner[actualUser].userId != 0) {
            revert ProfileAlreadyExists();
        }

        // Validate handle
        if (bytes(usernameLower).length == 0 || bytes(usernameLower).length > 50) {
            revert InvalidHandle();
        }

        // Create handle hash
        bytes32 handleHash = keccak256(bytes(usernameLower));
        
        // Check if handle is already taken
        if (_handleOwner[handleHash] != address(0)) {
            revert HandleAlreadyTaken();
        }

        // Create profile
        uint64 userId = _nextUserId++;
        Profile memory newProfile = Profile({
            userId: userId,
            owner: actualUser,
            handleHash: handleHash,
            profileCid: profileCid,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        // Store profile
        _profilesByOwner[actualUser] = newProfile;
        _handleOwner[handleHash] = actualUser;
        _profilesById[userId] = newProfile;

        emit ProfileCreated(actualUser, userId, handleHash, profileCid);
        
        // Auto-assign beginner badge if badges contract is set
        if (badgesContract != address(0)) {
            // Call assignBeginnerBadge on Badges contract
            (bool success, ) = badgesContract.call(
                abi.encodeWithSignature("assignBeginnerBadge(address,address)", actualUser, address(this))
            );
            if (!success) {
                // If badge assignment fails, don't revert the profile creation
                // Just emit an event or log the failure
            }
        }
    }

    /**
     * @dev Update existing profile content
     * @param userId Profile ID to update
     * @param profileCid New IPFS CID for profile JSON content
     */
    function updateProfile(uint64 userId, string calldata profileCid) external nonReentrant {
        address user = _msgSender();
        
        Profile storage profile = _profilesById[userId];
        if (profile.userId == 0) {
            revert ProfileNotFound();
        }
        
        if (profile.owner != user) {
            revert Unauthorized();
        }

        profile.profileCid = profileCid;
        profile.updatedAt = uint64(block.timestamp);

        // Update the mapping by owner as well
        _profilesByOwner[user] = profile;

        emit ProfileUpdated(userId, profileCid);
    }

    /**
     * @dev Get profile by owner address
     * @param owner Address of the profile owner
     * @return userId Profile ID
     * @return ownerAddr Owner address
     * @return handleHash Handle hash
     * @return profileCid IPFS CID
     */
    function getProfileByOwner(address owner) external view returns (
        uint64 userId,
        address ownerAddr,
        bytes32 handleHash,
        string memory profileCid
    ) {
        Profile memory profile = _profilesByOwner[owner];
        if (profile.userId == 0) {
            revert ProfileNotFound();
        }
        
        return (profile.userId, profile.owner, profile.handleHash, profile.profileCid);
    }

    /**
     * @dev Get profile by handle hash
     * @param handleHash Hash of the handle
     * @return userId Profile ID
     * @return ownerAddr Owner address
     * @return handleHashOut Handle hash (same as input)
     * @return profileCid IPFS CID
     */
    function getProfileByHandleHash(bytes32 handleHash) external view returns (
        uint64 userId,
        address ownerAddr,
        bytes32 handleHashOut,
        string memory profileCid
    ) {
        address owner = _handleOwner[handleHash];
        if (owner == address(0)) {
            revert ProfileNotFound();
        }
        
        Profile memory profile = _profilesByOwner[owner];
        return (profile.userId, profile.owner, profile.handleHash, profile.profileCid);
    }

    /**
     * @dev Get profile by user ID
     * @param userId Profile ID
     * @return profile Complete profile struct
     */
    function getProfileById(uint64 userId) external view returns (Profile memory profile) {
        profile = _profilesById[userId];
        if (profile.userId == 0) {
            revert ProfileNotFound();
        }
    }

    /**
     * @dev Check if handle is available
     * @param usernameLower Lowercase username to check
     * @return available True if handle is available
     */
    function isHandleAvailable(string calldata usernameLower) external view returns (bool available) {
        bytes32 handleHash = keccak256(bytes(usernameLower));
        return _handleOwner[handleHash] == address(0);
    }

    /**
     * @dev Check if address has a profile
     * @param owner Address to check
     * @return hasProfile True if address has a profile
     */
    function hasProfile(address owner) external view returns (bool) {
        return _profilesByOwner[owner].userId != 0;
    }

    /**
     * @dev Get total number of profiles created
     * @return count Total profile count
     */
    function getTotalProfiles() external view returns (uint64 count) {
        return _nextUserId - 1;
    }

    /**
     * @dev Override _msgSender to use ERC2771Context
     */
    function _msgSender() internal view override(ERC2771Context, Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Override _msgData to use ERC2771Context
     */
    function _msgData() internal view override(ERC2771Context, Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Override _contextSuffixLength to resolve inheritance conflict
     */
    function _contextSuffixLength() internal view override(ERC2771Context, Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
