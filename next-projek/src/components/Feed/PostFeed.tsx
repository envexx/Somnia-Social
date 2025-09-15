'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { 
  RoundedHeart, 
  RoundedMessage, 
  RoundedShare, 
  RoundedBookmark,
  RoundedImage,
  RoundedHash,
  RoundedChart,
  RoundedShield,
  RoundedEye,
  RoundedClose
} from '@/components/icons/RoundedIcons'
import { useAccount } from 'wagmi'
import { usePostContract, useReactionsContract, useProfileContract } from '@/hooks/useContracts'
import { ipfsService, ProfileData } from '@/lib/ipfs'
import '@/styles/hide-scrollbar.css'

interface Post {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
    address?: string // Add author address for follow functionality
  }
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  liked: boolean
  bookmarked: boolean
}

interface PostFeedProps {
  posts: Post[]
  onLike: (postId: number) => void
  isDarkMode?: boolean
}

export default function PostFeed({ posts, onLike, isDarkMode = false }: PostFeedProps) {
  const { address, isConnected } = useAccount()
  const { createPost, latestPosts, refetchLatestPosts } = usePostContract()
  const { toggleLike, hasLiked, getLikeCount } = useReactionsContract()
  const { hasProfile, userProfile, getProfileByOwner } = useProfileContract()
  
  // State for follow functionality
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  
  // State for like functionality
  const [postLikes, setPostLikes] = useState<Map<string, { count: number; liked: boolean }>>(new Map())
  const [isLiking, setIsLiking] = useState<boolean>(false)

  // Function to handle follow/unfollow
  const handleFollow = async (authorAddress: string) => {
    if (!isConnected || !address) {
      console.log('User not connected')
      return
    }

    try {
      setIsFollowing(true)
      
      // TODO: Implement actual follow/unfollow smart contract call
      // For now, we'll just toggle the local state
      const newFollowingUsers = new Set(followingUsers)
      
      if (followingUsers.has(authorAddress)) {
        // Unfollow
        newFollowingUsers.delete(authorAddress)
        console.log(`Unfollowed user: ${authorAddress}`)
      } else {
        // Follow
        newFollowingUsers.add(authorAddress)
        console.log(`Followed user: ${authorAddress}`)
      }
      
      setFollowingUsers(newFollowingUsers)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    } finally {
      setIsFollowing(false)
    }
  }

  // Function to check if user is following someone
  const isUserFollowing = (authorAddress: string): boolean => {
    return followingUsers.has(authorAddress)
  }
  
  // Mock posts removed - using blockchain data only

  const [newPost, setNewPost] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [blockchainPostsData, setBlockchainPostsData] = useState<unknown[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch profile data from IPFS
  useEffect(() => {
    const fetchProfileData = async () => {
      // userProfile is a tuple: [userId, ownerAddr, handleHash, profileCid]
      const profileCid = userProfile ? (userProfile as unknown as unknown[])[3] as string : null
      
      if (userProfile && profileCid && address) {
        try {
          const data = await ipfsService.fetchFromIPFS(profileCid)
          setProfileData(data as ProfileData)
        } catch (error) {
          console.error('Error fetching profile data:', error)
        }
      }
    }

    fetchProfileData()
  }, [userProfile, address])

  // Fetch blockchain posts data
  useEffect(() => {
    const fetchBlockchainPosts = async () => {
      if (latestPosts && Array.isArray(latestPosts)) {
        console.log('Latest posts from blockchain:', latestPosts)
        console.log('Number of posts:', latestPosts.length)
        
        // Log detailed structure of each post
        latestPosts.forEach((post: unknown, index: number) => {
          console.log(`Post ${index} structure:`, post)
          console.log(`Post ${index} type:`, typeof post)
        })
        
        // If latestPosts contains post IDs (BigInt), we need to fetch individual posts
        // For now, let's assume latestPosts contains the actual post data
        // and try to extract CID from it
        
        const postsWithIPFS = await Promise.all(
          latestPosts.map(async (post: unknown, index: number) => {
            try {
              console.log(`Processing post ${index}:`, post)
              
              // Try to extract CID from the post data
              let cid = null
              
              if (typeof post === 'string' && post.startsWith('ipfs://')) {
                // If post is directly a CID string
                cid = post
              } else if (Array.isArray(post)) {
                // If post is an array (tuple), CID is usually the last element
                console.log(`Post ${index} is array with length:`, post.length)
                console.log(`Post ${index} array contents:`, post)
                
                if (post.length > 0) {
                  // Check if the array contains a post object
                  const firstElement = post[0]
                  if (firstElement && typeof firstElement === 'object' && firstElement.cid) {
                    // If first element is a post object with CID
                    cid = firstElement.cid
                    console.log(`Post ${index} CID from object:`, cid)
                  } else {
                    // If it's a tuple, CID is usually the last element
                    cid = post[post.length - 1]
                    console.log(`Post ${index} CID from tuple:`, cid)
                  }
                }
              } else if (post && typeof post === 'object' && (post as Record<string, unknown>).cid) {
                // If post is an object with cid property
                cid = (post as Record<string, unknown>).cid as string
              } else if (typeof post === 'bigint') {
                // If post is a BigInt (post ID), skip for now
                console.log(`Post ${index} is BigInt ID:`, post)
                console.log(`Skipping post ${index} - BigInt ID not supported yet`)
                return null
              }
              
              console.log(`Post ${index} CID:`, cid)
              
              // Validate CID
              if (!cid || typeof cid !== 'string') {
                console.warn(`Invalid CID for post ${index}:`, cid)
                return null
              }
              
              console.log(`Fetching IPFS data for post ${index}, CID:`, cid)
              const ipfsData = await ipfsService.fetchFromIPFS(cid)
              console.log(`IPFS data fetched for post ${index}:`, ipfsData)
              
              return {
                postId: index + 1,
                postData: post,
                cid,
                ipfsData
              }
            } catch (error) {
              console.error(`Error fetching post ${index} data:`, error)
              return null
            }
          })
        )
        
        const validPosts = postsWithIPFS.filter(post => post !== null)
        console.log('All posts with IPFS data:', validPosts)
        setBlockchainPostsData(validPosts)
      } else {
        console.log('No latest posts or not an array:', latestPosts)
      }
    }

    fetchBlockchainPosts()
  }, [latestPosts])

  // Convert blockchain post data to renderable format
  const convertBlockchainPost = async (post: Record<string, unknown>) => {
    if (!post || !post.ipfsData) {
      console.log('Skipping post - no IPFS data:', post)
      return null
    }

    const ipfsData = post.ipfsData
    const postData = post.postData
    
    // Extract author from postData
    let author = '0x0000000000000000000000000000000000000000'
    if (Array.isArray(postData)) {
      // If postData is array, check if first element is object or string
      const firstElement = postData[0]
      if (firstElement && typeof firstElement === 'object' && (firstElement as Record<string, unknown>).author) {
        author = (firstElement as Record<string, unknown>).author
      } else if (typeof firstElement === 'string') {
        author = firstElement
      }
    } else if (postData && typeof postData === 'object' && (postData as Record<string, unknown>).author) {
      author = (postData as Record<string, unknown>).author
    }
    
    console.log('Converting blockchain post:', post)
    console.log('IPFS data:', ipfsData)
    console.log('Post data:', postData)
    console.log('Author:', author)
    
    // Try to fetch author's profile data
    let authorProfile = null
    try {
      // Use the profile contract to get author's profile
      if (getProfileByOwner) {
        authorProfile = await getProfileByOwner(author)
        console.log('Author profile fetched:', authorProfile)
      }
    } catch (error) {
      console.error('Error fetching author profile:', error)
    }
    
    // Extract author info from profile or use fallbacks
    let authorName = 'Unknown User'
    let authorUsername = '@unknown'
    let authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`
    
    if (authorProfile && Array.isArray(authorProfile) && (authorProfile as unknown[]).length >= 4) {
      const profileCid = (authorProfile as unknown[])[3] as string // profileCid is the 4th element
      if (profileCid && typeof profileCid === 'string') {
        try {
          const profileData = await ipfsService.fetchFromIPFS(profileCid)
          console.log('Author profile data from IPFS:', profileData)
          
          if (profileData) {
            const profile = profileData as Record<string, unknown>
            authorName = (profile.displayName as string) || 'Unknown User'
            authorUsername = (profile.username as string) || '@unknown'
            authorAvatar = profile.avatar ? 
              (profile.avatar as string).replace('ipfs://', 'https://ipfs.io/ipfs/') : 
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`
          }
        } catch (error) {
          console.error('Error fetching author profile from IPFS:', error)
        }
      }
    }
    
        const convertedPost = {
          id: post.postId?.toString() || `post_${Math.random().toString(36).substr(2, 9)}`,
          author: {
            name: authorName,
            username: authorUsername,
            avatar: authorAvatar,
            verified: false, // TODO: Implement verification system
            address: author // Add author address for follow functionality
          },
      content: ipfsData.text || '',
      image: ipfsData.images && ipfsData.images.length > 0 ? ipfsData.images[0].replace('ipfs://', 'https://ipfs.io/ipfs/') : undefined,
      timestamp: new Date(Number(postData[3] || Date.now() / 1000) * 1000).toLocaleString(),
      likes: Number(postData[5] || 0),
      comments: Number(postData[7] || 0),
      shares: Number(postData[6] || 0),
      liked: false, // TODO: Implement like status
      bookmarked: false // TODO: Implement bookmark status
    }
    
    console.log('Converted post:', convertedPost)
    console.log('Post ID for like system:', convertedPost.id)
    return convertedPost
  }

  // Combine blockchain posts with existing posts
  const [convertedBlockchainPosts, setConvertedBlockchainPosts] = useState<unknown[]>([])
  
  // Convert blockchain posts asynchronously
  useEffect(() => {
    const convertPosts = async () => {
      if (blockchainPostsData.length > 0) {
        console.log('Converting blockchain posts:', blockchainPostsData.length)
        const converted = await Promise.all(
          blockchainPostsData.map(async (post) => {
            try {
              return await convertBlockchainPost(post)
            } catch (error) {
              console.error('Error converting post:', error)
              return null
            }
          })
        )
        const validPosts = converted.filter((post): post is NonNullable<typeof post> => post !== null)
        console.log('Converted blockchain posts:', validPosts.length)
        setConvertedBlockchainPosts(validPosts)
      }
    }
    
    convertPosts()
  }, [blockchainPostsData])
  
  const allPosts = useMemo(() => [...convertedBlockchainPosts, ...posts], [convertedBlockchainPosts, posts])

  console.log('Blockchain posts data:', blockchainPostsData.length)
  console.log('Converted blockchain posts:', convertedBlockchainPosts.length)
  console.log('Mock posts:', posts.length)
  console.log('Total posts to render:', allPosts.length)

  // Fetch like data for all posts when they change
  useEffect(() => {
    const fetchAllLikeData = async () => {
      if (allPosts.length > 0 && address) {
        console.log('Fetching like data for all posts...', {
          totalPosts: allPosts.length,
          userAddress: address,
          postIds: allPosts.map(p => p.id)
        })
        
        // Process posts in batches to avoid overwhelming the RPC
        const batchSize = 3
        for (let i = 0; i < allPosts.length; i += batchSize) {
          const batch = allPosts.slice(i, i + batchSize)
          await Promise.all(batch.map(post => fetchLikeData(post.id)))
          
          // Small delay between batches
          if (i + batchSize < allPosts.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        console.log('Finished fetching like data for all posts')
      } else {
        console.log('Skipping like data fetch:', {
          allPostsLength: allPosts.length,
          hasAddress: !!address
        })
      }
    }
    
    // Debounce the fetch to prevent excessive calls
    const timeoutId = setTimeout(fetchAllLikeData, 500)
    return () => clearTimeout(timeoutId)
  }, [allPosts.length, address]) // Only depend on length and address, not the entire array

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // Function to fetch like data for posts
  const fetchLikeData = async (postId: string) => {
    try {
      console.log(`Fetching like data for post ID: ${postId} (type: ${typeof postId})`)
      
      // Check if postId is a valid number for smart contract
      const numericPostId = parseInt(postId)
      if (isNaN(numericPostId)) {
        console.warn(`Post ID ${postId} is not a valid number, skipping like data fetch`)
        return
      }
      
      console.log(`Using numeric post ID: ${numericPostId} for smart contract calls`)
      
      const [likeCount, userLiked] = await Promise.all([
        getLikeCount(numericPostId),
        hasLiked(numericPostId)
      ])
      
      console.log(`Post ${postId} like data fetched:`, { count: likeCount, liked: userLiked })
      
      setPostLikes(prev => {
        const newMap = new Map(prev)
        newMap.set(postId, {
          count: likeCount,
          liked: userLiked
        })
        console.log(`Updated postLikes state for ${postId}:`, newMap.get(postId))
        return newMap
      })
      
    } catch (error) {
      console.error(`Error fetching like data for post ${postId}:`, error)
    }
  }

  const handleLike = async (postId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      setIsLiking(true)
      
      // Toggle like on smart contract
      await toggleLike(parseInt(postId))
      console.log('Like toggle transaction submitted for post:', postId)
      
      // Wait a bit for transaction to be mined, then refetch like data
      setTimeout(async () => {
        console.log('Refetching like data after toggle for post:', postId)
        await fetchLikeData(postId)
        console.log('Refetch completed for post:', postId)
      }, 3000)
      
      // Call parent callback
      onLike(parseInt(postId))
      
    } catch (error) {
      console.error('Error liking post:', error)
      alert('Failed to like post. Please try again.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleBookmark = (postId: string) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmarked post:', postId)
  }

  // const handleShare = (postId: string) => {
  //   // TODO: Implement share functionality
  //   console.log('Shared post:', postId)
  // }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Some files are too large. Maximum size is 5MB per image.')
      return
    }

    // Limit to 4 images max
    const newImages = [...selectedImages, ...imageFiles].slice(0, 4)
    setSelectedImages(newImages)

    // Create previews
    const newPreviews = await Promise.all(
      imageFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
    )
    setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 4))
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleCreatePost = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!hasProfile) {
      alert('Please create a profile first')
      return
    }

    if (!newPost.trim() && selectedImages.length === 0) {
      alert('Please add some content or images to your post')
      return
    }

    setIsPosting(true)
    setIsUploadingImages(true)
    
    try {
      const imageCids: string[] = []
      
      // Upload images to IPFS if any
      if (selectedImages.length > 0) {
        console.log('Uploading images to IPFS...')
        for (const imageFile of selectedImages) {
          const cid = await ipfsService.uploadFile(imageFile)
          imageCids.push(cid)
          console.log('Image uploaded:', cid)
        }
      }

      // Create post with images
      await createPost(newPost.trim(), imageCids)
      console.log('Post created successfully!')
      
      // Reset form
      setNewPost('')
      setSelectedImages([])
      setImagePreviews([])
      
      // Refetch posts to show the new post
      console.log('Refetching posts to show new post...')
      await refetchLatestPosts()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsPosting(false)
      setIsUploadingImages(false)
    }
  }

  return (
    <div className={`feed-container flex-1 w-full h-full ${isDarkMode ? 'bg-slate-900/20' : 'bg-gradient-to-br from-white/20 to-white/10'} backdrop-blur-xl flex flex-col`}>
      {/* Scrollable content area with hidden scrollbar */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar ${isDarkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'} px-4 lg:px-6 py-4`}>
      {/* Feed Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl lg:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Feed</h2>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm mt-1`}>Latest updates from your Web3 community</p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            <button className={`px-3 lg:px-4 py-2 ${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'} rounded-2xl text-xs lg:text-sm font-medium transition-all`}>
              Following
            </button>
            <button className={`px-3 lg:px-4 py-2 ${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'} rounded-2xl text-xs lg:text-sm font-medium transition-all`}>
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <div className={`${isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800/80' : 'bg-white/70 hover:bg-white/80'} backdrop-blur-2xl rounded-xl p-4 mb-5 border ${isDarkMode ? 'border-slate-700/50 hover:border-slate-600/70' : 'border-white/50 hover:border-white/70'} shadow-lg hover:shadow-xl transition-all duration-300 group`}>
        <div className="flex items-start space-x-3">
          {hasProfile && profileData?.avatar ? (
            <img 
              src={profileData.avatar.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
              alt={profileData.displayName || 'Profile'} 
              className="w-9 h-9 rounded-full border-2 border-white/50 group-hover:border-white/70 transition-all duration-300 object-cover" 
            />
          ) : (
            <div className="w-9 h-9 rounded-full border-2 border-white/50 group-hover:border-white/70 transition-all duration-300 flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #0000FF, #4485F3)'}}>
              <span className="text-white font-semibold text-sm">
                {address ? address.slice(2, 4).toUpperCase() : '?'}
              </span>
            </div>
          )}
          <div className="flex-1">
            {/* Twitter Style Textarea Container */}
            <div className={`relative ${isDarkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50/50 hover:bg-gray-50/70'} rounded-xl border ${isDarkMode ? 'border-slate-600/30 hover:border-slate-500/50' : 'border-gray-200/50 hover:border-gray-300/70'} transition-all duration-300 focus-within:ring-2 ${isDarkMode ? 'focus-within:ring-slate-500/50' : 'focus-within:ring-blue-500/30'} focus-within:border-opacity-100`}>
              <textarea
                placeholder={
                  !isConnected 
                    ? "Connect wallet to post..." 
                    : !hasProfile 
                      ? "Create profile first to post..." 
                      : "What's happening in Web3?"
                }
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className={`w-full bg-transparent ${isDarkMode ? 'text-slate-200 placeholder-slate-400' : 'text-slate-700 placeholder-slate-400'} border-0 focus:outline-none text-sm resize-none p-3 rounded-xl transition-all duration-300`}
                rows={2}
                disabled={!isConnected}
              />
              {/* Character Counter */}
              <div className="absolute bottom-2 right-3 text-xs opacity-60">
                <span className={newPost.length > 200 ? 'text-red-400' : isDarkMode ? 'text-slate-500' : 'text-gray-400'}>
                  {newPost.length}/280
                </span>
              </div>
            </div>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-white/20"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RoundedClose className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />

            {/* Twitter Style Action Bar */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 group-hover:border-white/30 transition-all duration-300">
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 4 || !isConnected}
                  className={`p-2 ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={selectedImages.length >= 4 ? 'Maximum 4 images' : 'Add images'}
                >
                  <RoundedImage className="w-4 h-4" />
                </button>
                <button className={`p-2 ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all duration-300 hover:scale-105`}>
                  <RoundedHash className="w-4 h-4" />
                </button>
                <button className={`p-2 ${isDarkMode ? 'text-slate-400 hover:text-green-400 hover:bg-green-500/20' : 'text-slate-500 hover:text-green-600 hover:bg-green-50'} rounded-lg transition-all duration-300 hover:scale-105`}>
                  <RoundedChart className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={(!newPost.trim() && selectedImages.length === 0) || isPosting || !isConnected}
                className={`px-5 py-1.5 ${isDarkMode ? 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500' : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600'} text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm`}
              >
                {isPosting ? (isUploadingImages ? 'Uploading...' : 'Posting...') : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {allPosts.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} p-8 text-center`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
              <RoundedMessage className={`w-8 h-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No posts yet
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-4`}>
              Be the first to share something amazing in the Web3 community!
            </p>
            <button
              onClick={() => setNewPost('Hello Web3! 👋')}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all"
            >
              Create First Post
            </button>
          </div>
        ) : (
          allPosts.map((post) => (
            <article key={post.id} className={`${isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800/80' : 'bg-white/70 hover:bg-white/80'} backdrop-blur-2xl rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} overflow-hidden transition-all shadow-lg hover:shadow-xl`}>
              {/* Post Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <img src={(post as Record<string, unknown>).author?.avatar as string} alt={(post as Record<string, unknown>).author?.username as string} className="w-10 h-10 rounded-full border-2 border-white/50" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{(post as Record<string, unknown>).author?.name as string}</h4>
                        {(post as Record<string, unknown>).author?.verified && <RoundedShield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{post.timestamp as string}</p>
                    </div>
                  </div>
                  
                  {/* Follow Button - Only show if it's not the current user's post */}
                  {(post as Record<string, unknown>).author?.address && (post as Record<string, unknown>).author?.address !== address && (
                    <div className="flex items-center ml-3">
                      <button
                        onClick={() => handleFollow((post as Record<string, unknown>).author?.address as string)}
                        disabled={isFollowing}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isUserFollowing((post as Record<string, unknown>).author?.address as string)
                            ? isDarkMode
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : isDarkMode
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                              : 'bg-blue-500/20 text-blue-600 border border-blue-500/30 hover:bg-blue-500/30'
                        }`}
                      >
                        {isFollowing ? '...' : isUserFollowing((post as Record<string, unknown>).author?.address as string) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  )}
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
                      onClick={() => handleLike(post.id)}
                      disabled={!isConnected || isLiking}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${
                        (postLikes.get(post.id)?.liked || post.liked)
                          ? `${isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50'}` 
                          : `${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <RoundedHeart className={`w-4 h-4 ${(postLikes.get(post.id)?.liked || post.liked) ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">
                        {(() => {
                          const likeData = postLikes.get(post.id)
                          const displayCount = likeData?.count ?? post.likes
                          console.log(`Rendering like count for post ${post.id}:`, {
                            postId: post.id,
                            likeData,
                            fallbackCount: post.likes,
                            displayCount
                          })
                          return formatNumber(displayCount)
                        })()}
                      </span>
                    </button>
                    
                    <button className={`flex items-center space-x-1 px-2 py-1 ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all`}>
                      <RoundedMessage className="w-4 h-4" />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </button>
                    
                    <button className={`flex items-center space-x-1 px-2 py-1 ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all`}>
                      <RoundedShare className="w-4 h-4" />
                      <span className="text-xs font-medium">{post.shares}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs flex items-center space-x-1`}>
                      <RoundedEye className="w-3 h-3" />
                      <span>{formatNumber(649)}</span>
                    </span>
                    <button 
                      onClick={() => handleBookmark(post.id)}
                      className={`p-1 ${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'} rounded-lg transition-all`}
                    >
                      <RoundedBookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className={`px-6 py-2 ${isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800/80' : 'bg-white/70 hover:bg-white/80'} ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} font-medium rounded-full border ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} transition-all backdrop-blur-2xl shadow-lg hover:shadow-xl text-sm`}>
          Load More Posts
        </button>
      </div>
      </div>
    </div>
  )
}