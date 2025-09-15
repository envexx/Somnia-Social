// Contoh JSON yang akan dikirim ke IPFS sesuai dengan schema yang diharapkan

// 1. Profile Data (saat membuat profil baru)
const exampleProfileData = {
  "version": 1,
  "username": "testuser",
  "displayName": "Test User",
  "avatar": "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "banner": "",
  "bio": "Hello Somnia! This is my bio.",
  "location": "Jakarta, Indonesia",
  "links": {
    "x": "testuser",
    "github": "testuser",
    "website": "https://testuser.dev",
    "discord": ""
  },
  "createdAt": 1694801000,
  "updatedAt": 1694801000
}

// 2. Post Data (untuk referensi)
const examplePostData = {
  "version": 1,
  "type": "post",
  "text": "Hello Somnia! 🚀\n\nExcited to be building the future of social media on blockchain.",
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

// 3. Badge Metadata (untuk referensi)
const exampleBadgeMetadata = {
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
      "value": "5+ Posts or 20+ Likes"
    }
  ]
}

export { exampleProfileData, examplePostData, exampleBadgeMetadata }
