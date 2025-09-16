// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Badges
 * @dev ERC-1155 non-transferable badges with tier system
 * @notice ERC-2771 aware for gasless transactions
 */
contract Badges is ERC1155, ERC2771Context, Ownable, ReentrancyGuard {
    // Custom errors for gas optimization
    error BadgeNotTransferable();
    error InvalidTier();
    error Unauthorized();
    error BadgeNotFound();

    // Events
    event TierGranted(address indexed user, uint256 indexed tierId);
    event TierRevoked(address indexed user, uint256 indexed tierId);
    event TierMetadataUpdated(uint256 indexed tierId, string metadataUri);

    // Tier definitions
    uint256 public constant EXPLORER_TIER = 1;
    uint256 public constant INFLUENCER_TIER = 2;
    uint256 public constant LEADER_TIER = 3;
    uint256 public constant LEGEND_TIER = 4;
    
    uint256 public constant MAX_TIER = LEGEND_TIER;

    // Storage
    mapping(address => uint256) private _userTiers; // Highest tier held by user
    mapping(uint256 => string) private _tierMetadata; // Tier metadata URIs
    mapping(address => bool) private _controllers; // Addresses that can grant tiers
    address public profileRegistryContract; // Address of ProfileRegistry contract
    
    // Tier requirements (can be updated by owner)
    mapping(uint256 => uint256) public tierRequirements; // tierId => requirement threshold

    constructor(address trustedForwarder) 
        ERC1155("") 
        ERC2771Context(trustedForwarder) 
        Ownable() 
    {
        // Initialize tier metadata
        _tierMetadata[EXPLORER_TIER] = "ipfs://bafy...explorer-badge.json";
        _tierMetadata[INFLUENCER_TIER] = "ipfs://bafy...influencer-badge.json";
        _tierMetadata[LEADER_TIER] = "ipfs://bafy...leader-badge.json";
        _tierMetadata[LEGEND_TIER] = "ipfs://bafy...legend-badge.json";
        
        // Initialize tier requirements (based on new tier system)
        tierRequirements[EXPLORER_TIER] = 10;     // 10 posts or 20 likes/reactions total
        tierRequirements[INFLUENCER_TIER] = 1000; // ≥1,000 follower, engagement rate ≥5%
        tierRequirements[LEADER_TIER] = 5;        // 5 event/space dibuat, engagement tinggi
        tierRequirements[LEGEND_TIER] = 10000;   // ≥10,000 follower, community NPS ≥8/10
    }

    /**
     * @dev Set the profile registry contract address
     * @param _profileRegistryContract Address of the ProfileRegistry contract
     */
    function setProfileRegistryContract(address _profileRegistryContract) external onlyOwner {
        profileRegistryContract = _profileRegistryContract;
    }

    /**
     * @dev Grant a tier badge to a user
     * @param user User address to grant badge to
     * @param tierId Tier ID to grant (1-4)
     * @param caller Caller address (for gasless transactions, use address(0) for regular transactions)
     */
    function grantTier(address user, uint256 tierId, address caller) external nonReentrant {
        // For gasless transactions, use provided caller address
        // For regular transactions, use _msgSender()
        address actualCaller = caller != address(0) ? caller : _msgSender();
        
        // Check authorization based on who is calling the function, not the caller parameter
        if (!_controllers[_msgSender()] && _msgSender() != owner()) {
            revert Unauthorized();
        }
        
        if (tierId < EXPLORER_TIER || tierId > MAX_TIER) {
            revert InvalidTier();
        }

        // Grant the badge (mint 1 token)
        _mint(user, tierId, 1, "");
        
        // Update user's highest tier if this is higher
        if (tierId > _userTiers[user]) {
            _userTiers[user] = tierId;
        }

        emit TierGranted(user, tierId);
    }

    /**
     * @dev Revoke a tier badge from a user
     * @param user User address to revoke badge from
     * @param tierId Tier ID to revoke
     * @param caller Caller address (for gasless transactions, use address(0) for regular transactions)
     */
    function revokeTier(address user, uint256 tierId, address caller) external nonReentrant {
        // For gasless transactions, use provided caller address
        // For regular transactions, use _msgSender()
        address actualCaller = caller != address(0) ? caller : _msgSender();
        
        // Check authorization based on who is calling the function, not the caller parameter
        if (!_controllers[_msgSender()] && _msgSender() != owner()) {
            revert Unauthorized();
        }
        
        if (balanceOf(user, tierId) == 0) {
            revert BadgeNotFound();
        }

        // Burn the badge
        _burn(user, tierId, 1);
        
        // Update user's highest tier if this was their highest
        if (tierId == _userTiers[user]) {
            // Find the next highest tier
            uint256 newHighestTier = 0;
            for (uint256 i = EXPLORER_TIER; i <= MAX_TIER; i++) {
                if (balanceOf(user, i) > 0 && i > newHighestTier) {
                    newHighestTier = i;
                }
            }
            _userTiers[user] = newHighestTier;
        }

        emit TierRevoked(user, tierId);
    }

    /**
     * @dev Auto-assign beginner badge to new user
     * @param user User address to grant beginner badge to
     * @param caller Caller address (for gasless transactions, use address(0) for regular transactions)
     */
    function assignBeginnerBadge(address user, address caller) external nonReentrant {
        // For gasless transactions, use provided caller address
        // For regular transactions, use _msgSender()
        address actualCaller = caller != address(0) ? caller : _msgSender();
        
        // Only allow ProfileRegistry contract or owner to call this
        if (actualCaller != owner() && actualCaller != profileRegistryContract) {
            revert Unauthorized();
        }
        
        // Check if user already has any badge
        if (_userTiers[user] > 0) {
            return; // User already has badges, don't assign beginner
        }
        
        // Grant EXPLORER_TIER (beginner badge)
        _mint(user, EXPLORER_TIER, 1, "");
        _userTiers[user] = EXPLORER_TIER;
        
        emit TierGranted(user, EXPLORER_TIER);
    }

    /**
     * @dev Get the highest tier held by a user
     * @param user User address
     * @return tierId Highest tier ID (0 if no badges)
     */
    function tierOf(address user) external view returns (uint256 tierId) {
        return _userTiers[user];
    }

    /**
     * @dev Check if user has a specific tier
     * @param user User address
     * @param tierId Tier ID to check
     * @return hasTier True if user has the tier
     */
    function hasTier(address user, uint256 tierId) external view returns (bool) {
        return balanceOf(user, tierId) > 0;
    }

    /**
     * @dev Get all tiers held by a user
     * @param user User address
     * @return tiers Array of tier IDs held by user
     */
    function getUserTiers(address user) external view returns (uint256[] memory tiers) {
        uint256 count = 0;
        
        // Count how many tiers the user has
        for (uint256 i = EXPLORER_TIER; i <= MAX_TIER; i++) {
            if (balanceOf(user, i) > 0) {
                count++;
            }
        }
        
        // Create array and populate it
        tiers = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = EXPLORER_TIER; i <= MAX_TIER; i++) {
            if (balanceOf(user, i) > 0) {
                tiers[index] = i;
                index++;
            }
        }
    }

    /**
     * @dev Get tier metadata URI
     * @param tierId Tier ID
     * @return metadataUri Metadata URI for the tier
     */
    function getTierMetadata(uint256 tierId) external view returns (string memory metadataUri) {
        return _tierMetadata[tierId];
    }

    /**
     * @dev Update tier metadata URI
     * @param tierId Tier ID
     * @param metadataUri New metadata URI
     */
    function setTierMetadata(uint256 tierId, string calldata metadataUri) external onlyOwner {
        if (tierId < EXPLORER_TIER || tierId > MAX_TIER) {
            revert InvalidTier();
        }
        
        _tierMetadata[tierId] = metadataUri;
        emit TierMetadataUpdated(tierId, metadataUri);
    }

    /**
     * @dev Add or remove controller address
     * @param controller Controller address
     * @param isController_ True to add, false to remove
     */
    function setController(address controller, bool isController_) external onlyOwner {
        _controllers[controller] = isController_;
    }

    /**
     * @dev Check if address is a controller
     * @param controller Address to check
     * @return isController True if address is a controller
     */
    function isController(address controller) external view returns (bool) {
        return _controllers[controller];
    }

    /**
     * @dev Update tier requirements
     * @param tierId Tier ID
     * @param requirement New requirement threshold
     */
    function setTierRequirement(uint256 tierId, uint256 requirement) external onlyOwner {
        if (tierId < EXPLORER_TIER || tierId > MAX_TIER) {
            revert InvalidTier();
        }
        
        tierRequirements[tierId] = requirement;
    }

    /**
     * @dev Override URI function to return tier-specific metadata
     * @param tokenId Token ID (tier ID)
     * @return uri Metadata URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tierMetadata[tokenId];
    }

    /**
     * @dev Override safeTransferFrom to prevent transfers
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        revert BadgeNotTransferable();
    }

    /**
     * @dev Override safeBatchTransferFrom to prevent transfers
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        revert BadgeNotTransferable();
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
