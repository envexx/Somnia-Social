<div align="center">
  <img src="next-projek/src/app/somnia social.png" alt="Somnia Social Logo" width="200" height="200">
  <h1>🌟 Somnia Social - Decentralized Social Media Platform</h1>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built for Somnia](https://img.shields.io/badge/Built%20for-Somnia-blue)](https://somnia.network)
[![Web3](https://img.shields.io/badge/Web3-Enabled-green)](https://web3.storage)
[![Gasless](https://img.shields.io/badge/Gasless-Transactions-orange)](https://eips.ethereum.org/EIPS/eip-2771)

> **A fully decentralized, gasless social media platform built entirely on Somnia Network with IPFS storage, featuring profiles, posts, reactions, badges, and batch transactions.**

## 🎯 Project Overview

Somnia Social is a revolutionary decentralized social media platform that leverages Somnia Network's high-performance capabilities to deliver a seamless Web3 social experience. Built entirely on-chain with gasless transactions, it combines the best of traditional social media with the power of blockchain technology.

### 🏆 Hackathon Submission

This project is submitted for the **Somnia DeFi Mini Hackathon** (August 13 - September 12, 2025), competing for $15,000 in prizes across multiple tracks.

## ✨ Key Features

### 🔐 **Decentralized Identity**
- **Unique Username System**: Claim your unique handle on-chain
- **IPFS Profile Storage**: Decentralized profile data with avatar, bio, and social links
- **Non-transferable Profiles**: Secure ownership tied to wallet addresses

### 📝 **Content Management**
- **Gasless Posting**: Create posts and comments without gas fees
- **IPFS Content Storage**: All content stored decentralized with on-chain pointers
- **Rich Media Support**: Images and multimedia content support
- **Real-time Feed**: Live updates with optimized pagination

### ❤️ **Social Interactions**
- **Like System**: Toggle likes with real-time counter synchronization
- **Comment Threading**: Nested comment system with reply functionality
- **Share & Bookmark**: Social sharing and content saving features

### 🏅 **Achievement System**
- **Tiered Badge System**: 4-tier achievement system (Explorer, Influencer, Leader, Legend)
- **NFT Badges**: ERC-1155 non-transferable achievement tokens - these are the NFTs that represent your social status
- **Automatic Progression**: Badges awarded based on activity metrics and community engagement
- **Visual Identity**: Each badge tier has unique colors and icons displayed across the platform

### ⚡ **Advanced Features**
- **Batch Transactions**: Multiple actions in a single gasless transaction
- **EIP-712 Signatures**: Secure meta-transaction signing
- **Real-time Updates**: Live feed updates and notifications
- **Responsive Design**: Mobile-first, dark/light mode support

## 🏗️ Architecture

### Smart Contract Layer
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ProfileRegistry │    │    PostFeed     │    │   Reactions     │
│                 │    │                 │    │                 │
│ • Unique handles │    │ • Post creation │    │ • Like toggles  │
│ • IPFS profiles  │    │ • Comments      │    │ • Count sync    │
│ • User metadata  │    │ • Feed queries  │    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Badges      │    │  BatchRelayer   │    │TrustedForwarder│
│                 │    │                 │    │                 │
│ • ERC-1155      │    │ • Gasless batch │    │ • Meta-tx       │
│ • 4-tier system │    │ • EIP-712 sigs  │    │ • ERC-2771     │
│ • Non-transfer  │    │ • Multi-action  │    │ • Sponsor tx    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Wagmi/Web3    │    │   IPFS Storage  │
│                 │    │                 │    │                 │
│ • React 19      │    │ • Wallet conn   │    │ • Web3.Storage  │
│ • TypeScript    │    │ • Contract int  │    │ • Content CDN   │
│ • Tailwind CSS  │    │ • Real-time     │    │ • Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Git
- MetaMask or compatible Web3 wallet
- Somnia testnet ETH (get from [faucet](https://faucet.somnia.network))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/envexx/Somnia-Social.git
cd Somnia-Social
```

2. **Install smart contract dependencies**
```bash
cd contracts
npm install
```

3. **Install frontend dependencies**
```bash
cd ../next-projek
npm install
```

4. **Configure environment variables**
```bash
# Copy example environment files
cp contracts/env.example contracts/.env
cp next-projek/env.example next-projek/.env.local

# Edit the files with your configuration
```

5. **Deploy smart contracts**
```bash
cd contracts
npm run deploy:somnia
```

6. **Start the frontend**
```bash
cd ../next-projek
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📋 Smart Contracts

### Contract Addresses (Somnia Testnet)
| Contract | Address | Purpose |
|----------|---------|---------|
| ProfileRegistry | `0x6F84bfb8Ef32ec20016AcD8A53F28e75FD5d2101` | User profile management |
| PostFeed | `0x3feeF59e911f0B2cC641711AAf7fB20F5DE7331A` | Post and comment system |
| Reactions | `0xdE8abe80D03Aa65E8683AA4eEdFa0690B3408d7F` | Like and reaction system |
| Badges | `0xf0F39Fd073De8bf6AEDB9B54f36f62af32ce8a19` | Achievement badge system |
| BatchRelayer | `0xC7cFc7a96150816176C44F0CcD1066a781CEEB82` | Gasless batch transactions |
| TrustedForwarder | `0xbD33c607d68de499cA76d4F6187ef1e43a094e9C` | Meta-transaction forwarder |

### Key Contract Features

#### ProfileRegistry
- Unique username registration
- IPFS profile data storage
- Profile ownership management
- Username availability checking

#### PostFeed
- Post creation with IPFS content
- Comment threading system
- Paginated feed queries
- Real-time post updates

#### Reactions
- Like toggle functionality
- Real-time counter synchronization
- User reaction tracking
- Post engagement metrics

#### Badges
- **NFT Achievement System**: ERC-1155 non-transferable tokens that serve as your social status NFTs
- **4-tier System**: Explorer, Influencer, Leader, Legend progression
- **Activity-based Rewards**: Badges earned through posts, likes, and community engagement
- **Visual Recognition**: Unique icons and colors displayed across profile, feed, and sidebar

#### BatchRelayer
- Gasless batch transaction execution
- EIP-712 signature verification
- Multi-action transaction support
- Sponsor transaction handling

## 🔧 Technical Implementation

### IPFS Integration
All content is stored on IPFS using Web3.Storage, ensuring decentralization and censorship resistance:

```typescript
// Profile data structure
interface ProfileData {
  version: number
  username: string
  displayName: string
  avatar?: string
  banner?: string
  bio?: string
  location?: string
  links?: {
    x?: string
    github?: string
    website?: string
    discord?: string
  }
  createdAt: number
  updatedAt: number
}

// Post data structure
interface PostData {
  version: number
  type: 'post' | 'comment'
  text: string
  images?: string[]
  embeds?: any[]
  author: string
  createdAt: number
}
```

### Gasless Transactions
The platform implements gasless transactions using EIP-2771 meta-transactions:

```typescript
// Batch transaction example
const calls = [
  {
    target: postFeedAddress,
    value: 0,
    data: postFeed.interface.encodeFunctionData('createPost', [postCid, 0, 0])
  },
  {
    target: reactionsAddress,
    value: 0,
    data: reactions.interface.encodeFunctionData('toggleLike', [postId])
  }
]

// User signs EIP-712 batch
const signature = await signBatchExecution(calls, nonce, deadline)

// Sponsor executes batch
await batchRelayer.relayBatch(user, calls, nonce, deadline, signature)
```

### Real-time Updates
The frontend implements real-time updates using contract event listeners and React hooks:

```typescript
// Custom hooks for contract interaction
const { createPost, latestPosts, refetchLatestPosts } = usePostContract()
const { toggleLike, hasLiked } = useReactionsContract()
const { userProfile, createProfile } = useProfileContract()
```

## 🎨 User Interface

### Design Features
- **Modern UI**: Clean, intuitive interface inspired by popular social platforms
- **Dark/Light Mode**: Automatic theme switching with user preference
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Updates**: Live feed updates and notifications
- **Smooth Animations**: Polished interactions and transitions

### Key Components
- **Feed**: Infinite scroll post feed with real-time updates
- **Profile**: Comprehensive user profile with stats and badges
- **Post Creation**: Rich text editor with image upload
- **Chat System**: Real-time messaging interface
- **Settings**: User preferences and account management

## 🔒 Security Features

### Smart Contract Security
- **Reentrancy Protection**: All contracts use OpenZeppelin's ReentrancyGuard
- **Access Control**: Role-based permissions for admin functions
- **Input Validation**: Comprehensive parameter validation
- **Custom Errors**: Gas-efficient error handling

### Frontend Security
- **Wallet Integration**: Secure Web3 wallet connection
- **Signature Verification**: EIP-712 signature validation
- **Content Validation**: IPFS content verification
- **XSS Protection**: Sanitized content rendering

## 📊 Performance Optimizations

### Smart Contract Optimizations
- **Gas Efficiency**: Optimized storage patterns and function calls
- **Batch Operations**: Multiple actions in single transaction
- **Event Optimization**: Efficient event emission for indexing
- **Storage Packing**: Optimized struct layouts

### Frontend Optimizations
- **React Query**: Efficient data caching and synchronization
- **Virtual Scrolling**: Optimized feed rendering for large datasets
- **Image Optimization**: Lazy loading and compression
- **Bundle Splitting**: Code splitting for faster load times

## 🌐 Network Configuration

### Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network
- **Block Explorer**: https://somnia-testnet.socialscan.io
- **Faucet**: https://faucet.somnia.network

### Supported Wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- Any EIP-1193 compatible wallet

## 📈 Usage Statistics

### Current Metrics
- **Smart Contracts**: 6 deployed contracts
- **Total Gas Used**: Optimized for Somnia's low-cost environment
- **IPFS Storage**: Decentralized content storage
- **User Interactions**: Real-time social features

### Performance Benchmarks
- **Transaction Speed**: Sub-second finality on Somnia
- **Gas Costs**: Near-zero due to gasless transactions
- **Storage Efficiency**: IPFS + on-chain pointer optimization
- **User Experience**: Seamless Web2-like interface

## 🎯 Hackathon Criteria Alignment

### ✅ Creativity & Originality
- **Novel Approach**: First fully gasless social media platform on Somnia
- **Unique Features**: Tiered badge system with ERC-1155 integration
- **Innovation**: Batch transaction system for complex social interactions

### ✅ Technical Excellence
- **Somnia Deployment**: Fully deployed and functional on Somnia testnet
- **Smart Contract Quality**: Gas-optimized, secure, and well-tested
- **Frontend Excellence**: Modern React/Next.js implementation

### ✅ User Experience
- **Intuitive Design**: Familiar social media interface with Web3 enhancements
- **Gasless Experience**: No gas fees for users
- **Real-time Updates**: Live feed and notification system
- **Mobile Responsive**: Works seamlessly on all devices

### ✅ Onchain Impact
- **Fully On-chain**: All core functionality implemented on Somnia
- **Decentralized Storage**: IPFS integration for content storage
- **Smart Contract Logic**: Complex social interactions handled on-chain
- **Meta-transactions**: Gasless user experience

### ✅ Community Fit
- **Somnia Ecosystem**: Built specifically for Somnia's high-performance environment
- **Developer Friendly**: Comprehensive documentation and examples
- **Scalable Architecture**: Designed for mass adoption
- **Open Source**: MIT licensed for community contribution

## 🚀 Future Roadmap

### Phase 1: Core Platform (Current)
- ✅ User profiles and authentication
- ✅ Post creation and feed system
- ✅ Like and reaction system
- ✅ NFT Badge achievement system (4-tier: Explorer, Influencer, Leader, Legend)
- ✅ Gasless transactions

### Phase 2: Enhanced Features
- 🔄 Direct messaging system
- 🔄 Content monetization
- 🔄 NFT profile pictures
- 🔄 Community groups
- 🔄 Advanced analytics

### Phase 3: Ecosystem Integration
- 📋 Somnia token integration
- 📋 Cross-chain compatibility
- 📋 API for third-party developers
- 📋 Mobile applications
- 📋 Enterprise features

## 📁 Project Structure

```
Somnia-Social/
├── contracts/                 # Smart contracts
│   ├── contracts/            # Solidity contracts
│   │   ├── ProfileRegistry.sol
│   │   ├── PostFeed.sol
│   │   ├── Reactions.sol
│   │   ├── Badges.sol
│   │   ├── BatchRelayer.sol
│   │   └── TrustedForwarder.sol
│   ├── scripts/              # Deployment scripts
│   ├── test/                 # Contract tests
│   └── artifacts/            # Compiled contracts
├── next-projek/              # Frontend application
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and configs
│   │   └── styles/           # CSS styles
│   ├── public/               # Static assets
│   └── docs/                 # Documentation
└── README.md                 # This file
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues
- Use GitHub Issues to report bugs
- Provide detailed reproduction steps
- Include system information and logs

### Documentation
- Improve existing documentation
- Add code examples and tutorials
- Translate documentation to other languages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Somnia Network** for providing the high-performance blockchain infrastructure
- **OpenZeppelin** for secure smart contract libraries
- **Web3.Storage** for decentralized content storage
- **Wagmi** and **RainbowKit** for Web3 frontend integration
- **Next.js** and **React** for the modern frontend framework

## 📞 Contact & Support

### Team Information
- **Project**: Somnia Social
- **Hackathon**: Somnia DeFi Mini Hackathon 2025
- **Track**: Social Media & Community

### Repo Links
- **GitHub**: [https://github.com/envexx/Somnia-Social](https://github.com/envexx/Somnia-Social)


### Somnia Community
- **X (Twitter)**: [https://x.com/Somnia_Network](https://x.com/Somnia_Network)
- **Telegram**: [https://t.me/somnianetwork](https://t.me/somnianetwork)
- **Documentation**: [Somnia Docs](https://docs.somnia.network)

---

**Built with ❤️ for the Somnia ecosystem**

*This project represents the future of decentralized social media - where users own their data, content is censorship-resistant, interactions are truly peer-to-peer, and your social achievements are represented as NFTs on the blockchain.*
