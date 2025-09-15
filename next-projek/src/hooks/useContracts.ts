'use client'

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { useEffect } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, PROFILE_REGISTRY_ABI, POST_FEED_ABI, REACTIONS_ABI, BADGES_ABI } from '@/lib/web3-config'
import { ipfsService, createProfileData, createPostData, ProfileData, PostData } from '@/lib/ipfs'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export function useProfileContract() {
  const { address } = useAccount()
  
  const { data: totalProfiles, refetch: refetchTotalProfiles } = useReadContract({
    address: CONTRACT_ADDRESSES.ProfileRegistry as `0x${string}`,
    abi: PROFILE_REGISTRY_ABI,
    functionName: 'getTotalProfiles',
  })

  const { data: userProfile, refetch: refetchUserProfile, error: userProfileError, isLoading: userProfileLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.ProfileRegistry as `0x${string}`,
    abi: PROFILE_REGISTRY_ABI,
    functionName: 'getProfileByOwner',
    args: address ? [address] : undefined,
  })

  // Function to get profile by owner address using fetch (simplified approach)
  const getProfileByOwner = async (ownerAddress: string) => {
    try {
      console.log(`Fetching profile for owner:`, ownerAddress, typeof ownerAddress)
      
      // Ensure ownerAddress is a string
      const ownerAddr = typeof ownerAddress === 'string' ? ownerAddress : String(ownerAddress)
      
      // Return current user's profile if the address matches
      if (ownerAddr === address && userProfile) {
        console.log(`Using current user profile for ${ownerAddr}`)
        return userProfile
      }
      
      // For other addresses, try to fetch their profile using RPC call
      console.log(`Fetching profile for other user: ${ownerAddr}`)
      try {
        // Create contract interface for proper function encoding
        const contractInterface = new ethers.Interface(PROFILE_REGISTRY_ABI)
        const functionData = contractInterface.encodeFunctionData('getProfileByOwner', [ownerAddr])
        
        // Use fetch to call the RPC directly for other users
        const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: CONTRACT_ADDRESSES.ProfileRegistry,
                data: functionData
              },
              'latest'
            ],
            id: 1,
          }),
        })
        
        const data = await response.json()
        console.log(`Profile for ${ownerAddr} RPC response:`, data)
        
        // Decode the response using ethers.js
        if (data.result && data.result !== '0x') {
          try {
            // Create contract interface for decoding
            const contractInterface = new ethers.Interface(PROFILE_REGISTRY_ABI)
            
            // Decode the response
            const decoded = contractInterface.decodeFunctionResult('getProfileByOwner', data.result)
            console.log(`Decoded profile for ${ownerAddr}:`, decoded)
            
            // Return the decoded profile data
            return decoded
          } catch (decodeError) {
            console.error(`Error decoding profile for ${ownerAddr}:`, decodeError)
            return null
          }
        } else {
          console.log(`No profile found for ${ownerAddr}`)
          return null
        }
      } catch (contractError) {
        console.error(`Error fetching profile for ${ownerAddr}:`, contractError)
        return null
      }
    } catch (error) {
      console.error('Error fetching profile by owner:', error)
      return null
    }
  }

  const { data: hasProfile, refetch: refetchHasProfile, error: hasProfileError, isLoading: hasProfileLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.ProfileRegistry as `0x${string}`,
    abi: PROFILE_REGISTRY_ABI,
    functionName: 'hasProfile',
    args: address ? [address] : undefined,
  })

  // Cache userProfile data when it changes
  useEffect(() => {
    if (userProfile && address) {
      const cacheKey = CACHE_KEYS.USER_PROFILE(address)
      cacheService.set(cacheKey, userProfile, CACHE_TTL.USER_PROFILE)
      console.log('User profile cached for address:', address)
    }
  }, [userProfile, address])

  // Cache hasProfile data when it changes
  useEffect(() => {
    if (hasProfile !== undefined && address) {
      const cacheKey = CACHE_KEYS.HAS_PROFILE(address)
      cacheService.set(cacheKey, hasProfile, CACHE_TTL.HAS_PROFILE)
      console.log('Has profile cached for address:', address, hasProfile)
    }
  }, [hasProfile, address])

  // Debug logging for hasProfile
  useEffect(() => {
    console.log('useProfileContract - hasProfile changed:', hasProfile)
    console.log('useProfileContract - hasProfileLoading:', hasProfileLoading)
    console.log('useProfileContract - hasProfileError:', hasProfileError)
  }, [hasProfile, hasProfileLoading, hasProfileError])

  // Manual test function to debug contract calls
  const testContractConnection = async () => {
    if (!address) {
      console.log('No address available for testing')
      return
    }
    
    console.log('Testing contract connection...')
    console.log('Contract address:', CONTRACT_ADDRESSES.ProfileRegistry)
    console.log('User address:', address)
    
    try {
      // Test hasProfile call
      console.log('Testing hasProfile call...')
      const hasProfileResult = await refetchHasProfile()
      console.log('hasProfile result:', hasProfileResult)
      
      // Only test getProfileByOwner if hasProfile is true
      if (hasProfileResult.data === true) {
        console.log('Testing getProfileByOwner call...')
        const userProfileResult = await refetchUserProfile()
        console.log('userProfile result:', userProfileResult)
      } else {
        console.log('User does not have a profile yet. Skipping getProfileByOwner test.')
      }
    } catch (error) {
      console.error('Contract test error:', error)
      if (error instanceof Error && error.message?.includes('0x72da560b')) {
        console.log('This error means "Profile not found" - user needs to create a profile first')
      }
    }
  }

  // Auto-test when address is available
  useEffect(() => {
    if (address) {
      console.log('Address detected, testing contract connection...')
      testContractConnection()
    }
  }, [address])

  const { writeContractAsync: createProfile } = useWriteContract()
  const { writeContractAsync: updateProfile } = useWriteContract()

  const createProfileWithIPFS = async (username: string, displayName: string, bio?: string, avatar?: string, location?: string, links?: any) => {
    try {
      console.log('Starting profile creation process...')
      
      // Create profile data with all fields
      const profileData = createProfileData(username, displayName, bio, avatar, location, links)
      console.log('Profile data created:', profileData)
      
      // Upload to IPFS
      console.log('Uploading profile data to IPFS...')
      const profileCid = await ipfsService.uploadProfile(profileData)
      console.log('Profile data uploaded to IPFS:', profileCid)
      
      // Create profile on-chain
      console.log('Creating profile on smart contract...')
      console.log('Contract address:', CONTRACT_ADDRESSES.ProfileRegistry)
      console.log('Username:', username.toLowerCase())
      console.log('Profile CID:', profileCid)
      
      const txHash = await createProfile({
        address: CONTRACT_ADDRESSES.ProfileRegistry as `0x${string}`,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'createProfile',
        args: [username.toLowerCase(), profileCid],
      })
      
      console.log('Profile creation transaction submitted:', txHash)
      console.log('Waiting for transaction confirmation...')
      
      // Wait longer for transaction to be mined, then refetch data
      setTimeout(async () => {
        console.log('Refetching profile data after creation...')
        try {
          await refetchUserProfile()
          await refetchHasProfile()
          await refetchTotalProfiles()
          console.log('Profile data refetched successfully!')
        } catch (error) {
          console.error('Error refetching profile data:', error)
        }
      }, 5000) // Increased to 5 seconds
      
      return txHash
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  const updateProfileWithIPFS = async (displayName?: string, bio?: string, avatar?: string, location?: string, links?: any) => {
    try {
      console.log('Starting profile update process...')
      
      if (!userProfile) throw new Error('No existing profile found')
      
      // Get userId from userProfile (userProfile is a tuple: [userId, ownerAddr, handleHash, profileCid])
      const userId = (userProfile as any)[0]
      const existingProfileCid = (userProfile as any)[3]
      
      if (!userId) throw new Error('User ID not found')
      if (!existingProfileCid) throw new Error('Profile CID not found')
      
      console.log('User ID found:', userId)
      console.log('Profile CID found:', existingProfileCid)
      
      // Fetch existing profile data
      console.log('Fetching existing profile data from IPFS...')
      const existingData = await ipfsService.fetchFromIPFS(existingProfileCid)
      console.log('Existing profile data:', existingData)
      
      // Update profile data with all fields
      const updatedData = {
        ...existingData,
        displayName: displayName || existingData.displayName,
        bio: bio || existingData.bio,
        avatar: avatar || existingData.avatar,
        location: location || existingData.location,
        links: links || existingData.links,
        updatedAt: Math.floor(Date.now() / 1000)
      }
      console.log('Updated profile data:', updatedData)
      
      // Upload updated data to IPFS
      console.log('Uploading updated profile data to IPFS...')
      const newProfileCid = await ipfsService.uploadProfile(updatedData)
      console.log('Updated profile data uploaded to IPFS:', newProfileCid)
      
      // Update profile on-chain (requires userId and profileCid)
      console.log('Updating profile on smart contract...')
      const txHash = await updateProfile({
        address: CONTRACT_ADDRESSES.ProfileRegistry as `0x${string}`,
        abi: PROFILE_REGISTRY_ABI,
        functionName: 'updateProfile',
        args: [userId, newProfileCid],
      })
      
      console.log('Profile update transaction submitted:', txHash)
      
      // Wait a bit for transaction to be mined, then refetch data
      setTimeout(async () => {
        console.log('Refetching profile data after update...')
        await refetchUserProfile()
        await refetchHasProfile()
        await refetchTotalProfiles()
      }, 2000)
      
      return txHash
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  return {
    totalProfiles,
    userProfile,
    hasProfile,
    createProfile: createProfileWithIPFS,
    updateProfile: updateProfileWithIPFS,
    getProfileByOwner,
    // Debug functions
    testContractConnection,
    refetchUserProfile,
    refetchHasProfile,
    refetchTotalProfiles,
    // Debug data
    userProfileLoading,
    userProfileError,
    hasProfileLoading,
    hasProfileError,
  }
}

export function usePostContract() {
  const { address } = useAccount()
  
  const { data: totalPosts } = useReadContract({
    address: CONTRACT_ADDRESSES.PostFeed as `0x${string}`,
    abi: POST_FEED_ABI,
    functionName: 'getUserPostCount',
    args: address ? [address] : undefined,
  })

  const { data: latestPosts, refetch: refetchLatestPosts } = useReadContract({
    address: CONTRACT_ADDRESSES.PostFeed as `0x${string}`,
    abi: POST_FEED_ABI,
    functionName: 'latest',
    args: [BigInt(0), BigInt(10)], // cursor: 0, limit: 10
  })

  const { data: userPosts, refetch: refetchUserPosts } = useReadContract({
    address: CONTRACT_ADDRESSES.PostFeed as `0x${string}`,
    abi: POST_FEED_ABI,
    functionName: 'getPostsByAuthor',
    args: address ? [address, BigInt(0), BigInt(10)] : undefined, // cursor: 0, limit: 10
  })

  // Debug logging for userPosts
  useEffect(() => {
    if (userPosts) {
      console.log('User posts data from contract:', userPosts)
      console.log('User posts type:', typeof userPosts)
      console.log('User posts is array:', Array.isArray(userPosts))
      if (Array.isArray(userPosts) && userPosts[0]) {
        console.log('First element (posts array):', userPosts[0])
        console.log('Posts array length:', userPosts[0].length)
        if (userPosts[0].length > 0) {
          console.log('First post data:', userPosts[0][0])
        }
      }
    }
  }, [userPosts])

  // Function to get individual post by ID using wagmi
  const getPostById = async (postId: number) => {
    try {
      console.log(`Fetching post ${postId} from contract`)
      
      // Use fetch to call the RPC directly since we can't use useReadContract in async function
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: CONTRACT_ADDRESSES.PostFeed,
              data: `0x${postId.toString(16).padStart(64, '0')}` // This is a simplified approach
            },
            'latest'
          ],
          id: 1,
        }),
      })
      
      const data = await response.json()
      console.log(`Post ${postId} RPC response:`, data)
      
      // For now, return null as we need proper ABI encoding
      // In production, you'd decode the response using the contract ABI
      return null
    } catch (error) {
      console.error('Error fetching post by ID:', error)
      return null
    }
  }

  const { writeContractAsync: createPost } = useWriteContract()

  const createPostWithIPFS = async (text: string, images?: string[], embeds?: PostData['embeds'], replyTo?: number, repostOf?: number) => {
    try {
      if (!address) throw new Error('Wallet not connected')
      
      // Create post data
      const postData = createPostData(text, address, 'post', images, embeds)
      
      // Upload to IPFS
      const postCid = await ipfsService.uploadPost(postData)
      
      // Create post on-chain
      const txHash = await createPost({
        address: CONTRACT_ADDRESSES.PostFeed as `0x${string}`,
        abi: POST_FEED_ABI,
        functionName: 'createPost',
        args: [postCid, BigInt(replyTo || 0), BigInt(repostOf || 0)],
      })
      
      console.log('Post creation transaction submitted:', txHash)
      
      // Wait a bit for transaction to be mined, then refetch posts
      setTimeout(async () => {
        console.log('Refetching posts after creation...')
        await refetchLatestPosts()
      }, 3000)
      
      return txHash
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  const getPostWithIPFS = async (postId: number) => {
    try {
      // This would need to be implemented with a custom hook or direct contract call
      // For now, we'll return the basic post data
      return { postId, needsIPFSFetch: true }
    } catch (error) {
      console.error('Error fetching post:', error)
      throw error
    }
  }

  return {
    totalPosts,
    latestPosts,
    userPosts,
    createPost: createPostWithIPFS,
    getPost: getPostWithIPFS,
    refetchLatestPosts,
    refetchUserPosts,
    getPostById,
  }
}

export function useReactionsContract() {
  const { address } = useAccount()
  
  const { writeContractAsync: toggleLikeAsync } = useWriteContract()

  // Function to toggle like for a specific post
  const toggleLike = async (postId: number) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log(`Toggling like for post ${postId}`)
      
      const txHash = await toggleLikeAsync({
        address: CONTRACT_ADDRESSES.Reactions as `0x${string}`,
        abi: REACTIONS_ABI,
        functionName: 'toggleLike',
        args: [BigInt(postId)],
      })
      
      console.log('Like toggle transaction submitted:', txHash)
      return txHash
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  // Function to check if user has liked a post
  const hasLiked = async (postId: number): Promise<boolean> => {
    if (!address) return false

    try {
      // Use fetch to call the RPC directly
      const contractInterface = new ethers.Interface(REACTIONS_ABI)
      const functionData = contractInterface.encodeFunctionData('hasLiked', [BigInt(postId), address])
      
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: CONTRACT_ADDRESSES.Reactions,
              data: functionData
            },
            'latest'
          ],
          id: 1,
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      
      const data = await response.json()
      console.log(`Has liked ${postId} RPC response:`, data)
      
      // Check for RPC errors
      if (data.error) {
        console.error(`RPC error checking like status for post ${postId}:`, data.error)
        return false
      }
      
      if (data.result && data.result !== '0x') {
        const decoded = contractInterface.decodeFunctionResult('hasLiked', data.result)
        return decoded[0] // Returns boolean
      }
      
      return false
    } catch (error) {
      console.error('Error checking like status:', error)
      return false
    }
  }

  // Function to get like count for a post
  const getLikeCount = async (postId: number): Promise<number> => {
    try {
      const contractInterface = new ethers.Interface(REACTIONS_ABI)
      const functionData = contractInterface.encodeFunctionData('getLikeCount', [BigInt(postId)])
      
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: CONTRACT_ADDRESSES.Reactions,
              data: functionData
            },
            'latest'
          ],
          id: 1,
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      
      const data = await response.json()
      console.log(`Like count for ${postId} RPC response:`, data)
      
      // Check for RPC errors
      if (data.error) {
        console.error(`RPC error getting like count for post ${postId}:`, data.error)
        // If it's a timeout or connection error, we might want to retry
        if (data.error.code === -32603 || data.error.message?.includes('timeout')) {
          console.log(`Retrying like count fetch for post ${postId}...`)
          // Simple retry mechanism
          try {
            const retryResponse = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [
                  {
                    to: CONTRACT_ADDRESSES.Reactions,
                    data: functionData
                  },
                  'latest'
                ],
                id: 1,
              }),
              signal: AbortSignal.timeout(5000), // Shorter timeout for retry
            })
            
            const retryData = await retryResponse.json()
            if (retryData.result && retryData.result !== '0x') {
              const decoded = contractInterface.decodeFunctionResult('getLikeCount', retryData.result)
              return Number(decoded[0])
            }
          } catch (retryError) {
            console.error(`Retry failed for post ${postId}:`, retryError)
          }
        }
        return 0
      }
      
      if (data.result && data.result !== '0x') {
        const decoded = contractInterface.decodeFunctionResult('getLikeCount', data.result)
        return Number(decoded[0]) // Returns likeCount
      }
      
      return 0
    } catch (error) {
      console.error('Error getting like count:', error)
      return 0
    }
  }

  return {
    toggleLike,
    hasLiked,
    getLikeCount,
  }
}

export function useBadgesContract() {
  const { address } = useAccount()
  
  const { data: userTiers } = useReadContract({
    address: CONTRACT_ADDRESSES.Badges as `0x${string}`,
    abi: BADGES_ABI,
    functionName: 'getUserTiers',
    args: address ? [address] : undefined,
  })

  const { data: highestTier } = useReadContract({
    address: CONTRACT_ADDRESSES.Badges as `0x${string}`,
    abi: BADGES_ABI,
    functionName: 'tierOf',
    args: address ? [address] : undefined,
  })

  return {
    userTiers,
    highestTier,
  }
}
