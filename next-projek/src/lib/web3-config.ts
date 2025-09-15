import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Somnia Social',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, polygon, arbitrum, optimism],
  ssr: true,
})

// Somnia Testnet Configuration
export const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://somnia-testnet.socialscan.io',
    },
  },
  testnet: true,
}

// Contract Addresses (Deployed on Somnia Testnet)
export const CONTRACT_ADDRESSES = {
  ProfileRegistry: '0x6d875afD94B7B133083177De3d805Fa65A50557B',
  PostFeed: '0xCbfCb1152880Efae5838e9c99dED04F41A819de5',
  Reactions: '0x5531df40f1a0A8BbC4246eBaE35b41a21143f566',
  Badges: '0xb0E6dc49D425db0E7EF19378A635441d4cB1714f',
  BatchRelayer: '0xB61dA5F9ED4c13C130BD33039d8D6583C50cd17d',
  TrustedForwarder: '0x2E8Fe3b78E82179210d25339BB72e34481739D72',
}

// Contract ABIs (Updated for deployed contracts)
export const PROFILE_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "usernameLower",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "profileCid",
        "type": "string"
      }
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "userId",
        "type": "uint64"
      },
      {
        "internalType": "string",
        "name": "profileCid",
        "type": "string"
      }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "getProfileByOwner",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "userId",
        "type": "uint64"
      },
      {
        "internalType": "address",
        "name": "ownerAddr",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "handleHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "profileCid",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "userId",
        "type": "uint64"
      }
    ],
    "name": "getProfileById",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "userId",
            "type": "uint64"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "handleHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "profileCid",
            "type": "string"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "updatedAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct ProfileRegistry.Profile",
        "name": "profile",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "hasProfile",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasProfile",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalProfiles",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "total",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "usernameLower",
        "type": "string"
      }
    ],
    "name": "isHandleAvailable",
    "outputs": [
      {
        "internalType": "bool",
        "name": "available",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "userId",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "handleHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "profileCid",
        "type": "string"
      }
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "userId",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "profileCid",
        "type": "string"
      }
    ],
    "name": "ProfileUpdated",
    "type": "event"
  }
] as const

export const POST_FEED_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "uint64",
        "name": "replyTo",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "repostOf",
        "type": "uint64"
      }
    ],
    "name": "createPost",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      }
    ],
    "name": "getPost",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "replyTo",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "repostOf",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint8",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "likeCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "repostCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "commentCount",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          }
        ],
        "internalType": "struct PostFeed.Post",
        "name": "post",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cursor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "latest",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "replyTo",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "repostOf",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "uint8",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "likeCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "repostCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "commentCount",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          }
        ],
        "internalType": "struct PostFeed.Post[]",
        "name": "posts",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256",
        "name": "nextCursor",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPosts",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "total",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      }
    ],
    "name": "getUserPostCount",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "count",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "cursor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getPostsByAuthor",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "replyTo",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "repostOf",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "createdAt",
            "type": "uint64"
          },
          {
            "internalType": "enum PostFeed.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "likeCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "repostCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "commentCount",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          }
        ],
        "internalType": "struct PostFeed.Post[]",
        "name": "posts",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256",
        "name": "nextCursor",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "likeCount",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "repostCount",
        "type": "uint32"
      }
    ],
    "name": "updatePostCounts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "parentId",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "commentCount",
        "type": "uint32"
      }
    ],
    "name": "updateCommentCount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "replyTo",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "repostOf",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "createdAt",
        "type": "uint64"
      }
    ],
    "name": "PostCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "likeCount",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "repostCount",
        "type": "uint32"
      }
    ],
    "name": "PostCountsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "parentId",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "commentCount",
        "type": "uint32"
      }
    ],
    "name": "CommentCountUpdated",
    "type": "event"
  }
] as const

export const REACTIONS_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      }
    ],
    "name": "toggleLike",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      }
    ],
    "name": "toggleRepost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "hasLiked",
    "outputs": [
      {
        "internalType": "bool",
        "name": "liked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "hasReposted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "reposted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      }
    ],
    "name": "getLikeCount",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "count",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      }
    ],
    "name": "getReactionCounts",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "likeCount",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "repostCount",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "postId",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reactionType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "ReactionToggled",
    "type": "event"
  }
] as const

export const BADGES_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserTiers",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "tiers",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "tierOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      }
    ],
    "name": "getTierMetadata",
    "outputs": [
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      }
    ],
    "name": "mintTier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      }
    ],
    "name": "TierMinted",
    "type": "event"
  }
] as const

export const FOLLOW_GRAPH_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "follow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "unfollow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "follower",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "isFollowing",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isFollowing",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "cursor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getFollowers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "followers",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "nextCursor",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "cursor",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getFollowing",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "following",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "nextCursor",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "getFollowerCount",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "count",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getFollowingCount",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "count",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "follower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isFollowing",
        "type": "bool"
      }
    ],
    "name": "FollowToggled",
    "type": "event"
  }
] as const
