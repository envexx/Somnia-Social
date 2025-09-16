'use client'

import { useAccount, useSignTypedData } from 'wagmi'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, BATCH_RELAYER_ABI, POST_FEED_ABI, REACTIONS_ABI, PROFILE_REGISTRY_ABI } from '@/lib/web3-config'
import { ipfsService, createPostData, createProfileData, PostData, ProfileData } from '@/lib/ipfs'

// EIP-712 Domain untuk BatchRelayer
const BATCH_DOMAIN = {
  name: 'BatchRelayer',
  version: '1',
  chainId: 50312, // Somnia Testnet
  verifyingContract: CONTRACT_ADDRESSES.BatchRelayer as `0x${string}`,
}

// EIP-712 Types untuk batch execution (harus sesuai dengan contract)
const BATCH_TYPES = {
  BatchExecution: [
    { name: 'user', type: 'address' },
    { name: 'calls', type: 'Call[]' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  Call: [
    { name: 'target', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
}

// Interface untuk batch call
export interface BatchCall {
  target: string
  value: number
  data: string
}

// Interface untuk batch execution
export interface BatchExecution {
  user: string
  calls: BatchCall[]
  nonce: number
  deadline: number
}

export function useGaslessTransactions() {
  const { address } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  // Fungsi untuk mendapatkan nonce user dari BatchRelayer
  const getUserNonce = async (userAddress: string): Promise<number> => {
    try {
      const contractInterface = new ethers.Interface(BATCH_RELAYER_ABI)
      const functionData = contractInterface.encodeFunctionData('nonce', [userAddress])
      
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
              to: CONTRACT_ADDRESSES.BatchRelayer,
              data: functionData
            },
            'latest'
          ],
          id: 1,
        }),
      })
      
      const data = await response.json()
      
      if (data.result && data.result !== '0x') {
        const decoded = contractInterface.decodeFunctionResult('nonce', data.result)
        return Number(decoded[0])
      }
      
      return 0
    } catch (error) {
      console.error('Error getting user nonce:', error)
      return 0
    }
  }

  // Fungsi untuk membuat EIP-712 signature untuk batch execution
  const signBatchExecution = async (calls: BatchCall[], deadline: number): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      const nonce = await getUserNonce(address)
      
      const batchExecution: BatchExecution = {
        user: address,
        calls,
        nonce,
        deadline,
      }

      console.log('=== EIP-712 Signature Debug ===')
      console.log('Domain:', BATCH_DOMAIN)
      console.log('Types:', BATCH_TYPES)
      console.log('Batch Execution:', batchExecution)
      console.log('User address:', address)
      console.log('Calls count:', calls.length)
      console.log('Nonce:', nonce)
      console.log('Deadline:', deadline)
      console.log('Current timestamp:', Math.floor(Date.now() / 1000))
      
      const signature = await signTypedDataAsync({
        domain: BATCH_DOMAIN,
        types: BATCH_TYPES,
        primaryType: 'BatchExecution',
        message: batchExecution as unknown as Record<string, unknown>,
      })

      console.log('Signature generated:', signature)
      console.log('=== End EIP-712 Debug ===')

      return signature
    } catch (error) {
      console.error('Error signing batch execution:', error)
      throw error
    }
  }

  // Fungsi untuk mengirim batch ke sponsor service
  const relayBatch = async (calls: BatchCall[], deadline: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    try {
      const signature = await signBatchExecution(calls, deadline)
      
      const response = await fetch('/api/relay-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: address,
          calls,
          nonce: await getUserNonce(address!),
          deadline,
          signature,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to relay batch')
      }

      return result
    } catch (error) {
      console.error('Error relaying batch:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Fungsi untuk membuat post secara gasless
  const createGaslessPost = async (
    text: string, 
    images?: string[], 
    embeds?: PostData['embeds'], 
    replyTo?: number, 
    repostOf?: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      console.log('Creating gasless post...')
      
      // 1. Buat post data dan upload ke IPFS
      const postData = createPostData(text, address, 'post', images, embeds)
      const postCid = await ipfsService.uploadPost(postData)
      console.log('Post uploaded to IPFS:', postCid)
      
      // 2. Siapkan batch call untuk createPost
      const postFeedInterface = new ethers.Interface(POST_FEED_ABI)
      const createPostCallData = postFeedInterface.encodeFunctionData('createPost', [
        postCid,
        BigInt(replyTo || 0),
        BigInt(repostOf || 0),
        address // Add user address for gasless transactions
      ])
      
      const calls: BatchCall[] = [{
        target: CONTRACT_ADDRESSES.PostFeed,
        value: 0,
        data: createPostCallData
      }]
      
      // 3. Set deadline (1 jam dari sekarang)
      const deadline = Math.floor(Date.now() / 1000) + 3600
      
      // 4. Relay batch (user hanya sign, sponsor yang bayar gas)
      const result = await relayBatch(calls, deadline)
      
      if (result.success) {
        console.log('Gasless post created successfully:', result.txHash)
      }
      
      return result
    } catch (error) {
      console.error('Error creating gasless post:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Fungsi untuk toggle like secara gasless
  const toggleGaslessLike = async (postId: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      console.log('Toggling gasless like for post:', postId)
      
      // 1. Siapkan batch call untuk toggleLike
      const reactionsInterface = new ethers.Interface(REACTIONS_ABI)
      // Contract expects uint64 postId and address user
      const toggleLikeData = reactionsInterface.encodeFunctionData('toggleLike', [postId, address])
      
      const calls: BatchCall[] = [{
        target: CONTRACT_ADDRESSES.Reactions,
        value: 0,
        data: toggleLikeData
      }]
      
      // 2. Set deadline (1 jam dari sekarang)
      const deadline = Math.floor(Date.now() / 1000) + 3600
      
      // 3. Relay batch (user hanya sign, sponsor yang bayar gas)
      const result = await relayBatch(calls, deadline)
      
      if (result.success) {
        console.log('Gasless like toggled successfully:', result.txHash)
      }
      
      return result
    } catch (error) {
      console.error('Error toggling gasless like:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Fungsi untuk membuat profile secara gasless
  const createGaslessProfile = async (
    username: string, 
    displayName: string, 
    bio?: string, 
    avatar?: string, 
    location?: string, 
    links?: Record<string, unknown>
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      console.log('Creating gasless profile...')
      
      // 1. Buat profile data dan upload ke IPFS
      const profileData = createProfileData(username, displayName, bio, avatar, location, links)
      const profileCid = await ipfsService.uploadProfile(profileData)
      console.log('Profile uploaded to IPFS:', profileCid)
      
      // 2. Siapkan batch call untuk createProfile
      const profileInterface = new ethers.Interface(PROFILE_REGISTRY_ABI)
      const createProfileCallData = profileInterface.encodeFunctionData('createProfile', [
        username.toLowerCase(),
        profileCid,
        address // Add user address for gasless transactions
      ])
      
      const calls: BatchCall[] = [{
        target: CONTRACT_ADDRESSES.ProfileRegistry,
        value: 0,
        data: createProfileCallData
      }]
      
      // 3. Set deadline (1 jam dari sekarang)
      const deadline = Math.floor(Date.now() / 1000) + 3600
      
      // 4. Relay batch (user hanya sign, sponsor yang bayar gas)
      const result = await relayBatch(calls, deadline)
      
      if (result.success) {
        console.log('Gasless profile created successfully:', result.txHash)
      }
      
      return result
    } catch (error) {
      console.error('Error creating gasless profile:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Fungsi untuk batch multiple actions secara gasless
  const executeGaslessBatch = async (actions: {
    type: 'createPost' | 'toggleLike' | 'createProfile' | 'updateProfile'
    data: any
  }[]): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      console.log('Executing gasless batch with actions:', actions)
      
      const calls: BatchCall[] = []
      
      // Process each action and add to batch calls
      for (const action of actions) {
        switch (action.type) {
          case 'createPost':
            const postData = createPostData(action.data.text, address, 'post', action.data.images, action.data.embeds)
            const postCid = await ipfsService.uploadPost(postData)
            const postFeedInterface = new ethers.Interface(POST_FEED_ABI)
            const createPostCallData = postFeedInterface.encodeFunctionData('createPost', [
              postCid,
              BigInt(action.data.replyTo || 0),
              BigInt(action.data.repostOf || 0),
              address // Add user address for gasless transactions
            ])
            calls.push({
              target: CONTRACT_ADDRESSES.PostFeed,
              value: 0,
              data: createPostCallData
            })
            break
            
          case 'toggleLike':
            const reactionsInterface = new ethers.Interface(REACTIONS_ABI)
            // Contract expects uint64 postId and address user
            const toggleLikeData = reactionsInterface.encodeFunctionData('toggleLike', [action.data.postId, address])
            calls.push({
              target: CONTRACT_ADDRESSES.Reactions,
              value: 0,
              data: toggleLikeData
            })
            break
            
          case 'createProfile':
            const profileData = createProfileData(
              action.data.username, 
              action.data.displayName, 
              action.data.bio, 
              action.data.avatar, 
              action.data.location, 
              action.data.links
            )
            const profileCid = await ipfsService.uploadProfile(profileData)
            const profileInterface = new ethers.Interface(PROFILE_REGISTRY_ABI)
            const createProfileCallData = profileInterface.encodeFunctionData('createProfile', [
              action.data.username.toLowerCase(),
              profileCid,
              address // Add user address for gasless transactions
            ])
            calls.push({
              target: CONTRACT_ADDRESSES.ProfileRegistry,
              value: 0,
              data: createProfileCallData
            })
            break
        }
      }
      
      if (calls.length === 0) {
        return { success: false, error: 'No valid actions to execute' }
      }
      
      // Set deadline (1 jam dari sekarang)
      const deadline = Math.floor(Date.now() / 1000) + 3600
      
      // Relay batch (user hanya sign, sponsor yang bayar gas)
      const result = await relayBatch(calls, deadline)
      
      if (result.success) {
        console.log('Gasless batch executed successfully:', result.txHash)
      }
      
      return result
    } catch (error) {
      console.error('Error executing gasless batch:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  return {
    // Individual gasless functions
    createGaslessPost,
    toggleGaslessLike,
    createGaslessProfile,
    
    // Batch execution
    executeGaslessBatch,
    
    // Utility functions
    getUserNonce,
    signBatchExecution,
    relayBatch,
  }
}
