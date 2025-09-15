// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title BatchRelayer
 * @dev Enables gasless batch transactions with EIP-712 signatures
 * @notice Allows sponsor wallet to execute multiple user actions in one transaction
 */
contract BatchRelayer is ERC2771Context, Ownable, ReentrancyGuard, EIP712 {
    // Custom errors for gas optimization
    error OnlySponsor();
    error Expired();
    error BadNonce();
    error InvalidSignature();
    error TargetNotAllowed();

    // EIP-712 type hash for batch execution
    bytes32 private constant BATCH_TYPEHASH = keccak256(
        "BatchExecution(address user,Call[] calls,uint256 nonce,uint256 deadline)Call(address target,uint256 value,bytes data)"
    );
    
    bytes32 private constant CALL_TYPEHASH = keccak256(
        "Call(address target,uint256 value,bytes data)"
    );

    struct Call {
        address target;
        uint256 value;
        bytes data;
    }

    struct BatchExecution {
        address user;
        Call[] calls;
        uint256 nonce;
        uint256 deadline;
    }

    // Events
    event BatchExecuted(address indexed user, uint256 indexed nonce, uint256 callCount);
    event TargetAllowed(address indexed target, bool allowed);
    event SponsorUpdated(address indexed oldSponsor, address indexed newSponsor);
    event CallFailed(uint256 callIndex, bytes returnData);

    // Storage
    address public sponsor; // Wallet that pays for gas
    mapping(address => uint256) public nonce; // Nonce per user (anti-replay)
    mapping(address => bool) public allowedTargets; // Whitelist of allowed contract addresses

    constructor(
        address trustedForwarder,
        address _sponsor
    ) 
        ERC2771Context(trustedForwarder) 
        Ownable()
        EIP712("BatchRelayer", "1")
    {
        sponsor = _sponsor;
    }

    /**
     * @dev Execute batch of calls on behalf of a user
     * @param user User address (signer of the batch)
     * @param calls Array of calls to execute
     * @param userNonce User's nonce for this batch
     * @param deadline Deadline for batch execution
     * @param userSig User's EIP-712 signature
     */
    function relayBatch(
        address user,
        Call[] calldata calls,
        uint256 userNonce,
        uint256 deadline,
        bytes calldata userSig
    ) external nonReentrant {
        if (msg.sender != sponsor) {
            revert OnlySponsor();
        }
        
        if (block.timestamp > deadline) {
            revert Expired();
        }
        
        if (userNonce != nonce[user]) {
            revert BadNonce();
        }

        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(
            BATCH_TYPEHASH,
            user,
            _hashCalls(calls),
            userNonce,
            deadline
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, userSig);
        
        if (signer != user) {
            revert InvalidSignature();
        }

        // Increment nonce
        nonce[user]++;

        // Execute all calls
        for (uint256 i = 0; i < calls.length; i++) {
            Call calldata call = calls[i];
            
            // Check if target is allowed
            if (!allowedTargets[call.target]) {
                revert TargetNotAllowed();
            }

            (bool success, bytes memory returnData) = call.target.call{value: call.value}(call.data);
            
            if (!success) {
                // Log the failure but continue with other calls
                // In production, you might want to revert or handle this differently
                emit CallFailed(i, returnData);
            }
        }

        emit BatchExecuted(user, userNonce, calls.length);
    }

    /**
     * @dev Hash array of calls for EIP-712
     * @param calls Array of calls
     * @return hash Hash of the calls array
     */
    function _hashCalls(Call[] calldata calls) internal pure returns (bytes32 hash) {
        bytes32[] memory callHashes = new bytes32[](calls.length);
        
        for (uint256 i = 0; i < calls.length; i++) {
            callHashes[i] = keccak256(abi.encode(
                CALL_TYPEHASH,
                calls[i].target,
                calls[i].value,
                keccak256(calls[i].data)
            ));
        }
        
        hash = keccak256(abi.encodePacked(callHashes));
    }

    /**
     * @dev Add or remove allowed target contract
     * @param target Contract address
     * @param allowed Whether the target is allowed
     */
    function setAllowedTarget(address target, bool allowed) external onlyOwner {
        allowedTargets[target] = allowed;
        emit TargetAllowed(target, allowed);
    }

    /**
     * @dev Batch set allowed targets
     * @param targets Array of contract addresses
     * @param allowed Array of allowed statuses
     */
    function batchSetAllowedTargets(
        address[] calldata targets,
        bool[] calldata allowed
    ) external onlyOwner {
        require(targets.length == allowed.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < targets.length; i++) {
            allowedTargets[targets[i]] = allowed[i];
            emit TargetAllowed(targets[i], allowed[i]);
        }
    }

    /**
     * @dev Update sponsor address
     * @param newSponsor New sponsor address
     */
    function setSponsor(address newSponsor) external onlyOwner {
        address oldSponsor = sponsor;
        sponsor = newSponsor;
        emit SponsorUpdated(oldSponsor, newSponsor);
    }

    /**
     * @dev Get user's current nonce
     * @param user User address
     * @return currentNonce Current nonce for the user
     */
    function getUserNonce(address user) external view returns (uint256 currentNonce) {
        return nonce[user];
    }

    /**
     * @dev Check if target is allowed
     * @param target Contract address to check
     * @return isAllowed True if target is allowed
     */
    function isTargetAllowed(address target) external view returns (bool isAllowed) {
        return allowedTargets[target];
    }

    /**
     * @dev Get domain separator for EIP-712
     * @return separator Domain separator
     */
    function getDomainSeparator() external view returns (bytes32 separator) {
        return _domainSeparatorV4();
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

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
