# Somnia Social - Deployment Guide

Panduan lengkap untuk deployment smart contract Somnia Social ke Somnia Testnet.

## 📋 Prerequisites

### 1. Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd somnia-social-contracts

# Install dependencies
npm install

# Copy environment file
cp env.example .env
```

### 2. Environment Configuration
Edit file `.env` dengan konfigurasi yang sesuai:

```bash
# Required
PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key
SPONSOR_WALLET_ADDRESS=your_sponsor_wallet_address
```

### 3. Wallet Setup
- Pastikan wallet memiliki cukup ETH untuk deployment
- Private key harus memiliki akses ke Somnia testnet
- Sponsor wallet akan membayar gas untuk batch transactions

## 🚀 Deployment Steps

### Step 1: Compile Contracts
```bash
npm run compile
```

### Step 2: Run Tests
```bash
npm test
```

### Step 3: Deploy to Somnia Testnet
```bash
npm run deploy:somnia
```

### Step 4: Verify Contracts (Optional)
```bash
npm run verify:somnia
```

## 📊 Deployment Output

Setelah deployment berhasil, Anda akan melihat output seperti ini:

```
=== Contract Addresses ===
{
  "TrustedForwarder": "0x...",
  "ProfileRegistry": "0x...",
  "PostFeed": "0x...",
  "Reactions": "0x...",
  "Badges": "0x...",
  "BatchRelayer": "0x...",
  "network": "somnia",
  "chainId": 50312,
  "rpcUrl": "https://dream-rpc.somnia.network",
  "blockExplorer": "https://somnia-testnet.socialscan.io"
}
```

## 🔧 Post-Deployment Setup

### 1. Update Frontend Configuration
Copy alamat kontrak ke file frontend:
```bash
# File akan otomatis tersimpan di:
../frontend/src/contracts/addresses.json
```

### 2. Configure Sponsor Wallet
Pastikan sponsor wallet memiliki cukup ETH untuk membayar gas batch transactions.

### 3. Test Contract Functions
```bash
# Test basic functionality
npm test

# Test gas usage
npm run test:gas
```

## 🧪 Testing Deployment

### 1. Create Test Profile
```javascript
const profileData = {
  version: 1,
  username: "testuser",
  displayName: "Test User",
  avatar: "ipfs://bafy...avatar.png",
  bio: "Hello Somnia!",
  createdAt: Math.floor(Date.now() / 1000)
};

await profileRegistry.createProfile("testuser", profileCid);
```

### 2. Create Test Post
```javascript
const postData = {
  version: 1,
  type: "post",
  text: "Hello Somnia! 🚀",
  images: [],
  embeds: [],
  author: userAddress,
  createdAt: Math.floor(Date.now() / 1000)
};

await postFeed.createPost(postCid, 0, 0);
```

### 3. Test Like Function
```javascript
await reactions.toggleLike(postId);
```

## 🔍 Verification

### 1. Check Contract on Block Explorer
Visit: https://somnia-testnet.socialscan.io

### 2. Verify Contract Functions
```bash
# Check if contracts are properly connected
npx hardhat console --network somnia

# In console:
const profileRegistry = await ethers.getContractAt("ProfileRegistry", "0x...");
await profileRegistry.getTotalProfiles();
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Insufficient funds"
- Pastikan wallet memiliki cukup ETH
- Check gas price dan gas limit

#### 2. "Contract deployment failed"
- Check network connection
- Verify RPC URL
- Check private key format

#### 3. "Transaction reverted"
- Check contract constructor parameters
- Verify OpenZeppelin version compatibility

### Debug Commands
```bash
# Check network connection
npx hardhat console --network somnia

# Check account balance
await ethers.provider.getBalance("0x...");

# Check gas price
await ethers.provider.getGasPrice();
```

## 📈 Gas Optimization

### Estimated Gas Costs
- TrustedForwarder: ~500,000 gas
- ProfileRegistry: ~1,200,000 gas
- PostFeed: ~1,500,000 gas
- Reactions: ~800,000 gas
- Badges: ~1,000,000 gas
- BatchRelayer: ~1,300,000 gas

**Total**: ~6,300,000 gas

### Optimization Tips
1. Use `--optimize` flag during compilation
2. Set appropriate `runs` value in optimizer
3. Use `viaIR: true` for better optimization
4. Deploy during low network congestion

## 🔐 Security Checklist

- [ ] Private key tidak disimpan di repository
- [ ] Environment variables properly configured
- [ ] Contracts verified on block explorer
- [ ] Sponsor wallet properly configured
- [ ] BatchRelayer targets properly whitelisted
- [ ] All contract relationships established

## 📝 Post-Deployment Tasks

1. **Update Documentation**
   - Update contract addresses in README
   - Update frontend configuration
   - Update API documentation

2. **Monitor Deployment**
   - Check contract events
   - Monitor gas usage
   - Test all functions

3. **Frontend Integration**
   - Update contract addresses
   - Test IPFS integration
   - Test batch transactions

## 🆘 Support

Jika mengalami masalah deployment:

1. Check [Issues](https://github.com/somnia-social/contracts/issues)
2. Join [Discord](https://discord.gg/somnia)
3. Contact team di [Twitter](https://twitter.com/somnia_network)

## 📚 Additional Resources

- [Somnia Documentation](https://docs.somnia.network)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [IPFS Documentation](https://docs.ipfs.io)
