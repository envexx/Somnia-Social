// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PostFeed
 * @dev Manages posts and comments with IPFS content storage
 * @notice ERC-2771 aware for gasless transactions
 */
contract PostFeed is ERC2771Context, Ownable, ReentrancyGuard {
    // Custom errors for gas optimization
    error PostNotFound();
    error Unauthorized();
    error InvalidPostId();
    error ReactionsContractNotSet();
    error OnlyReactionsContract();

    enum Status { ACTIVE, HIDDEN, DELETED }

    struct Post {
        address author;
        uint64 replyTo;        // 0 = post utama; >0 = comment ke postId tsb
        uint64 repostOf;       // 0 untuk bukan repost
        uint64 createdAt;
        Status status;
        uint32 likeCount;
        uint32 repostCount;
        uint32 commentCount;
        string cid;            // CID v1 string -> frontend simpel
    }

    // Events
    event PostCreated(
        uint64 indexed postId, 
        address indexed author, 
        string cid, 
        uint64 replyTo, 
        uint64 repostOf, 
        uint64 createdAt
    );
    event PostStatusChanged(uint64 indexed postId, Status newStatus);
    event PostCountsUpdated(uint64 indexed postId, uint32 likeCount, uint32 repostCount);
    event CommentCountUpdated(uint64 indexed parentId, uint32 commentCount);

    // Storage
    uint64 private _nextPostId = 1;
    mapping(uint64 => Post) private _posts;
    mapping(address => uint64[]) private _userPosts;
    mapping(uint64 => uint64[]) private _commentsOf;
    mapping(uint64 => uint32) private _commentCount;
    
    // Reactions contract address for counter updates
    address public reactionsContract;

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) Ownable() {}

    /**
     * @dev Set the reactions contract address
     * @param _reactionsContract Address of the reactions contract
     */
    function setReactionsContract(address _reactionsContract) external onlyOwner {
        reactionsContract = _reactionsContract;
    }

    /**
     * @dev Create a new post or comment
     * @param cid IPFS CID for post/comment JSON content
     * @param replyTo Post ID being replied to (0 for main posts)
     * @param repostOf Post ID being reposted (0 for original posts)
     * @param user User address (for gasless transactions, use address(0) for regular transactions)
     * @return postId The ID of the created post
     */
    function createPost(
        string calldata cid, 
        uint64 replyTo, 
        uint64 repostOf,
        address user
    ) external nonReentrant returns (uint64 postId) {
        // For gasless transactions, use provided user address
        // For regular transactions, use _msgSender()
        address actualAuthor = user != address(0) ? user : _msgSender();
        
        // Validate replyTo if it's a comment
        if (replyTo > 0) {
            if (_posts[replyTo].author == address(0)) {
                revert PostNotFound();
            }
        }

        // Validate repostOf if it's a repost
        if (repostOf > 0) {
            if (_posts[repostOf].author == address(0)) {
                revert PostNotFound();
            }
        }

        postId = _nextPostId++;
        
        Post memory newPost = Post({
            author: actualAuthor,
            replyTo: replyTo,
            repostOf: repostOf,
            createdAt: uint64(block.timestamp),
            status: Status.ACTIVE,
            likeCount: 0,
            repostCount: 0,
            commentCount: 0,
            cid: cid
        });

        _posts[postId] = newPost;
        _userPosts[actualAuthor].push(postId);

        // If this is a comment, update parent's comment count
        if (replyTo > 0) {
            _posts[replyTo].commentCount++;
            _commentCount[replyTo]++;
            _commentsOf[replyTo].push(postId);
            emit CommentCountUpdated(replyTo, _posts[replyTo].commentCount);
        }

        // If this is a repost, increment the original post's repost count
        if (repostOf > 0) {
            _posts[repostOf].repostCount++;
            emit PostCountsUpdated(repostOf, _posts[repostOf].likeCount, _posts[repostOf].repostCount);
        }

        emit PostCreated(postId, actualAuthor, cid, replyTo, repostOf, newPost.createdAt);
    }

    /**
     * @dev Change post status (hide/delete)
     * @param postId Post ID to update
     * @param newStatus New status for the post
     */
    function setStatus(uint64 postId, Status newStatus) external nonReentrant {
        address user = _msgSender();
        Post storage post = _posts[postId];
        
        if (post.author == address(0)) {
            revert PostNotFound();
        }
        
        if (post.author != user) {
            revert Unauthorized();
        }

        post.status = newStatus;
        emit PostStatusChanged(postId, newStatus);
    }

    /**
     * @dev Increment like count (called by reactions contract)
     * @param postId Post ID to update
     */
    function incrementLike(uint64 postId) external {
        if (msg.sender != reactionsContract) {
            revert OnlyReactionsContract();
        }
        
        Post storage post = _posts[postId];
        if (post.author == address(0)) {
            revert PostNotFound();
        }
        
        post.likeCount++;
        emit PostCountsUpdated(postId, post.likeCount, post.repostCount);
    }

    /**
     * @dev Decrement like count (called by reactions contract)
     * @param postId Post ID to update
     */
    function decrementLike(uint64 postId) external {
        if (msg.sender != reactionsContract) {
            revert OnlyReactionsContract();
        }
        
        Post storage post = _posts[postId];
        if (post.author == address(0)) {
            revert PostNotFound();
        }
        
        if (post.likeCount > 0) {
            post.likeCount--;
            emit PostCountsUpdated(postId, post.likeCount, post.repostCount);
        }
    }

    /**
     * @dev Increment repost count
     * @param postId Post ID to update
     */
    function incrementRepost(uint64 postId) external {
        Post storage post = _posts[postId];
        if (post.author == address(0)) {
            revert PostNotFound();
        }
        
        post.repostCount++;
        emit PostCountsUpdated(postId, post.likeCount, post.repostCount);
    }

    /**
     * @dev Get comment count for a post
     * @param parentId Parent post ID
     * @return count Number of comments
     */
    function commentCount(uint64 parentId) external view returns (uint32 count) {
        return _commentCount[parentId];
    }

    /**
     * @dev Get a single post by ID
     * @param postId Post ID
     * @return post Post struct
     */
    function getPost(uint64 postId) external view returns (Post memory post) {
        post = _posts[postId];
        if (post.author == address(0)) {
            revert PostNotFound();
        }
    }

    /**
     * @dev Get posts by author with pagination
     * @param author Author address
     * @param cursor Starting position (0 for first page)
     * @param limit Maximum number of posts to return
     * @return posts Array of posts
     * @return nextCursor Next cursor position
     */
    function getPostsByAuthor(
        address author, 
        uint256 cursor, 
        uint256 limit
    ) external view returns (Post[] memory posts, uint256 nextCursor) {
        uint64[] memory userPostIds = _userPosts[author];
        uint256 length = userPostIds.length;
        
        if (cursor >= length) {
            return (new Post[](0), cursor);
        }
        
        uint256 end = cursor + limit;
        if (end > length) {
            end = length;
        }
        
        uint256 resultLength = end - cursor;
        posts = new Post[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            posts[i] = _posts[userPostIds[cursor + i]];
        }
        
        nextCursor = end;
    }

    /**
     * @dev Get comments for a post with pagination
     * @param parentId Parent post ID
     * @param cursor Starting position (0 for first page)
     * @param limit Maximum number of comments to return
     * @return comments Array of comments
     * @return nextCursor Next cursor position
     */
    function getComments(
        uint64 parentId, 
        uint256 cursor, 
        uint256 limit
    ) external view returns (Post[] memory comments, uint256 nextCursor) {
        uint64[] memory commentIds = _commentsOf[parentId];
        uint256 length = commentIds.length;
        
        if (cursor >= length) {
            return (new Post[](0), cursor);
        }
        
        uint256 end = cursor + limit;
        if (end > length) {
            end = length;
        }
        
        uint256 resultLength = end - cursor;
        comments = new Post[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            comments[i] = _posts[commentIds[cursor + i]];
        }
        
        nextCursor = end;
    }

    /**
     * @dev Get latest posts with pagination
     * @param cursor Starting position (0 for first page)
     * @param limit Maximum number of posts to return
     * @return posts Array of posts
     * @return nextCursor Next cursor position
     */
    function latest(
        uint256 cursor, 
        uint256 limit
    ) external view returns (Post[] memory posts, uint256 nextCursor) {
        uint256 totalPosts = _nextPostId - 1;
        
        if (cursor >= totalPosts) {
            return (new Post[](0), cursor);
        }
        
        uint256 end = cursor + limit;
        if (end > totalPosts) {
            end = totalPosts;
        }
        
        uint256 resultLength = end - cursor;
        posts = new Post[](resultLength);
        
        // Return posts in reverse chronological order (newest first)
        for (uint256 i = 0; i < resultLength; i++) {
            uint64 postId = uint64(totalPosts - cursor - i);
            posts[i] = _posts[postId];
        }
        
        nextCursor = end;
    }

    /**
     * @dev Get total number of posts created
     * @return count Total post count
     */
    function getTotalPosts() external view returns (uint64 count) {
        return _nextPostId - 1;
    }

    /**
     * @dev Get user's post count
     * @param author Author address
     * @return count Number of posts by author
     */
    function getUserPostCount(address author) external view returns (uint32 count) {
        return uint32(_userPosts[author].length);
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
