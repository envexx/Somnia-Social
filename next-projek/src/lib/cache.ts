// Cache service for IPFS data and other frequently accessed data
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache size for debugging
  size(): number {
    return this.cache.size
  }

  // Get all cache keys for debugging
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Singleton instance
export const cacheService = new CacheService()

// Cache keys constants
export const CACHE_KEYS = {
  PROFILE_DATA: (address: string) => `profile_${address}`,
  POSTS_DATA: (page: number = 0) => `posts_${page}`,
  USER_PROFILE: (address: string) => `user_profile_${address}`,
  HAS_PROFILE: (address: string) => `has_profile_${address}`,
  TOTAL_PROFILES: 'total_profiles',
  IPFS_DATA: (cid: string) => `ipfs_${cid}`,
} as const

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  PROFILE_DATA: 10 * 60 * 1000, // 10 minutes
  POSTS_DATA: 2 * 60 * 1000, // 2 minutes
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  HAS_PROFILE: 5 * 60 * 1000, // 5 minutes
  TOTAL_PROFILES: 30 * 60 * 1000, // 30 minutes
  IPFS_DATA: 60 * 60 * 1000, // 1 hour (IPFS data rarely changes)
} as const
