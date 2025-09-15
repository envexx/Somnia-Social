// Frontend Integration Examples for Somnia Social
// This file shows how to integrate with the smart contracts from a frontend application

import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';

// Contract ABIs (simplified for example)
const PROFILE_REGISTRY_ABI = [
  "function createProfile(string calldata usernameLower, string calldata profileCid) external",
  "function getProfileByOwner(address owner) external view returns (uint64 userId, address ownerAddr, bytes32 handleHash, string memory profileCid)",
  "function hasProfile(address owner) external view returns (bool hasProfile)"
];

const POST_FEED_ABI = [
  "function createPost(string calldata cid, uint64 replyTo, uint64 repostOf) external returns (uint64 postId)",
  "function getPost(uint64 postId) external view returns (tuple(address author, uint64 replyTo, uint64 repostOf, uint64 createdAt, uint8 status, uint32 likeCount, uint32 repostCount, uint32 commentCount, string cid) post)",
  "function latest(uint256 cursor, uint256 limit) external view returns (tuple(address author, uint64 replyTo, uint64 repostOf, uint64 createdAt, uint8 status, uint32 likeCount, uint32 repostCount, uint32 commentCount, string cid)[] posts, uint256 nextCursor)"
];

const REACTIONS_ABI = [
  "function toggleLike(uint64 postId) external",
  "function hasLiked(uint64 postId, address user) external view returns (bool liked)"
];

const BADGES_ABI = [
  "function tierOf(address user) external view returns (uint256 tierId)",
  "function getUserTiers(address user) external view returns (uint256[] tiers)"
];

const BATCH_RELAYER_ABI = [
  "function relayBatch(address user, tuple(address target, uint256 value, bytes data)[] calls, uint256 userNonce, uint256 deadline, bytes calldata userSig) external",
  "function getUserNonce(address user) external view returns (uint256 currentNonce)"
];

// IPFS client setup
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`
    ).toString('base64')}`
  }
});

// Contract addresses (from deployment)
const CONTRACT_ADDRESSES = {
  ProfileRegistry: "0x...",
  PostFeed: "0x...",
  Reactions: "0x...",
  Badges: "0x...",
  BatchRelayer: "0x..."
};

class SomniaSocialClient {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.userAddress = signer.getAddress();
    
    // Initialize contracts
    this.profileRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.ProfileRegistry,
      PROFILE_REGISTRY_ABI,
      signer
    );
    
    this.postFeed = new ethers.Contract(
      CONTRACT_ADDRESSES.PostFeed,
      POST_FEED_ABI,
      signer
    );
    
    this.reactions = new ethers.Contract(
      CONTRACT_ADDRESSES.Reactions,
      REACTIONS_ABI,
      signer
    );
    
    this.badges = new ethers.Contract(
      CONTRACT_ADDRESSES.Badges,
      BADGES_ABI,
      signer
    );
    
    this.batchRelayer = new ethers.Contract(
      CONTRACT_ADDRESSES.BatchRelayer,
      BATCH_RELAYER_ABI,
      signer
    );
  }

  // IPFS Helper Functions
  async uploadToIPFS(content) {
    try {
      const result = await ipfs.add(JSON.stringify(content));
      return `ipfs://${result.path}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  async fetchFromIPFS(cid) {
    try {
      const cidWithoutPrefix = cid.replace('ipfs://', '');
      const chunks = [];
      
      for await (const chunk of ipfs.cat(cidWithoutPrefix)) {
        chunks.push(chunk);
      }
      
      const content = Buffer.concat(chunks).toString();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw error;
    }
  }

  // Profile Functions
  async createProfile(profileData) {
    try {
      // Upload profile to IPFS
      const profileCid = await this.uploadToIPFS(profileData);
      
      // Create profile on-chain
      const tx = await this.profileRegistry.createProfile(
        profileData.username.toLowerCase(),
        profileCid
      );
      
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async getProfile(address) {
    try {
      const profile = await this.profileRegistry.getProfileByOwner(address);
      const profileData = await this.fetchFromIPFS(profile.profileCid);
      return {
        ...profile,
        data: profileData
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async hasProfile(address) {
    try {
      return await this.profileRegistry.hasProfile(address);
    } catch (error) {
      console.error('Error checking profile:', error);
      return false;
    }
  }

  // Post Functions
  async createPost(postData, replyTo = 0, repostOf = 0) {
    try {
      // Upload post to IPFS
      const postCid = await this.uploadToIPFS(postData);
      
      // Create post on-chain
      const tx = await this.postFeed.createPost(postCid, replyTo, repostOf);
      const receipt = await tx.wait();
      
      // Extract post ID from event
      const event = receipt.events.find(e => e.event === 'PostCreated');
      const postId = event.args.postId;
      
      return { tx, postId };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPost(postId) {
    try {
      const post = await this.postFeed.getPost(postId);
      const postData = await this.fetchFromIPFS(post.cid);
      return {
        ...post,
        data: postData
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  async getLatestPosts(cursor = 0, limit = 10) {
    try {
      const { posts, nextCursor } = await this.postFeed.latest(cursor, limit);
      
      // Fetch IPFS data for all posts
      const postsWithData = await Promise.all(
        posts.map(async (post) => {
          const postData = await this.fetchFromIPFS(post.cid);
          return {
            ...post,
            data: postData
          };
        })
      );
      
      return { posts: postsWithData, nextCursor };
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      throw error;
    }
  }

  // Reaction Functions
  async toggleLike(postId) {
    try {
      const tx = await this.reactions.toggleLike(postId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  async hasLiked(postId, userAddress = this.userAddress) {
    try {
      return await this.reactions.hasLiked(postId, userAddress);
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  // Badge Functions
  async getUserTiers(userAddress = this.userAddress) {
    try {
      const tiers = await this.badges.getUserTiers(userAddress);
      return tiers;
    } catch (error) {
      console.error('Error fetching user tiers:', error);
      return [];
    }
  }

  async getHighestTier(userAddress = this.userAddress) {
    try {
      const tier = await this.badges.tierOf(userAddress);
      return tier;
    } catch (error) {
      console.error('Error fetching highest tier:', error);
      return 0;
    }
  }

  // Batch Functions (EIP-712)
  async createBatchExecution(calls, deadline = Math.floor(Date.now() / 1000) + 3600) {
    try {
      const nonce = await this.batchRelayer.getUserNonce(this.userAddress);
      
      const batchExecution = {
        user: this.userAddress,
        calls: calls,
        nonce: nonce,
        deadline: deadline
      };
      
      return batchExecution;
    } catch (error) {
      console.error('Error creating batch execution:', error);
      throw error;
    }
  }

  async signBatchExecution(batchExecution) {
    try {
      // EIP-712 domain
      const domain = {
        name: 'BatchRelayer',
        version: '1',
        chainId: 50312, // Somnia testnet
        verifyingContract: CONTRACT_ADDRESSES.BatchRelayer
      };
      
      // EIP-712 types
      const types = {
        BatchExecution: [
          { name: 'user', type: 'address' },
          { name: 'calls', type: 'Call[]' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ],
        Call: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' }
        ]
      };
      
      const signature = await this.signer._signTypedData(domain, types, batchExecution);
      return signature;
    } catch (error) {
      console.error('Error signing batch execution:', error);
      throw error;
    }
  }

  // Example: Create profile and post in one batch
  async createProfileAndPost(profileData, postData) {
    try {
      // Upload both to IPFS
      const profileCid = await this.uploadToIPFS(profileData);
      const postCid = await this.uploadToIPFS(postData);
      
      // Create batch calls
      const calls = [
        {
          target: CONTRACT_ADDRESSES.ProfileRegistry,
          value: 0,
          data: this.profileRegistry.interface.encodeFunctionData(
            'createProfile',
            [profileData.username.toLowerCase(), profileCid]
          )
        },
        {
          target: CONTRACT_ADDRESSES.PostFeed,
          value: 0,
          data: this.postFeed.interface.encodeFunctionData(
            'createPost',
            [postCid, 0, 0]
          )
        }
      ];
      
      // Create and sign batch execution
      const batchExecution = await this.createBatchExecution(calls);
      const signature = await this.signBatchExecution(batchExecution);
      
      // Execute batch (this would be called by the sponsor wallet)
      const tx = await this.batchRelayer.relayBatch(
        batchExecution.user,
        batchExecution.calls,
        batchExecution.nonce,
        batchExecution.deadline,
        signature
      );
      
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error creating profile and post batch:', error);
      throw error;
    }
  }
}

// Usage Examples
export const exampleUsage = async () => {
  // Initialize provider and signer
  const provider = new ethers.providers.JsonRpcProvider('https://dream-rpc.somnia.network');
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Create client
  const somniaClient = new SomniaSocialClient(provider, signer);
  
  // Example 1: Create profile
  const profileData = {
    version: 1,
    username: "testuser",
    displayName: "Test User",
    avatar: "ipfs://bafy...avatar.png",
    bio: "Hello Somnia!",
    createdAt: Math.floor(Date.now() / 1000)
  };
  
  await somniaClient.createProfile(profileData);
  
  // Example 2: Create post
  const postData = {
    version: 1,
    type: "post",
    text: "Hello Somnia! 🚀",
    images: [],
    embeds: [],
    author: signer.address,
    createdAt: Math.floor(Date.now() / 1000)
  };
  
  const { postId } = await somniaClient.createPost(postData);
  
  // Example 3: Like post
  await somniaClient.toggleLike(postId);
  
  // Example 4: Get latest posts
  const { posts } = await somniaClient.getLatestPosts(0, 10);
  console.log('Latest posts:', posts);
};

export default SomniaSocialClient;
