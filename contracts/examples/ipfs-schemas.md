# IPFS Schema Examples

Contoh skema JSON untuk konten yang disimpan di IPFS.

## Profile Schema

```json
{
  "version": 1,
  "username": "coresol",
  "displayName": "Core Solution",
  "avatar": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "banner": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "links": {
    "x": "https://x.com/coresol",
    "github": "https://github.com/coresol",
    "website": "https://coresol.dev"
  },
  "bio": "Builder @ Somnia | Web3 Developer | DeFi Enthusiast",
  "location": "Jakarta, Indonesia",
  "createdAt": 1694791845,
  "updatedAt": 1694800000
}
```

## Post Schema

```json
{
  "version": 1,
  "type": "post",
  "text": "Hello Somnia! 🚀\n\nExcited to be building the future of social media on blockchain. The gasless experience is amazing!",
  "images": [
    "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  ],
  "embeds": [
    {
      "type": "link",
      "url": "https://somnia.network",
      "title": "Somnia Network",
      "description": "The future of social media",
      "image": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
    }
  ],
  "author": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "createdAt": 1694801000,
  "updatedAt": 1694801000
}
```

## Comment Schema

```json
{
  "version": 1,
  "type": "comment",
  "text": "This is amazing! Can't wait to see more features 🎉",
  "images": [],
  "embeds": [],
  "author": "0x8ba1f109551bD432803012645Hac136c",
  "createdAt": 1694801500,
  "updatedAt": 1694801500
}
```

## Badge Metadata Schema

### Bronze Badge
```json
{
  "name": "Bronze Contributor",
  "description": "Active community member with 5+ posts or 20+ likes received",
  "image": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Bronze"
    },
    {
      "trait_type": "Requirement",
      "value": "5 posts or 20 likes"
    }
  ]
}
```

### Silver Badge
```json
{
  "name": "Silver Contributor",
  "description": "Engaged community member with 20+ posts or 100+ likes received",
  "image": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Silver"
    },
    {
      "trait_type": "Requirement",
      "value": "20 posts or 100 likes"
    }
  ]
}
```

### Gold Badge
```json
{
  "name": "Gold Contributor",
  "description": "Valued community member with 50+ posts or 300+ likes received",
  "image": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Gold"
    },
    {
      "trait_type": "Requirement",
      "value": "50 posts or 300 likes"
    }
  ]
}
```

### Platinum Badge
```json
{
  "name": "Platinum Contributor",
  "description": "Elite community member with 150+ posts or 1000+ likes received",
  "image": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "attributes": [
    {
      "trait_type": "Tier",
      "value": "Platinum"
    },
    {
      "trait_type": "Requirement",
      "value": "150 posts or 1000 likes"
    }
  ]
}
```

## Usage Notes

1. **Version Field**: Selalu gunakan `version: 1` untuk kompatibilitas masa depan
2. **IPFS URLs**: Gunakan format `ipfs://` untuk referensi konten
3. **Timestamps**: Gunakan Unix timestamp dalam detik
4. **Author Address**: Selalu gunakan address Ethereum yang valid
5. **Images Array**: Array kosong jika tidak ada gambar
6. **Embeds Array**: Array kosong jika tidak ada embed

## Frontend Integration

```javascript
// Upload to IPFS
const uploadToIPFS = async (content) => {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_SECRET_KEY,
    },
    body: JSON.stringify({
      pinataContent: content,
      pinataMetadata: {
        name: `profile-${Date.now()}.json`
      }
    })
  });
  
  const result = await response.json();
  return `ipfs://${result.IpfsHash}`;
};

// Create profile
const createProfile = async (profileData) => {
  const profileCid = await uploadToIPFS(profileData);
  
  const tx = await profileRegistry.createProfile(
    profileData.username.toLowerCase(),
    profileCid
  );
  
  await tx.wait();
  return tx;
};
```
