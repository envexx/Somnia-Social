'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { 
  RoundedGlobe,
  RoundedMessage,
  RoundedHeart,
  RoundedShare,
  RoundedSettings,
  RoundedCamera,
  RoundedShield
} from '@/components/icons/RoundedIcons'
import { useProfileContract, usePostContract, useReactionsContract } from '@/hooks/useContracts'
import { ipfsService } from '@/lib/ipfs'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import BadgeDisplay, { AllBadgesDisplay } from '@/components/Badges/BadgeDisplay'
import CommentModal from '@/components/Comments/CommentModal'
import '@/styles/hide-scrollbar.css'

interface ProfileViewProps {
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

export default function ProfileView({ onBackToFeed }: ProfileViewProps) {
  const { isDarkMode } = useDarkMode()
  const { address, isConnected } = useAccount()
  const { 
    userProfile, 
    hasProfile, 
    createProfile, 
    updateProfile
  } = useProfileContract()
  const { totalPosts, globalTotalPosts, userPosts } = usePostContract()
  const { hasLiked, getLikeCount } = useReactionsContract()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  
  // Update refs when data changes
  useEffect(() => {
    profileDataRef.current = profileData
    getLikeCountRef.current = getLikeCount
    hasLikedRef.current = hasLiked
    globalTotalPostsRef.current = globalTotalPosts
  }, [profileData, getLikeCount, hasLiked, globalTotalPosts])
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [formattedUserPosts, setFormattedUserPosts] = useState<unknown[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileDataRef = useRef<ProfileData | null>(null)
  const getLikeCountRef = useRef(getLikeCount)
  const hasLikedRef = useRef(hasLiked)
  const globalTotalPostsRef = useRef(globalTotalPosts)
  
  // State for like functionality (same as PostFeed)
  const [postLikes, setPostLikes] = useState<Map<string, { count: number; liked: boolean }>>(new Map())
  // const [isLiking, setIsLiking] = useState<boolean>(false)

  // State for comment modal
  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean
    postId: number
    postAuthor: {
      name: string
      username: string
      avatar: string
      address: string
    }
    postContent: string
  }>({
    isOpen: false,
    postId: 0,
    postAuthor: {
      name: '',
      username: '',
      avatar: '',
      address: ''
    },
    postContent: ''
  })
  
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
        } catch (error) {
          console.error('Error fetching profile data from IPFS:', error)
        }
      }
    }

    fetchProfileData()
  }, [userProfile, hasProfile, address])

  // Function to fetch like data for a post (with caching)
  const fetchLikeData = useCallback(async (postId: string, retryCount = 0) => {
    if (!address) {
      return
    }

    try {
      // Check cache first
      const cacheKey = `like_data_${postId}_${address}`
      const cachedData = cacheService.get(cacheKey)
      
      if (cachedData) {
        const likeData = cachedData as { count: number; liked: boolean }
        setPostLikes(prev => {
          const newMap = new Map(prev)
          newMap.set(postId, likeData)
          return newMap
        })
        return
      }

      const numericPostId = Number(postId)
      if (isNaN(numericPostId) || numericPostId <= 0) {
        return
      }

      
      const [likeCount, userLiked] = await Promise.all([
        getLikeCountRef.current(numericPostId),
        // For ProfileView, we don't need to check if current user liked
        // because all posts here belong to the current user
        // We only need the like count from other users
        Promise.resolve(false)
      ])
      
      const likeData = {
        count: likeCount,
        liked: userLiked
      }
      
      // Cache the like data for 2 minutes
      cacheService.set(cacheKey, likeData, CACHE_TTL.POSTS_DATA)
      
      setPostLikes(prev => {
        const newMap = new Map(prev)
        newMap.set(postId, likeData)
        return newMap
      })
      
    } catch (error) {
      console.error(`❌ Error fetching like data for post ${postId} (attempt ${retryCount + 1}):`, error)
      
      // Retry mechanism with exponential backoff
      if (retryCount < 3) {
        const retryDelay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        setTimeout(() => {
          fetchLikeData(postId, retryCount + 1)
        }, retryDelay)
      } else {
        // Set fallback state to prevent UI from being stuck
        setPostLikes(prev => {
          const newMap = new Map(prev)
          const currentData = newMap.get(postId)
          if (currentData) {
            // Keep current state if available
          } else {
            // Set default state if no data available
            newMap.set(postId, {
              count: 0,
              liked: false
            })
          }
          return newMap
        })
      }
    }
  }, [address])

  // Process user posts to format them like feed posts (with caching)
  const processUserPosts = useCallback(async () => {
      if (userPosts && Array.isArray(userPosts) && userPosts[0] && Array.isArray(userPosts[0]) && userPosts[0].length > 0 && address) {
        // Check cache first for posts data
        const cacheKey = `user_posts_${address}`
        const cachedPosts = cacheService.get(cacheKey)
        
        if (cachedPosts) {
          setFormattedUserPosts(cachedPosts as unknown[])
          return
        }

        const processedPosts = await Promise.all(
          userPosts[0].map(async (post, index) => {
            try {
              // Check cache for individual post IPFS data
              const postCacheKey = `post_ipfs_${post.cid}`
              let ipfsData = cacheService.get(postCacheKey)
              
              if (!ipfsData) {
                // Fetch IPFS data for the post
                ipfsData = await ipfsService.fetchFromIPFS(post.cid)
                // Cache IPFS data for 1 hour
                cacheService.set(postCacheKey, ipfsData, CACHE_TTL.IPFS_DATA)
              }
              
              // Calculate the actual Post ID from blockchain
              // For getPostsByAuthor, posts are returned in chronological order (newest first)
              // We need to calculate the actual postId based on global total posts and current index
              // Since posts are ordered newest first, the Post ID should be: globalTotalPosts - index
              const actualPostId = globalTotalPostsRef.current ? Number(globalTotalPostsRef.current) - index : index + 1
              
              // Get real-time like data from blockchain (same as Feed)
              let realTimeLikeCount = 0
              let realTimeLiked = false
              
              // Validate postId before making contract calls
              if (!isNaN(actualPostId) && actualPostId > 0 && address) {
                try {
                  realTimeLikeCount = await getLikeCountRef.current(actualPostId)
                  // For posts in ProfileView, we don't need to check if current user liked
                  // because all posts here belong to the current user
                  // We only need the like count from other users
                  realTimeLiked = false
                } catch (_error) {
                  // Fallback to contract data
                  realTimeLikeCount = post.likeCount || 0
                  realTimeLiked = false
                }
              } else {
                // Invalid postId or no address, use fallback data
                realTimeLikeCount = post.likeCount || 0
                realTimeLiked = false
              }
              
              // Format the post like in the feed
              const postData = ipfsData as Record<string, unknown>
              return {
                id: actualPostId.toString(),
                content: (postData.text as string) || 'No content available',
                image: postData.images && Array.isArray(postData.images) && postData.images.length > 0 ? 
                  (postData.images[0] as string).replace('ipfs://', 'https://ipfs.io/ipfs/') : null,
                timestamp: new Date(Number(post.createdAt) * 1000).toLocaleDateString(),
                author: {
                  name: profileDataRef.current?.displayName || 'Unknown User',
                  username: profileDataRef.current?.username || 'unknown',
                  avatar: profileDataRef.current?.avatar ? profileDataRef.current.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/') : '/default-avatar.png',
                  verified: false,
                  address: address
                },
                liked: realTimeLiked, // Use real-time like data
                likeCount: realTimeLikeCount, // Use real-time like count
                repostCount: post.repostCount,
                commentCount: post.commentCount,
                cid: post.cid
              }
            } catch (_error) {
              // Try to get real-time like data even if IPFS fails
              // Use same approach as above
              const actualPostId = globalTotalPostsRef.current ? Number(globalTotalPostsRef.current) - index : index + 1
              
              let realTimeLikeCount = 0
              let realTimeLiked = false
              
              // Validate postId before making contract calls
              if (!isNaN(actualPostId) && actualPostId > 0 && address) {
                try {
                  realTimeLikeCount = await getLikeCountRef.current(actualPostId)
                  // For posts in ProfileView, we don't need to check if current user liked
                  // because all posts here belong to the current user
                  // We only need the like count from other users
                  realTimeLiked = false
                } catch (_likeError) {
                  realTimeLikeCount = post.likeCount || 0
                  realTimeLiked = false
                }
              } else {
                // Invalid postId or no address, use fallback data
                realTimeLikeCount = post.likeCount || 0
                realTimeLiked = false
              }
              
              return {
                id: actualPostId.toString(),
                content: 'Error loading post content',
                image: null,
                timestamp: new Date(Number(post.createdAt) * 1000).toLocaleDateString(),
                author: {
                  name: profileDataRef.current?.displayName || 'Unknown User',
                  username: profileDataRef.current?.username || 'unknown',
                  avatar: profileDataRef.current?.avatar ? profileDataRef.current.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/') : '/default-avatar.png',
                  verified: false,
                  address: address
                },
                liked: realTimeLiked, // Use real-time like data
                likeCount: realTimeLikeCount, // Use real-time like count
                repostCount: post.repostCount,
                commentCount: post.commentCount,
                cid: post.cid
              }
            }
          })
        )
        
        // Cache the processed posts for 2 minutes
        cacheService.set(cacheKey, processedPosts, CACHE_TTL.POSTS_DATA)
        
        setFormattedUserPosts(processedPosts)
      } else {
        setFormattedUserPosts([])
      }
    }, [userPosts, address])

  // Call processUserPosts when dependencies change
  useEffect(() => {
    if (userPosts && address) {
      processUserPosts()
    }
  }, [userPosts, address, processUserPosts])

  // Fetch like data for all posts when posts change
  useEffect(() => {
    if (formattedUserPosts && formattedUserPosts.length > 0 && address) {
      formattedUserPosts.forEach((post: unknown) => {
        const postData = post as Record<string, unknown>
        if (postData.id) {
          fetchLikeData(postData.id as string)
        }
      })
    }
  }, [formattedUserPosts, address, fetchLikeData])

  // Function to open comment modal
  const handleOpenComments = (postId: number, postAuthor: Record<string, unknown>, postContent: string) => {
    setCommentModal({
      isOpen: true,
      postId,
      postAuthor: {
        name: postAuthor.name as string,
        username: postAuthor.username as string,
        avatar: postAuthor.avatar as string,
        address: postAuthor.address as string
      },
      postContent
    })
  }

  // Function to close comment modal
  const handleCloseComments = () => {
    setCommentModal(prev => ({ ...prev, isOpen: false }))
  }

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
        avatarCid = await ipfsService.uploadFile(selectedAvatarFile)
      }
      
      const links = {
        website: editData.website,
        github: editData.github,
        x: editData.x
      }
      
      // const profileData = {
      //   version: 1,
      //   username: editData.username,
      //   displayName: editData.displayName,
      //   bio: editData.bio,
      //   avatar: avatarCid,
      //   location: editData.location,
      //   links
      // }
      
      await createProfile(
        editData.username, 
        editData.displayName, 
        editData.bio, 
        avatarCid,
        editData.location,
        links
      )
      
      setIsCreating(false)
      
      // Force refresh profile data
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
        avatarCid = await ipfsService.uploadFile(selectedAvatarFile)
      }
      
      const links = {
        website: editData.website,
        github: editData.github,
        x: editData.x
      }

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
                        <Image 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          width={200}
                          height={200}
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
        <div className={`mb-8 ${isDarkMode ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} p-6 shadow-lg`}>
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all" onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? (
                  <Image 
                    src={avatarPreview} 
                    alt="Avatar" 
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profileDataRef.current?.displayName?.charAt(0) || address?.slice(2, 4).toUpperCase() || 'U'}
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
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {profileDataRef.current?.displayName || 'Unnamed User'}
                    </h2>
                    <BadgeDisplay 
                      userAddress={address}
                      isDarkMode={isDarkMode}
                      size="md"
                      showText={true}
                    />
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-3`}>
                    @{profileDataRef.current?.username || 'username'}
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

        {/* Achievements & Badges Section */}
        <div className={`${isDarkMode ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} p-4 mb-6 shadow-lg`}>
          <h3 className={`text-base font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Achievements & Badges
          </h3>
          
          <AllBadgesDisplay 
            userAddress={address}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Additional Info */}
        {isEditing ? (
          <div className={`${isDarkMode ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} p-6 space-y-4 shadow-lg`}>
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
          <>
            {profileData?.location && (
              <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 space-y-3 mb-6`}>
              <div className="flex items-center space-x-3">
                <RoundedGlobe className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {profileData.location}
                </span>
                </div>
              </div>
            )}
            {profileData?.links?.website && (
              <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 space-y-3 mb-6`}>
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
              </div>
            )}
            {profileData?.links?.github && (
              <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 space-y-3 mb-6`}>
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
              </div>
            )}
            {profileData?.links?.x && (
              <div className={`${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'} rounded-xl p-6 space-y-3 mb-6`}>
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
          </div>
            )}
          </>
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
        <div className={`mt-8 ${isDarkMode ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            My Posts
          </h3>
          <div className="space-y-4">
            {formattedUserPosts.length > 0 ? (
              formattedUserPosts.map((post) => {
                const postData = post as Record<string, unknown>
                const author = postData.author as Record<string, unknown>
                return (
                <article key={postData.id as string} className={`${isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800/80' : 'bg-white/70 hover:bg-white/80'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} overflow-hidden transition-all shadow-lg hover:shadow-xl`}>
                  {/* Post Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <Image 
                          src={author?.avatar as string} 
                          alt={author?.username as string} 
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{author?.name as string}</h4>
                            {author?.verified as boolean && <RoundedShield className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{postData.timestamp as string}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className={`${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-base leading-relaxed`}>{postData.content as string}</p>
                    </div>

                    {/* Post Image */}
                    {postData.image as string && (
                      <div className="mb-4 -mx-4">
                        <div className="relative overflow-hidden rounded-xl">
                          <Image 
                            src={postData.image as string} 
                            alt="Post content" 
                            width={500}
                            height={300}
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
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${(() => {
                            const likeData = postLikes.get(postData.id as string)
                            const isBlockchainPost = postData.timestamp && typeof postData.timestamp === 'string' && postData.timestamp.includes('/')
                            const isLiked = isBlockchainPost ? likeData?.liked : (likeData?.liked || postData.liked)
                            
                            
                            return isLiked
                              ? `${isDarkMode ? 'text-red-400 bg-red-500/20 border border-red-500/30' : 'text-red-600 bg-red-50 border border-red-200'}` 
                              : `${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`
                          })()}`}
                        >
                          <RoundedHeart className={`w-4 h-4 ${(() => {
                            const likeData = postLikes.get(postData.id as string)
                            const isBlockchainPost = postData.timestamp && typeof postData.timestamp === 'string' && postData.timestamp.includes('/')
                            // For blockchain posts, use contract data for liked status
                            // For non-blockchain posts, use postData.liked
                            const isLiked = isBlockchainPost ? likeData?.liked : (likeData?.liked || postData.liked)
                            
                            
                            return isLiked ? 'fill-current text-red-500' : 'text-gray-400'
                          })()}`} />
                          <span className="text-sm font-medium">
                            {(() => {
                              const likeData = postLikes.get(postData.id as string)
                              // For blockchain posts, use dynamic likeData.count from state
                              // For non-blockchain posts, use postData.likeCount
                              const isBlockchainPost = postData.timestamp && typeof postData.timestamp === 'string' && postData.timestamp.includes('/')
                              const displayCount = isBlockchainPost ? (likeData?.count ?? postData.likeCount) : (likeData?.count ?? postData.likeCount)
                              
                              
                              return displayCount as number
                            })()}
                          </span>
                        </button>
                        
                        <button 
                          onClick={() => handleOpenComments(Number(postData.id), author, postData.content as string)}
                          disabled={!isConnected}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                        >
                          <RoundedMessage className="w-4 h-4" />
                          <span className="text-sm font-medium">{postData.commentCount as number}</span>
                        </button>
                        
                        <button 
                          disabled={!isConnected}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}
                        >
                          <RoundedShare className="w-4 h-4" />
                          <span className="text-sm font-medium">{postData.shareCount as number}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
                )
              })
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

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={handleCloseComments}
        postId={commentModal.postId}
        postAuthor={commentModal.postAuthor}
        postContent={commentModal.postContent}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
