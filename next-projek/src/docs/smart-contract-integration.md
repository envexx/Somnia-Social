// Smart Contract Integration Documentation
// Memastikan implementasi sesuai dengan deployed contracts

// 1. ProfileRegistry Contract Functions

// ✅ CREATE PROFILE
// Function: createProfile(string calldata usernameLower, string calldata profileCid)
// Parameters:
//   - usernameLower: Username dalam lowercase (harus unique)
//   - profileCid: IPFS CID untuk profile JSON content
// Implementation:
const createProfileExample = {
  functionName: 'createProfile',
  args: ['testuser', 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi']
}

// ✅ UPDATE PROFILE  
// Function: updateProfile(uint64 userId, string calldata profileCid)
// Parameters:
//   - userId: ID profil yang akan diupdate (dari getProfileByOwner)
//   - profileCid: IPFS CID baru untuk profile JSON content
// Implementation:
const updateProfileExample = {
  functionName: 'updateProfile', 
  args: [BigInt(1), 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi']
}

// ✅ GET PROFILE BY OWNER
// Function: getProfileByOwner(address owner)
// Returns: (uint64 userId, address ownerAddr, bytes32 handleHash, string memory profileCid)
const getProfileExample = {
  functionName: 'getProfileByOwner',
  args: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6']
}

// ✅ HAS PROFILE
// Function: hasProfile(address owner)
// Returns: bool hasProfile
const hasProfileExample = {
  functionName: 'hasProfile',
  args: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6']
}

// 2. IPFS JSON Schema (sesuai dengan dokumentasi)

const profileDataSchema = {
  version: 1,
  username: "testuser",
  displayName: "Test User",
  avatar: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  banner: "",
  bio: "Hello Somnia!",
  location: "Jakarta, Indonesia", 
  links: {
    x: "testuser",
    github: "testuser",
    website: "https://testuser.dev",
    discord: ""
  },
  createdAt: 1694801000,
  updatedAt: 1694801000
}

// 3. Error Handling

// Smart Contract Errors:
// - HandleAlreadyTaken(): Username sudah digunakan
// - ProfileNotFound(): Profil tidak ditemukan
// - Unauthorized(): User tidak authorized untuk update profil
// - InvalidHandle(): Username tidak valid (empty atau > 50 chars)
// - ProfileAlreadyExists(): User sudah punya profil

// IPFS Errors:
// - Upload failed: Gagal upload ke IPFS
// - Fetch failed: Gagal mengambil data dari IPFS
// - Invalid JSON: Format JSON tidak valid

// 4. Flow yang Benar

// CREATE PROFILE FLOW:
// 1. Validasi username (lowercase, unique)
// 2. Buat profileData JSON sesuai schema
// 3. Upload ke IPFS → dapat profileCid
// 4. Call createProfile(usernameLower, profileCid)
// 5. Tunggu transaction confirmation
// 6. Profile berhasil dibuat

// UPDATE PROFILE FLOW:
// 1. Get existing profile dengan getProfileByOwner
// 2. Extract userId dari response
// 3. Fetch existing data dari IPFS menggunakan profileCid
// 4. Update data dengan field baru
// 5. Upload updated data ke IPFS → dapat profileCid baru
// 6. Call updateProfile(userId, newProfileCid)
// 7. Tunggu transaction confirmation
// 8. Profile berhasil diupdate

export { 
  createProfileExample, 
  updateProfileExample, 
  getProfileExample, 
  hasProfileExample,
  profileDataSchema 
}
