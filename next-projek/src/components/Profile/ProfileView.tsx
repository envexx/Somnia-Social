'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { 
  RoundedGlobe,
  RoundedMessage,
  RoundedHeart,
  RoundedShare,
  RoundedSettings,
  RoundedCamera,
  RoundedShield
} from '@/components/icons/RoundedIcons'
import { useProfileContract, usePostContract } from '@/hooks/useContracts'
import { ipfsService } from '@/lib/ipfs'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import '@/styles/hide-scrollbar.css'

interface ProfileViewProps {
  isDarkMode?: boolean
  onBackToFeed?: () => void
}

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

export default function ProfileView({ isDarkMode = false, onBackToFeed }: ProfileViewProps) {
  const { address, isConnected } = useAccount()
  const { 
    userProfile, 
    hasProfile, 
    createProfile, 
    updateProfile
  } = useProfileContract()
  const { totalPosts, userPosts } = usePostContract()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [formattedUserPosts, setFormattedUserPosts] = useState<unknown[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editData, setEditData] = useState({
    username: '',
    displayName: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    x: '',
    avatar: ''
  })

  // Fetch profile data from IPFS (with caching)
  useEffect(() => {
    const fetchProfileData = async () => {
      // userProfile is a tuple: [userId, ownerAddr, handleHash, profileCid]
      const profileCid = userProfile ? (userProfile as unknown as unknown[])[3] as string : null
      
      if (userProfile && profileCid && address) {
        try {
          // Check cache first
          const cacheKey = CACHE_KEYS.PROFILE_DATA(address)
          const cachedData = cacheService.get(cacheKey)
          
          if (cachedData) {
            console.log('Profile data found in cache for ProfileView:', address)
            const profileData = cachedData as ProfileData
            setProfileData(profileData)
            
            // Convert IPFS avatar URL to HTTP URL for edit form
            const httpAvatarUrl = profileData.avatar ? profileData.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/') : ''
            
            setEditData({
              username: profileData.username || '',
              displayName: profileData.displayName || '',
              bio: profileData.bio || '',
              location: profileData.location || '',
              website: profileData.links?.website || '',
              github: profileData.links?.github || '',
              x: profileData.links?.x || '',
              avatar: httpAvatarUrl
            })
            
            // Set avatar preview if avatar exists
            if (profileData.avatar) {
              const httpAvatarUrl = profileData.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/')
              setAvatarPreview(httpAvatarUrl)
            }
            return
          }

          // Fetch from IPFS if not in cache
          const data = await ipfsService.fetchFromIPFS(profileCid)
          
          setProfileData(data as ProfileData)
          
          // Convert IPFS avatar URL to HTTP URL for edit form
          const profile = data as Record<string, unknown>
          const httpAvatarUrl = profile.avatar ? (profile.avatar as string).replace('ipfs://', 'https://ipfs.io/ipfs/') : ''
          
          setEditData({
            username: (profile.username as string) || '',
            displayName: (profile.displayName as string) || '',
            bio: (profile.bio as string) || '',
            location: (profile.location as string) || '',
            website: (profile.links as Record<string, unknown>)?.website as string || '',
            github: (profile.links as Record<string, unknown>)?.github as string || '',
            x: (profile.links as Record<string, unknown>)?.x as string || '',
            avatar: httpAvatarUrl
          })
          
          // Set avatar preview if avatar exists
          if (profile.avatar) {
            // Convert IPFS URL to HTTP URL for browser compatibility
            const httpAvatarUrl = (profile.avatar as string).replace('ipfs://', 'https://ipfs.io/ipfs/')
            setAvatarPreview(httpAvatarUrl)
          }

          // Cache the profile data
          cacheService.set(cacheKey, data, CACHE_TTL.PROFILE_DATA)
          console.log('Profile data cached for ProfileView:', address)
        } catch (error) {
          console.error('Error fetching profile data from IPFS:', error)
        }
      }
    }

    fetchProfileData()
  }, [userProfile, hasProfile, address])

  // Process user posts to format them like feed posts
  useEffect(() => {
    const processUserPosts = async () => {
      if (userPosts && Array.isArray(userPosts) && userPosts[0] && Array.isArray(userPosts[0]) && userPosts[0].length > 0) {
        console.log('Processing user posts:', userPosts[0])
        
        const processedPosts = await Promise.all(
          userPosts[0].map(async (post, index) => {
            try {
              // Fetch IPFS data for the post
              console.log(`Fetching IPFS data for post ${index + 1}, CID:`, post.cid)
              const ipfsData = await ipfsService.fetchFromIPFS(post.cid)
              console.log(`IPFS data fetched for post ${index + 1}:`, ipfsData)
              console.log(`IPFS text content:`, (ipfsData as Record<string, unknown>).text)
              console.log(`IPFS images:`, (ipfsData as Record<string, unknown>).images)
              
              // Format the post like in the feed
              const postData = ipfsData as Record<string, unknown>
              return {
                id: (index + 1).toString(),
                content: (postData.text as string) || 'No content available',
                image: postData.images && Array.isArray(postData.images) && postData.images.length > 0 ? 
                  (postData.images[0] as string).replace('ipfs://', 'https://ipfs.io/ipfs/') : null,
                timestamp: new Date(Number(post.createdAt) * 1000).toLocaleDateString(),
                author: {
                  name: profileData?.displayName || 'Unknown User',
                  username: profileData?.username || 'unknown',
                  avatar: profileData?.avatar ? profileData.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/') : '/default-avatar.png',
                  verified: false,
                  address: address
                },
                liked: false, // Will be updated by like system
                likeCount: post.likeCount,
                repostCount: post.repostCount,
                commentCount: post.commentCount,
                cid: post.cid
              }
            } catch (error) {
              console.error(`Error processing post ${index + 1}:`, error)
              return {
                id: (index + 1).toString(),
                content: 'Error loading post content',
                image: null,
                timestamp: new Date(Number(post.createdAt) * 1000).toLocaleDateString(),
                author: {
                  name: profileData?.displayName || 'Unknown User',
                  username: profileData?.username || 'unknown',
                  avatar: profileData?.avatar ? profileData.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/') : '/default-avatar.png',
                  verified: false,
                  address: address
                },
                liked: false,
                likeCount: post.likeCount,
                repostCount: post.repostCount,
                commentCount: post.commentCount,
                cid: post.cid
              }
            }
          })
        )
        
        setFormattedUserPosts(processedPosts)
      } else {
        setFormattedUserPosts([])
      }
    }

    processUserPosts()
  }, [userPosts, profileData, address])

  const handleAvatarUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Store file for later upload and create preview
    setSelectedAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    console.log('Avatar file selected for upload:', file.name)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  const handleCreateProfile = async () => {
    if (!editData.username || !editData.displayName) {
      alert('Please fill in username and display name')
      return
    }

    setIsCreating(true)
    setIsUploadingAvatar(true)
    
    try {
      let avatarCid = ''
      
      // Upload avatar to IPFS if file is selected
      if (selectedAvatarFile) {
        console.log('Uploading avatar to IPFS...')
        avatarCid = await ipfsService.uploadFile(selectedAvatarFile)
        console.log('Avatar uploaded to IPFS:', avatarCid)
      }
      
      const links = {
        website: editData.website,
        github: editData.github,
        x: editData.x
      }
      
      console.log('Creating profile with data:', {
        username: editData.username,
        displayName: editData.displayName,
        bio: editData.bio,
        avatar: avatarCid,
        location: editData.location,
        links
      })
      
      await createProfile(
        editData.username, 
        editData.displayName, 
        editData.bio, 
        avatarCid,
        editData.location,
        links
      )
      
      console.log('Profile created successfully!')
      setIsCreating(false)
      
      // Force refresh profile data
      console.log('Profile creation completed, data should refresh automatically...')
      // Profile will be refetched automatically via useEffect
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile. Please try again.')
    } finally {
      setIsCreating(false)
      setIsUploadingAvatar(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!profileData) return

    setIsUpdating(true)
    setIsUploadingAvatar(true)
    
    try {
      let avatarCid = editData.avatar
      
      // Upload new avatar to IPFS if file is selected
      if (selectedAvatarFile) {
        console.log('Uploading new avatar to IPFS...')
        avatarCid = await ipfsService.uploadFile(selectedAvatarFile)
        console.log('New avatar uploaded to IPFS:', avatarCid)
      }
      
      const links = {
        website: editData.website,
        github: editData.github,
        x: editData.x
      }

      console.log('Updating profile with data:', {
        displayName: editData.displayName,
        bio: editData.bio,
        avatar: avatarCid,
        location: editData.location,
        links
      })

      await updateProfile(
        editData.displayName, 
        editData.bio, 
        avatarCid,
        editData.location,
        links
      )
      
      // Update local state
      const updatedData = {
        ...profileData,
        displayName: editData.displayName,
        bio: editData.bio,
        avatar: avatarCid,
        location: editData.location,
        links: links,
        updatedAt: Math.floor(Date.now() / 1000)
      }
      
      setProfileData(updatedData)
      setIsEditing(false)
      console.log('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsUpdating(false)
      setIsUploadingAvatar(false)
    }
  }

  if (!hasProfile) {
    return (
      <div className={`w-full h-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header with back button */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToFeed}
              className={`p-2 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-lg transition-all`}
            >
              <RoundedSettings className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} rotate-180`} />
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Create Profile
            </h1>
          </div>
        </div>

        {/* Profile Creation Form */}
        <div className="p-6 max-w-2xl mx-auto">
          <div className="space-y-6">
            
            {/* Profile Creation Form */}
            <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-2xl p-6`}>
              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="text-center">
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Profile Picture
                  </label>
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-all" style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}} onClick={() => fileInputRef.current?.click()}>
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RoundedCamera className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <div className="text-white text-xs">Uploading to IPFS...</div>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Click to upload (max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={editData.username}
                    onChange={(e) => setEditData({...editData, username: e.target.value})}
                    className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your display name"
                    value={editData.displayName}
                    onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                    className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Bio
                  </label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none`}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onBackToFeed}
                className={`flex-1 px-6 py-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} text-slate-900 rounded-lg transition-all font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={isCreating || !editData.username || !editData.displayName}
                className={`flex-1 py-3 px-6 font-medium rounded-lg transition-all ${
                  isCreating || !editData.username || !editData.displayName
                    ? `${isDarkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} hover:scale-105`
                }`}
              >
                {isCreating ? (isUploadingAvatar ? 'Uploading to IPFS...' : 'Creating Profile...') : 'Create Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Profile Content */}
      <div className={`h-full overflow-y-auto hide-scrollbar ${isDarkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'} px-4 lg:px-6 pt-2 pb-6`}>
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-lg lg:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Profile
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              isEditing 
                ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`
                : `${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {/* Profile Info */}
        <div className="mb-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all" onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profileData?.displayName?.charAt(0) || address?.slice(2, 4).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-xs">Uploading to IPFS...</div>
                </div>
              )}
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all" onClick={() => fileInputRef.current?.click()}>
                  <RoundedCamera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={editData.displayName}
                    onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                    className={`w-full px-4 py-3 text-xl font-semibold rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                  <textarea
                    placeholder="Bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={3}
                    className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none`}
                  />
                </div>
              ) : (
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                    {profileData?.displayName || 'Unnamed User'}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-3`}>
                    @{profileData?.username || 'username'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {profileData?.bio || 'No bio yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 mb-8`}>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {typeof totalPosts === 'number' ? totalPosts : 0}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Posts
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                0
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Followers
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                0
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Following
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {isEditing ? (
          <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 space-y-4`}>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Location
              </label>
              <input
                type="text"
                placeholder="Location"
                value={editData.location}
                onChange={(e) => setEditData({...editData, location: e.target.value})}
                className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Website
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={editData.website}
                onChange={(e) => setEditData({...editData, website: e.target.value})}
                className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                GitHub
              </label>
              <input
                type="text"
                placeholder="username"
                value={editData.github}
                onChange={(e) => setEditData({...editData, github: e.target.value})}
                className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                X (Twitter)
              </label>
              <input
                type="text"
                placeholder="username"
                value={editData.x}
                onChange={(e) => setEditData({...editData, x: e.target.value})}
                className={`w-full px-4 py-3 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className={`w-full py-3 px-4 font-medium rounded-lg transition-all ${
                isUpdating
                  ? `${isDarkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} hover:scale-105`
              }`}
            >
              {isUpdating ? (isUploadingAvatar ? 'Uploading to IPFS...' : 'Updating Profile...') : 'Update Profile'}
            </button>
          </div>
        ) : (
          <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 space-y-3`}>
            {profileData?.location && (
              <div className="flex items-center space-x-3">
                <RoundedGlobe className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {profileData.location}
                </span>
              </div>
            )}
            {profileData?.links?.website && (
              <div className="flex items-center space-x-3">
                <RoundedGlobe className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <a 
                  href={profileData.links.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
                >
                  {profileData.links.website}
                </a>
              </div>
            )}
            {profileData?.links?.github && (
              <div className="flex items-center space-x-3">
                <RoundedGlobe className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <a 
                  href={`https://github.com/${profileData.links.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
                >
                  github.com/{profileData.links.github}
                </a>
              </div>
            )}
            {profileData?.links?.x && (
              <div className="flex items-center space-x-3">
                <RoundedGlobe className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <a 
                  href={`https://x.com/${profileData.links.x}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline`}
                >
                  x.com/{profileData.links.x}
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Hidden file input for avatar upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {/* Personal Posts Section */}
        <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            My Posts
          </h3>
          <div className="space-y-4">
            {formattedUserPosts.length > 0 ? (
              formattedUserPosts.map((post: Record<string, unknown>) => (
                <article key={post.id} className={`${isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800/80' : 'bg-white/70 hover:bg-white/80'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} overflow-hidden transition-all shadow-lg hover:shadow-xl`}>
                  {/* Post Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <img src={post.author.avatar} alt={post.author.username} className="w-10 h-10 rounded-full border-2 border-white/50" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.author.name}</h4>
                            {post.author.verified && <RoundedShield className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{post.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-base leading-relaxed`}>{post.content}</p>
                    </div>

                    {/* Post Image */}
                    {post.image && (
                      <div className="mb-4 -mx-4">
                        <div className="relative overflow-hidden rounded-xl">
                          <img 
                            src={post.image} 
                            alt="Post content" 
                            className="w-full h-auto object-cover aspect-video"
                          />
                        </div>
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center justify-between py-3 border-t border-white/20">
                      <div className="flex items-center space-x-4">
                        <button 
                          disabled={!isConnected}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${
                            post.liked
                              ? `${isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50'}` 
                              : `${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`
                          }`}
                        >
                          <RoundedHeart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{post.likeCount}</span>
                        </button>
                        
                        <button 
                          disabled={!isConnected}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                        >
                          <RoundedMessage className="w-4 h-4" />
                          <span className="text-sm font-medium">{post.commentCount}</span>
                        </button>
                        
                        <button 
                          disabled={!isConnected}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
                        >
                          <RoundedShare className="w-4 h-4" />
                          <span className="text-sm font-medium">{post.repostCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  No posts yet. Start sharing your thoughts!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
