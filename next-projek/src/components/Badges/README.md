# Badge System Documentation

## Badge Tiers Overview

Sistem badge Somnia memiliki 5 level tier yang menunjukkan tingkat aktivitas dan kontribusi user dalam platform:

### 🌱 **Beginner Badge (Tier 0)**
- **Icon**: 🌱
- **Color**: Green (#10B981)
- **Requirement**: User baru yang baru mendaftar
- **Description**: Badge otomatis untuk semua user baru yang belum memenuhi requirement tier Bronze
- **Status**: Frontend-only badge (tidak ada di smart contract)

### 🥉 **Bronze Badge (Tier 1)**
- **Icon**: 🥉
- **Color**: Bronze (#CD7F32)
- **Requirement**: 5 posts atau 20 likes received
- **Description**: Tier pertama yang bisa didapatkan melalui aktivitas di platform
- **Status**: Smart contract badge

### 🥈 **Silver Badge (Tier 2)**
- **Icon**: 🥈
- **Color**: Silver (#C0C0C0)
- **Requirement**: 20 posts atau 100 likes received
- **Description**: Tier kedua untuk user yang lebih aktif
- **Status**: Smart contract badge

### 🥇 **Gold Badge (Tier 3)**
- **Icon**: 🥇
- **Color**: Gold (#FFD700)
- **Requirement**: 50 posts atau 300 likes received
- **Description**: Tier ketiga untuk user yang sangat aktif
- **Status**: Smart contract badge

### 💎 **Platinum Badge (Tier 4)**
- **Icon**: 💎
- **Color**: Platinum (#E5E4E2)
- **Requirement**: 150 posts atau 1000 likes received
- **Description**: Tier tertinggi untuk user yang sangat kontributif
- **Status**: Smart contract badge

## Badge Display Logic

### **BadgeDisplay Component**
- Menampilkan badge tertinggi yang dimiliki user
- Jika user belum memiliki badge dari contract, otomatis menampilkan Beginner badge
- Support multiple sizes (sm, md, lg)
- Support dark/light mode
- Menampilkan count jika user memiliki multiple badges

### **AllBadgesDisplay Component**
- Menampilkan semua badges yang dimiliki user
- Selalu menampilkan Beginner badge jika user belum memiliki contract badges
- Menampilkan label "(New User)" untuk Beginner badge

## Implementation Details

### **Frontend Logic**
```typescript
// Determine which badge to show
let displayTier = highestTierValue

// If user has no badges from contract, show Beginner badge
if (badgesToShow.length === 0 && highestTierValue === 0) {
  displayTier = 0 // Beginner tier
}
```

### **Badge Configuration**
```typescript
const BADGE_CONFIG: Record<number, BadgeInfo> = {
  0: {
    tier: 0,
    name: 'Beginner',
    color: '#10B981',
    bgColor: '#10B98110',
    icon: '🌱'
  },
  // ... other tiers
}
```

## UI Integration

Badges ditampilkan di 3 lokasi utama:

1. **ProfileView**: Di sebelah display name + section khusus "Achievements & Badges"
2. **LeftSidebar**: Di sebelah nama user di sidebar
3. **PostFeed**: Di sebelah nama author di setiap post

## User Experience

- **New Users**: Otomatis mendapat Beginner badge 🌱
- **Active Users**: Bisa naik ke Bronze 🥉 setelah 5 posts atau 20 likes
- **Progressive**: Semakin aktif, semakin tinggi tier yang bisa dicapai
- **Visual Feedback**: Setiap tier memiliki warna dan icon yang unik
- **Hover Effects**: Interactive animations untuk better UX
