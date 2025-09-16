// IPFS Utility Functions for Somnia Social
// Supports multiple IPFS providers: Infura, Pinata, Web3.Storage

import { cacheService, CACHE_KEYS, CACHE_TTL } from './cache'

export interface IPFSConfig {
  provider: 'infura' | 'pinata' | 'web3storage' | 'local'
  apiKey?: string
  apiSecret?: string
  gateway?: string
}

export interface ProfileData {
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

export interface PostData {
  version: number
  type: 'post' | 'comment' | 'repost'
  text: string
  images?: string[]
  embeds?: Array<{
    type: 'link' | 'video' | 'image'
    url: string
    title?: string
    description?: string
    image?: string
  }>
  author: string
  createdAt: number
  updatedAt?: number
}

export interface BadgeMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

class IPFSService {
  private config: IPFSConfig
  private gateway: string

  constructor(config: IPFSConfig) {
    this.config = config
    this.gateway = config.gateway || 'https://ipfs.io/ipfs/'
  }

  // Upload content to IPFS
  async uploadToIPFS(content: unknown): Promise<string> {
    try {
      let cid: string

      switch (this.config.provider) {
        case 'infura':
          cid = await this.uploadToInfura(content)
          break
        case 'pinata':
          cid = await this.uploadToPinata(content)
          break
        case 'web3storage':
          cid = await this.uploadToWeb3Storage(content)
          break
        default:
          throw new Error(`Unsupported IPFS provider: ${this.config.provider}`)
      }

      return `ipfs://${cid}`
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      throw error
    }
  }

  // Fetch content from IPFS with caching and fallback
  async fetchFromIPFS(cid: string): Promise<unknown> {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.IPFS_DATA(cid)
      const cachedData = cacheService.get(cacheKey)
      
      if (cachedData) {
        console.log('IPFS data found in cache for CID:', cid)
        return cachedData
      }

      console.log('IPFSService.fetchFromIPFS called with CID:', cid)
      console.log('IPFS Gateway:', this.gateway)
      
      // Validate CID
      if (!cid || typeof cid !== 'string') {
        throw new Error('Invalid CID provided to fetchFromIPFS')
      }
      
      const cidWithoutPrefix = cid.replace('ipfs://', '')
      
      // List of gateways to try
      const gateways = [
        this.gateway,
        'https://ipfs.io/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/'
      ]
      
      let lastError: Error | null = null
      
      // Try each gateway
      for (const gateway of gateways) {
        try {
          const url = `${gateway}${cidWithoutPrefix}`
          console.log('Trying gateway:', gateway)
          console.log('Fetching from URL:', url)
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })
          
          console.log('Response status:', response.status)
          console.log('Response ok:', response.ok)
          
          if (response.ok) {
            const data = await response.json()
            console.log('IPFS data fetched successfully from:', gateway)
            console.log('IPFS data:', data)
            
            // Cache the data
            cacheService.set(cacheKey, data, CACHE_TTL.IPFS_DATA)
            console.log('IPFS data cached for CID:', cid)
            
            return data
          } else {
            console.warn(`Gateway ${gateway} failed with status: ${response.status}`)
            lastError = new Error(`Gateway ${gateway} failed: ${response.statusText}`)
          }
        } catch (gatewayError) {
          console.warn(`Gateway ${gateway} error:`, gatewayError)
          lastError = gatewayError instanceof Error ? gatewayError : new Error('Unknown gateway error')
        }
      }
      
      // If all gateways failed, throw the last error
      throw lastError || new Error('All IPFS gateways failed')
      
    } catch (error) {
      console.error('Error fetching from IPFS:', error)
      console.error('CID that failed:', cid)
      throw error
    }
  }

  // Upload to Infura IPFS
  private async uploadToInfura(content: unknown): Promise<string> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Infura API key and secret required')
    }

    const auth = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')
    
    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: JSON.stringify(content),
        options: {
          pin: true
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Infura upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.Hash
  }

  // Upload to Pinata IPFS
  private async uploadToPinata(content: unknown): Promise<string> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Pinata API key and secret required')
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.config.apiKey,
        'pinata_secret_api_key': this.config.apiSecret,
      },
      body: JSON.stringify({
        pinataContent: content,
        pinataMetadata: {
          name: `somnia-${Date.now()}.json`
        },
        pinataOptions: {
          cidVersion: 1
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  }

  // Upload to Web3.Storage
  private async uploadToWeb3Storage(content: unknown): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Web3.Storage API key required')
    }

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: JSON.stringify(content)
      })
    })

    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.cid
  }

  // Upload file (for images, etc.)
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    if (this.config.provider === 'pinata') {
      return this.uploadFileToPinata(formData)
    } else if (this.config.provider === 'infura') {
      return this.uploadFileToInfura(formData)
    } else if (this.config.provider === 'web3storage') {
      return this.uploadFileToWeb3Storage(formData)
    } else {
      throw new Error('File upload not supported for local IPFS')
    }
  }

  // Upload file to Pinata
  private async uploadFileToPinata(formData: FormData): Promise<string> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Pinata API credentials required')
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': this.config.apiKey,
        'pinata_secret_api_key': this.config.apiSecret,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Pinata file upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return `ipfs://${result.IpfsHash}`
  }

  // Upload file to Infura
  private async uploadFileToInfura(formData: FormData): Promise<string> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Infura API credentials required')
    }

    const auth = 'Basic ' + Buffer.from(
      this.config.apiKey + ':' + this.config.apiSecret
    ).toString('base64')

    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': auth,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Infura file upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return `ipfs://${result.Hash}`
  }

  // Upload file to Web3.Storage
  private async uploadFileToWeb3Storage(formData: FormData): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Web3.Storage API key required')
    }

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Web3.Storage file upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return `ipfs://${result.cid}`
  }

  // Helper functions for specific content types
  async uploadProfile(profileData: ProfileData): Promise<string> {
    return this.uploadToIPFS(profileData)
  }

  async uploadPost(postData: PostData): Promise<string> {
    return this.uploadToIPFS(postData)
  }

  async uploadBadgeMetadata(badgeData: BadgeMetadata): Promise<string> {
    return this.uploadToIPFS(badgeData)
  }

  // Get IPFS gateway URL
  getGatewayUrl(cid: string): string {
    const cidWithoutPrefix = cid.replace('ipfs://', '')
    return `${this.gateway}${cidWithoutPrefix}`
  }
}

// Default IPFS service instance
const defaultIPFSConfig: IPFSConfig = {
  provider: 'pinata', // Default to Pinata for better reliability
  apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
  gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
}

export const ipfsService = new IPFSService(defaultIPFSConfig)

// Utility functions for common operations
export const createProfileData = (
  username: string,
  displayName: string,
  bio?: string,
  avatar?: string,
  location?: string,
  links?: {
    x?: string
    github?: string
    website?: string
    discord?: string
  }
): ProfileData => ({
  version: 1,
  username,
  displayName,
  bio: bio || '',
  avatar: avatar || '',
  banner: '',
  location: location || '',
  links: links || {},
  createdAt: Math.floor(Date.now() / 1000),
  updatedAt: Math.floor(Date.now() / 1000)
})

export const createPostData = (
  text: string,
  author: string,
  type: 'post' | 'comment' | 'repost' = 'post',
  images?: string[],
  embeds?: PostData['embeds']
): PostData => ({
  version: 1,
  type,
  text,
  images: images || [],
  embeds: embeds || [],
  author,
  createdAt: Math.floor(Date.now() / 1000)
})

export const createBadgeMetadata = (
  name: string,
  description: string,
  image: string,
  tier: string,
  requirement: string
): BadgeMetadata => ({
  name,
  description,
  image,
  attributes: [
    {
      trait_type: 'Tier',
      value: tier
    },
    {
      trait_type: 'Requirement',
      value: requirement
    }
  ]
})

export default IPFSService