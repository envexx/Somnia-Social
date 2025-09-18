'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  RoundedWallet,
  RoundedHome, 
  RoundedHash,
  RoundedUsers,
  RoundedTrendingUp,
  RoundedZap,
  RoundedStar,
  RoundedMessage
} from '@/components/icons/RoundedIcons'
import { useProfileContract } from '@/hooks/useContracts'
import { ipfsService } from '@/lib/ipfs'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import BadgeDisplay from '@/components/Badges/BadgeDisplay'
import '@/styles/hide-scrollbar.css'

interface LeftSidebarProps {
  isDarkMode?: boolean
  onShowProfile?: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  hideBrandHeader?: boolean
}

export default function LeftSidebar({ 
  isDarkMode = false, 
  onShowProfile, 
  activeTab = 'feed', 
  onTabChange,
  hideBrandHeader = false 
}: LeftSidebarProps) {
  const router = useRouter()
  // const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { userProfile, hasProfile } = useProfileContract()
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null)

  // Handle navigation
  const handleTabClick = (tab: string) => {
    if (tab === 'profile') {
      router.push('/profile')
    } else if (tab === 'feed') {
      router.push('/feed')
    } else if (tab === 'trending') {
      router.push('/trending')
    } else if (tab === 'communities') {
      router.push('/communities')
    } else {
      // For other tabs, stay on current page but update active tab
      if (onTabChange) {
        onTabChange(tab)
      }
    }
  }

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
              console.log('Profile data found in cache for sidebar:', address)
              setProfileData(cachedData as Record<string, unknown>)
              return
            }

            // Fetch from IPFS if not in cache
            const data = await ipfsService.fetchFromIPFS(profileCid)
            setProfileData(data as Record<string, unknown>)
            
            // Cache the profile data
            cacheService.set(cacheKey, data, CACHE_TTL.PROFILE_DATA)
            console.log('Profile data cached for sidebar:', address)
          }
        } catch (error) {
          console.error('Error fetching profile data for sidebar:', error)
        }
      }
    }
    fetchProfileData()
  }, [userProfile, hasProfile, address])

  return (
    <div className={`w-full h-full lg:border-r ${isDarkMode ? 'lg:border-slate-700/50' : 'lg:border-gray-300/60'} ${isDarkMode ? 'bg-slate-900/20' : 'bg-white/30'} backdrop-blur-xl flex flex-col`}>
      {/* Scrollable content area with hidden scrollbar */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar ${isDarkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'}`}>
        {/* Top Section */}
        <div className="p-3 lg:p-4 flex-shrink-0">
      
      {/* Brand Header */}
      {!hideBrandHeader && (
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
              <Image 
                src="/favicon.png" 
                alt="Somnia Social Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className={`text-lg lg:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Somnia Social</h1>
          </div>
        </div>
      )}

      {/* Profile Section - Hidden on desktop, shown on mobile */}
      <div className="lg:hidden">
        {!isConnected ? (
          // Wallet not connected - Connect Button (only visible on mobile)
          <div className="mb-6 flex justify-center">
            <ConnectButton />
          </div>
        ) : !hasProfile ? (
          // Wallet connected but no profile - show create account button
          <button 
            onClick={onShowProfile}
            className={`w-full ${isDarkMode ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'bg-blue-500/20 hover:bg-blue-500/30'} backdrop-blur-xl rounded-2xl p-4 mb-6 border ${isDarkMode ? 'border-blue-500/30' : 'border-blue-500/30'} transition-all text-left`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}}>
                <RoundedUsers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm`}>
                  Create Account
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Set up your profile
                </p>
              </div>
            </div>
          </button>
        ) : (
          // Profile exists - show profile summary
          <button 
            onClick={onShowProfile}
            className={`w-full backdrop-blur-xl rounded-2xl p-4 mb-6 border transition-all text-left`}
            style={{
              backgroundColor: isDarkMode ? 'rgba(0, 0, 255, 0.2)' : 'rgba(0, 0, 255, 0.2)',
              borderColor: isDarkMode ? 'rgba(0, 0, 255, 0.3)' : 'rgba(0, 0, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 0, 255, 0.3)' : 'rgba(0, 0, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 0, 255, 0.2)' : 'rgba(0, 0, 255, 0.2)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                {profileData?.avatar ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <Image 
                      src={ipfsService.convertToGatewayUrl(profileData.avatar as string)} 
                      alt="Profile Avatar"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}}>
                    <span className="text-white font-bold text-sm">
                      {(profileData?.displayName as string)?.charAt(0)?.toUpperCase() || (profileData?.username as string)?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-lg flex items-center justify-center bg-gradient-to-r from-emerald-400 to-cyan-400`}>
                  <RoundedWallet className="w-1.5 h-1.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm truncate`}>
                    {(profileData?.displayName as string) || (profileData?.username as string) || 'Profile'}
                  </h3>
                  <BadgeDisplay 
                    userAddress={address}
                    isDarkMode={isDarkMode}
                    size="xs"
                    showText={false}
                  />
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} truncate`}>
                  @{(profileData?.username as string) || 'username'}
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-6">
        {[
          { icon: RoundedHome, label: 'Feed', key: 'feed' },
          { icon: RoundedHash, label: 'Trending', key: 'trending' },
          { icon: RoundedUsers, label: 'Communities', key: 'communities' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabClick(item.key)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group ${
              activeTab === item.key
                ? `${isDarkMode ? 'bg-slate-700' : 'bg-slate-900'} text-white shadow-lg`
                : `${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      </div>

      {/* Web3 Tools - Full Height Bottom Section */}
      <div className={`flex-1 p-3 lg:p-4`}>
        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3 lg:mb-4 text-xs lg:text-sm uppercase tracking-wide`}>Web3 Tools</h4>
        <div className="space-y-3 h-full">
          <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-900/10'} rounded-xl transition-all cursor-pointer group`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <RoundedZap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-sm`}>DeFi Tracker</span>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monitor your DeFi portfolio</p>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-900/10'} rounded-xl transition-all cursor-pointer group`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform" style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}}>
                <RoundedStar className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-sm`}>NFT Gallery</span>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Browse and manage NFTs</p>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-900/10'} rounded-xl transition-all cursor-pointer group`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <RoundedTrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-sm`}>DAO Voting</span>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Participate in governance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
