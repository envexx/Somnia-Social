'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  RoundedSearch,
  RoundedSun, 
  RoundedMoon, 
  RoundedBell,
  RoundedUsers,
  RoundedWallet,
  RoundedMessage
} from '@/components/icons/RoundedIcons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useProfileContract } from '@/hooks/useContracts'
import { ipfsService } from '@/lib/ipfs'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  onShowProfile?: () => void
}

export default function Header({ isDarkMode, toggleDarkMode, onShowProfile }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { address, isConnected } = useAccount()
  const { userProfile, hasProfile } = useProfileContract()
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null)

  // Fetch profile data from IPFS when userProfile changes (with caching)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (userProfile && hasProfile && address) {
        try {
          const profileCid = (userProfile as unknown as unknown[])[3] as string // userProfile is a tuple: [userId, ownerAddr, handleHash, profileCid]
          if (profileCid) {
            // Check cache first
            const cacheKey = CACHE_KEYS.PROFILE_DATA(address)
            const cachedData = cacheService.get(cacheKey)
            
            if (cachedData) {
              console.log('Profile data found in cache for header:', address)
              setProfileData(cachedData as Record<string, unknown>)
              return
            }

            // Fetch from IPFS if not in cache
            const data = await ipfsService.fetchFromIPFS(profileCid)
            setProfileData(data as Record<string, unknown>)
            
            // Cache the profile data
            cacheService.set(cacheKey, data, CACHE_TTL.PROFILE_DATA)
            console.log('Profile data cached for header:', address)
          }
        } catch (error) {
          console.error('Error fetching profile data for header:', error)
        }
      }
    }
    fetchProfileData()
  }, [userProfile, hasProfile, address])

  return (
    <header className="hidden lg:block fixed top-0 right-0 w-[calc(100%-20rem)] xl:w-[calc(100%-20rem-22rem)] z-50">
      <div className="px-4 xl:px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative">
              <RoundedSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search posts, people, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 pl-10 pr-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 placeholder-gray-500 border-0 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 xl:space-x-4">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 xl:p-3 rounded-xl transition-all hover:scale-105 ${
                isDarkMode 
                  ? 'bg-slate-800/80 text-yellow-400 hover:bg-slate-700/80' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
              }`}
            >
              {isDarkMode ? <RoundedSun className="w-4 h-4 xl:w-5 xl:h-5" /> : <RoundedMoon className="w-4 h-4 xl:w-5 xl:h-5" />}
            </button>

            {/* Connect Wallet */}
            <div className="mr-1 xl:mr-2">
              <ConnectButton />
            </div>

            {/* Notifications */}
            <button className={`p-2 xl:p-3 rounded-xl transition-all hover:scale-105 ${
              isDarkMode 
                ? 'bg-slate-800/80 text-gray-300 hover:bg-slate-700/80' 
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}>
              <RoundedBell className="w-4 h-4 xl:w-5 xl:h-5" />
            </button>

            {/* Profile Section */}
            {!isConnected ? (
              // Wallet not connected - show default profile icon
              <button className={`p-2 xl:p-3 rounded-xl transition-all hover:scale-105 ${
                isDarkMode 
                  ? 'bg-slate-800/80 text-gray-300 hover:bg-slate-700/80' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
              }`}>
                <RoundedUsers className="w-4 h-4 xl:w-5 xl:h-5" />
              </button>
            ) : !hasProfile ? (
              // Wallet connected but no profile - show create account button
              <button 
                onClick={onShowProfile}
                className={`p-2 xl:p-3 rounded-xl transition-all hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                    : 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                }`}
                title="Create Account"
              >
                <RoundedUsers className="w-4 h-4 xl:w-5 xl:h-5" />
              </button>
            ) : (
              // Profile exists - show profile avatar
              <button 
                onClick={onShowProfile}
                className="p-1 xl:p-1.5 rounded-xl transition-all hover:scale-105"
                title={`${(profileData?.displayName as string) || (profileData?.username as string) || 'Profile'}`}
              >
                <div className="relative">
                  {profileData?.avatar ? (
                    <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl overflow-hidden">
                      <Image 
                        src={ipfsService.convertToGatewayUrl(profileData.avatar as string)} 
                        alt="Profile Avatar"
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}}>
                      <span className="text-white font-bold text-xs xl:text-sm">
                        {(profileData?.displayName as string)?.charAt(0)?.toUpperCase() || (profileData?.username as string)?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-400 to-cyan-400`}>
                    <RoundedWallet className="w-1 h-1 xl:w-1.5 xl:h-1.5 text-white" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
