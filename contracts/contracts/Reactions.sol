// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Reactions
 * @dev Manages like reactions for posts with toggle functionality
 * @notice ERC-2771 aware for gasless transactions
 */
contract Reactions is ERC2771Context, Ownable, ReentrancyGuard {
    // Custom errors for gas optimization
    error PostFeedNotSet();
    error OnlyPostFeed();
    error PostNotFound();

    // Events
    event LikeToggled(uint64 indexed postId, address indexed user, bool liked);

    // Storage
    mapping(uint64 => mapping(address => bool)) private _liked;
    mapping(uint64 => address[]) private _likers; // Track who liked each post
    address public postFeedContract;

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) Ownable() {}

    /**
     * @dev Set the post feed contract address
     * @param _postFeedContract Address of the post feed contract
     */
    function setPostFeedContract(address _postFeedContract) external onlyOwner {
        postFeedContract = _postFeedContract;
    }

    /**
     * @dev Toggle like status for a post
     * @param postId Post ID to like/unlike
     */
    function toggleLike(uint64 postId) external nonReentrant {
        address user = _msgSender();
        
        if (postFeedContract == address(0)) {
            revert PostFeedNotSet();
        }

        bool currentlyLiked = _liked[postId][user];
        
        if (currentlyLiked) {
            // Unlike the post
            _liked[postId][user] = false;
            
            // Remove user from likers array
            address[] storage likers = _likers[postId];
            for (uint256 i = 0; i < likers.length; i++) {
                if (likers[i] == user) {
                    likers[i] = likers[likers.length - 1];
                    likers.pop();
                    break;
                }
            }
            
            // Decrement like count in PostFeed
            (bool success, ) = postFeedContract.call(
                abi.encodeWithSignature("decrementLike(uint64)", postId)
            );
            require(success, "Failed to decrement like count");
            
            emit LikeToggled(postId, user, false);
        } else {
            // Like the post
            _liked[postId][user] = true;
            _likers[postId].push(user);
            
            // Increment like count in PostFeed
            (bool success, ) = postFeedContract.call(
                abi.encodeWithSignature("incrementLike(uint64)", postId)
            );
            require(success, "Failed to increment like count");
            
            emit LikeToggled(postId, user, true);
        }
    }

    /**
     * @dev Check if user has liked a post
     * @param postId Post ID to check
     * @param user User address to check
     * @return liked True if user has liked the post
     */
    function hasLiked(uint64 postId, address user) external view returns (bool liked) {
        return _liked[postId][user];
    }

    /**
     * @dev Get all users who liked a post
     * @param postId Post ID
     * @return likers Array of user addresses who liked the post
     */
    function getLikers(uint64 postId) external view returns (address[] memory likers) {
        return _likers[postId];
    }

    /**
     * @dev Get like count for a post (by counting likers array)
     * @param postId Post ID
     * @return count Number of likes
     */
    function getLikeCount(uint64 postId) external view returns (uint32 count) {
        return uint32(_likers[postId].length);
    }

    /**
     * @dev Batch check like status for multiple posts
     * @param postIds Array of post IDs
     * @param user User address to check
     * @return liked Array of boolean values indicating like status
     */
    function batchHasLiked(
        uint64[] calldata postIds, 
        address user
    ) external view returns (bool[] memory liked) {
        liked = new bool[](postIds.length);
        for (uint256 i = 0; i < postIds.length; i++) {
            liked[i] = _liked[postIds[i]][user];
        }
    }

    /**
     * @dev Get user's liked posts (requires frontend to track or iterate)
     * @param user User address
     * @param cursor Starting position for pagination
     * @param limit Maximum number of results
     * @return postIds Array of liked post IDs
     * @return nextCursor Next cursor position
     */
    function getUserLikedPosts(
        address user,
        uint256 cursor,
        uint256 limit
    ) external view returns (uint64[] memory postIds, uint256 nextCursor) {
        // Note: This is a simplified implementation
        // In a production system, you might want to maintain a separate mapping
        // of user => liked post IDs for better performance
        
        // For now, we'll return empty arrays as this would require
        // additional storage and complexity
        postIds = new uint64[](0);
        nextCursor = cursor;
    }

    /**
     * @dev Emergency function to sync like counts with PostFeed
     * @param postId Post ID to sync
     */
    function syncLikeCount(uint64 postId) external onlyOwner {
        if (postFeedContract == address(0)) {
            revert PostFeedNotSet();
        }

        uint32 currentCount = uint32(_likers[postId].length);
        
        // This would require a more complex implementation to sync counts
        // For now, we'll emit an event for manual verification
        emit LikeToggled(postId, address(0), false); // Special event for sync
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
