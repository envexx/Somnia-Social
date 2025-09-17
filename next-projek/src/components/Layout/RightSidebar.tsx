'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import { useProfileContract, usePostContract } from '@/hooks/useContracts'
import { ipfsService } from '@/lib/ipfs'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function RightSidebar() {
  const { address } = useAccount()
  const { isDarkMode } = useDarkMode()
  const { getProfileByOwner } = useProfileContract()
  const { latestPosts } = usePostContract()


  // Trending topics data
  const [trendingTopics] = useState([
    { topic: '#Web3', posts: '12.5K' },
    { topic: '#DeFi', posts: '8.9K' },
    { topic: '#Somnia', posts: '8.2K' },
    { topic: '#Blockchain', posts: '15.1K' },
    { topic: '#NFT', posts: '9.8K' },
  ])

  const [suggestedUsers, setSuggestedUsers] = useState<Array<{
    address: string;
    displayName: string;
    username: string;
    avatar: string;
    followers: number;
    posts: number;
    isFollowed: boolean;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [isFetching, setIsFetching] = useState(false)

  // Handle follow/unfollow functionality
  const handleFollow = (userAddress: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userAddress)) {
        newSet.delete(userAddress)
      } else {
        newSet.add(userAddress)
      }
      return newSet
    })
  }

  // Safe IPFS fetch with retry mechanism
  const safeFetchIPFS = async (profileCid: string, retries = 2): Promise<Record<string, unknown>> => {
    if (!profileCid || profileCid.includes('test') || profileCid.includes('Test') || profileCid === 'QmTestProfile' || profileCid.length < 10) {
      throw new Error(`Skipping test/invalid CID: ${profileCid}`)
    }
    
    for (let i = 0; i <= retries; i++) {
      try {
        const ipfsData = await ipfsService.fetchFromIPFS(profileCid)
        return ipfsData as Record<string, unknown>
      } catch (error) {
        console.log(`IPFS fetch attempt ${i + 1} failed for ${profileCid}:`, error)
        if (error instanceof Error && (error.message.includes('Skipping test/invalid CID') || error.message.includes('Invalid CID'))) {
          throw error
        }
        if (i === retries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw new Error('All retry attempts failed')
  }

  // Calculate follower count based on user activity
  const calculateFollowerCount = (userAddress: string, activity: { count: number, latestPost: Record<string, unknown> }) => {
    const activityCount = activity.count
    const activityLevel = activityCount > 10 ? 'High' : activityCount > 5 ? 'Medium' : 'Low'
    
    // Base followers calculation
    const baseFollowers = Math.floor(activityCount * 50) + 100
    
    // Activity multiplier based on engagement level
    const activityMultiplier = activityLevel === 'High' ? 2.5 : activityLevel === 'Medium' ? 1.5 : 1
    
    // Time decay factor (recent activity is more valuable)
    const timeSinceLastPost = Date.now() - Number(activity.latestPost.createdAt) * 1000
    const daysSinceLastPost = timeSinceLastPost / (24 * 60 * 60 * 1000)
    const timeMultiplier = Math.max(0.3, 1 - (daysSinceLastPost / 30)) // Decay over 30 days
    
    // Address-based uniqueness factor (more unique addresses might have more organic growth)
    const addressUniqueness = parseInt(userAddress.slice(-6), 16) / 0xFFFFFF // 0-1 factor
    const uniquenessMultiplier = 0.8 + (addressUniqueness * 0.4) // 0.8-1.2 range
    
    // Calculate final follower count
    const estimatedFollowers = Math.floor(baseFollowers * activityMultiplier * timeMultiplier * uniquenessMultiplier)
    
    return {
      followers: Math.max(50, estimatedFollowers), // Minimum 50 followers
      activityLevel,
      timeMultiplier,
      uniquenessMultiplier
    }
  }

  // Fetch suggested users from blockchain with caching - HANYA SEKALI
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      // Check cache first
      const cacheKey = CACHE_KEYS.SUGGESTED_USERS(address || 'anonymous')
      const cachedUsers = cacheService.get(cacheKey)
      
      if (cachedUsers && Array.isArray(cachedUsers)) {
        console.log('Using cached suggested users')
        setSuggestedUsers(cachedUsers)
        setLoading(false)
        return
      }

      if (isFetching) {
        console.log('Already fetching, skipping...')
        return
      }
      
      setIsFetching(true)
      try {
        // Get unique addresses from latest posts and count their activity
        if (latestPosts && Array.isArray(latestPosts) && latestPosts.length === 2) {
          const [postsArray] = latestPosts
          const userActivity = new Map<string, { count: number, latestPost: Record<string, unknown> }>()
          
          // Count activity for each user
          if (Array.isArray(postsArray) && postsArray.length > 0) {
            for (const post of postsArray) {
              if (post && typeof post === 'object' && 'author' in post && 'createdAt' in post) {
                const postData = post as Record<string, unknown>
                const author = postData.author as string
                
                if (author && author !== address) {
                  const existing = userActivity.get(author) || { count: 0, latestPost: postData }
                  existing.count += 1
                  if (Number(postData.createdAt) > Number(existing.latestPost.createdAt)) {
                    existing.latestPost = postData
                  }
                  userActivity.set(author, existing)
                }
              }
            }
          }
          
          // Convert to array and sort by activity
          const users = Array.from(userActivity.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3) // Top 3 most active users
          
          // Generate user data based on blockchain activity and real profile data
          const userPromises = users.map(async ([userAddress, activity]) => {
            if (!userAddress || typeof userAddress !== 'string') {
              return null
            }
            
            // Generate user data based on blockchain activity and real profile data
            const addressSuffix = userAddress.slice(-4)
            const followerData = calculateFollowerCount(userAddress, activity)
            
            // Use real profile data if available, otherwise generate from address
            let displayName = `User ${addressSuffix}`
            let username = `user_${addressSuffix.toLowerCase()}`
            let avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userAddress}`
            
            try {
              const profile = await getProfileByOwner(userAddress)
              if (profile && Array.isArray(profile) && profile.length >= 4) {
                const profileCid = profile[3] as string
                if (profileCid && profileCid !== 'QmTestProfile' && !profileCid.includes('test') && !profileCid.includes('Test') && profileCid.length >= 10) {
                  const ipfsData = await safeFetchIPFS(profileCid)
                  if (ipfsData && typeof ipfsData === 'object') {
                    const profileData = ipfsData as Record<string, unknown>
                    displayName = (profileData.displayName as string) || displayName
                    username = (profileData.username as string) || username
                    if (profileData.avatar && typeof profileData.avatar === 'string') {
                      avatar = ipfsService.convertToGatewayUrl(profileData.avatar)
                    }
                  }
                }
              }
            } catch (error) {
              console.log(`Could not fetch profile for ${userAddress}:`, error)
            }
            
            return {
              address: userAddress,
              displayName,
              username,
              avatar,
              followers: followerData.followers,
              posts: activity.count,
              isFollowed: followedUsers.has(userAddress)
            }
          })
          
          const validUsers = (await Promise.all(userPromises)).filter(user => user !== null)
          setSuggestedUsers(validUsers)
          
          // Cache the suggested users for 5 minutes
          cacheService.set(cacheKey, validUsers, CACHE_TTL.SUGGESTED_USERS)
          console.log('Suggested users cached for 5 minutes')
        } else {
          // Fallback: show empty state
          setSuggestedUsers([])
        }
      } catch (error) {
        console.error('Error fetching suggested users:', error)
        // Show empty state if there's an error
        setSuggestedUsers([])
      } finally {
        setLoading(false)
        setIsFetching(false)
      }
    }

    fetchSuggestedUsers()
  }, [address, latestPosts, followedUsers, getProfileByOwner, isFetching]) // Include all dependencies


  return (
    <div className={`w-full h-full border-l ${isDarkMode ? 'border-slate-700/50' : 'border-gray-300/60'} ${isDarkMode ? 'bg-slate-900/20' : 'bg-white/30'} backdrop-blur-xl relative flex flex-col`}>
      {/* Scrollable content area with hidden scrollbar */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar ${isDarkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'} p-3 xl:p-4`}>

      {/* Trending Topics */}
      <div className="mb-8">
        <h3 className={`font-semibold text-lg mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Trending Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-white/50 hover:bg-white/70'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'}`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {topic.topic}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {topic.posts} posts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="mb-8">
        <h3 className={`font-semibold text-lg mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Suggested Users
        </h3>
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'} animate-pulse`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'} mb-2`}></div>
                      <div className={`h-3 w-16 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'} hover:scale-105 transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src={user.avatar} 
                      alt={user.displayName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.address}`
                      }}
                    />
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.displayName}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        @{user.username} • {user.followers} followers • {user.posts} posts
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(user.address)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      followedUsers.has(user.address)
                        ? `${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'} hover:${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`
                        : `${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`
                    }`}
                  >
                    {followedUsers.has(user.address) ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-gray-200/30'}`}>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                No suggested users available
              </div>
            </div>
          )}
        </div>
      </div>

      </div>
    </div>
  )
}