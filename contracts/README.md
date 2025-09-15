# Somnia Social - Smart Contracts

Sistem smart contract untuk platform sosial Somnia yang mendukung profil unik, posting, komentar, reaksi, badge bertingkat, dan transaksi gasless dengan batch processing.

## 🏗️ Arsitektur

### Kontrak Utama

1. **TrustedForwarder** - Minimal forwarder untuk transaksi gasless (ERC-2771)
2. **ProfileRegistry** - Manajemen profil pengguna dengan handle unik dan penyimpanan IPFS
3. **PostFeed** - Sistem posting dan komentar dengan pointer IPFS
4. **Reactions** - Sistem like toggle dengan sinkronisasi counter
5. **Badges** - Badge ERC-1155 non-transferable dengan sistem tier
6. **BatchRelayer** - Eksekusi batch transaksi gasless dengan EIP-712 signatures

### Fitur Utama

- ✅ **Profil Unik**: Handle username unik dengan penyimpanan IPFS
- ✅ **Post & Comment**: Sistem posting dengan pointer IPFS untuk konten
- ✅ **Reactions**: Like toggle dengan sinkronisasi counter real-time
- ✅ **Badges Bertingkat**: Sistem achievement dengan 4 tier (Bronze, Silver, Gold, Platinum)
- ✅ **Gasless Transactions**: Semua transaksi dapat dilakukan tanpa gas fee
- ✅ **Batch Processing**: Multiple actions dalam satu transaksi sponsor
- ✅ **IPFS Integration**: Penyimpanan konten off-chain dengan pointer on-chain

## 📋 Skema IPFS

### Profil JSON
```json
{
  "version": 1,
  "username": "coresol",
  "displayName": "Core Solution",
  "avatar": "ipfs://bafy...avatar.png",
  "links": {
    "x": "https://x.com/coresol",
    "github": "https://github.com/coresol"
  },
  "bio": "Builder @ Somnia",
  "createdAt": 1694791845,
  "updatedAt": 1694800000
}
```

### Post/Comment JSON
```json
{
  "version": 1,
  "type": "post",
  "text": "Hello Somnia 👋",
  "images": ["ipfs://bafy...1.png"],
  "embeds": [],
  "author": "0xAuthor",
  "createdAt": 1694801000
}
```

## 🚀 Deployment

### Prerequisites
- Node.js 16+
- Hardhat
- Somnia testnet access

### Deploy Contracts
```bash
# Install dependencies
npm install

# Deploy to Somnia testnet
npx hardhat run scripts/deploy.js --network somnia
```

### Contract Addresses
Setelah deployment, alamat kontrak akan disimpan di `../frontend/src/contracts/addresses.json`.

## 🔧 Setup Contract Relationships

Deploy script secara otomatis akan:
1. Deploy semua kontrak dengan TrustedForwarder
2. Set PostFeed ↔ Reactions relationship
3. Configure BatchRelayer allowed targets
4. Save contract addresses untuk frontend

## 💡 Usage Examples

### Create Profile (Gasless)
```javascript
// Frontend: Upload profile JSON to IPFS
const profileCid = await uploadToIPFS(profileJson);

// Batch call via BatchRelayer
const calls = [{
  target: profileRegistryAddress,
  value: 0,
  data: profileRegistry.interface.encodeFunctionData(
    "createProfile", 
    ["username", profileCid]
  )
}];

// User signs EIP-712 batch
const signature = await signBatchExecution(calls, nonce, deadline);

// Sponsor executes batch
await batchRelayer.relayBatch(user, calls, nonce, deadline, signature);
```

### Create Post + Like (Batch)
```javascript
const calls = [
  {
    target: postFeedAddress,
    value: 0,
    data: postFeed.interface.encodeFunctionData(
      "createPost", 
      [postCid, 0, 0]
    )
  },
  {
    target: reactionsAddress,
    value: 0,
    data: reactions.interface.encodeFunctionData(
      "toggleLike", 
      [postId]
    )
  }
];
```

## 🏆 Badge System

### Tier Requirements
- **Bronze (Tier 1)**: 5 posts atau 20 likes received
- **Silver (Tier 2)**: 20 posts atau 100 likes received  
- **Gold (Tier 3)**: 50 posts atau 300 likes received
- **Platinum (Tier 4)**: 150 posts atau 1000 likes received

### Grant Badges
```javascript
// Admin service grants badges based on metrics
await badges.grantTier(userAddress, tierId);
```

## 🔒 Security Features

- **EIP-712 Signatures**: Semua batch execution menggunakan EIP-712
- **Nonce Protection**: Anti-replay protection per user
- **Deadline Enforcement**: Batch execution dengan expiry time
- **Target Whitelist**: BatchRelayer hanya bisa call kontrak yang diizinkan
- **Non-transferable Badges**: Badge tidak bisa ditransfer antar user
- **Reentrancy Protection**: Semua kontrak menggunakan ReentrancyGuard

## 📊 Gas Optimization

- **Custom Errors**: Menggunakan custom errors instead of require strings
- **Struct Packing**: Optimized struct layout untuk storage efficiency
- **Batch Operations**: Multiple actions dalam satu transaksi
- **IPFS Storage**: Konten disimpan off-chain, hanya CID on-chain
- **Counter Caching**: Like counts cached di PostFeed untuk read efficiency

## 🔄 Frontend Integration

### Reading Data
```javascript
// Get latest posts
const { posts, nextCursor } = await postFeed.latest(0, 10);

// Get user profile
const profile = await profileRegistry.getProfileByOwner(userAddress);

// Check like status
const hasLiked = await reactions.hasLiked(postId, userAddress);

// Get user badges
const userTiers = await badges.getUserTiers(userAddress);
```

### Event Listening
```javascript
// Listen for new posts
postFeed.on("PostCreated", (postId, author, cid, replyTo, repostOf, createdAt) => {
  // Update UI
});

// Listen for likes
reactions.on("LikeToggled", (postId, user, liked) => {
  // Update like count
});
```

## 🌐 Network Configuration

- **Network**: Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network
- **Block Explorer**: https://somnia-testnet.socialscan.io

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.
