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
  ProfileRegistry: '0x6F84bfb8Ef32ec20016AcD8A53F28e75FD5d2101',
  PostFeed: '0x3feeF59e911f0B2cC641711AAf7fB20F5DE7331A',
  Reactions: '0xdE8abe80D03Aa65E8683AA4eEdFa0690B3408d7F',
  Badges: '0xf0F39Fd073De8bf6AEDB9B54f36f62af32ce8a19',
  BatchRelayer: '0xC7cFc7a96150816176C44F0CcD1066a781CEEB82',
  TrustedForwarder: '0xbD33c607d68de499cA76d4F6187ef1e43a094e9C',
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
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
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
        "internalType": "uint256",
        "name": "userId",
        "type": "uint256"
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
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
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
    "inputs": [
      {
        "internalType": "uint64",
        "name": "parentId",
        "type": "uint64"
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
    "name": "getComments",
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
        "name": "comments",
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
        "name": "parentId",
        "type": "uint64"
      }
    ],
    "name": "commentCount",
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
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
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
      },
      {
        "internalType": "uint256",
        "name": "tierId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "grantTier",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      },
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "revokeTier",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "assignBeginnerBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
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

export const BATCH_RELAYER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct BatchRelayer.Call[]",
        "name": "calls",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256",
        "name": "userNonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "userSig",
        "type": "bytes"
      }
    ],
    "name": "relayBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "nonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sponsor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allowedTargets",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
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
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "callCount",
        "type": "uint256"
      }
    ],
    "name": "BatchExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "name": "TargetAllowed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldSponsor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newSponsor",
        "type": "address"
      }
    ],
    "name": "SponsorUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "callIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "returnData",
        "type": "bytes"
      }
    ],
    "name": "CallFailed",
    "type": "event"
  }
] as const

export const TRUSTED_FORWARDER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct MinimalForwarder.ForwardRequest",
        "name": "req",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "execute",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      }
    ],
    "name": "getNonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct MinimalForwarder.ForwardRequest",
        "name": "req",
        "type": "tuple"
      }
    ],
    "name": "verify",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const