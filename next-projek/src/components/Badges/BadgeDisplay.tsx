'use client'

import { useBadgesContract } from '@/hooks/useContracts'

interface BadgeDisplayProps {
  userAddress?: string
  isDarkMode?: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

interface BadgeInfo {
  tier: number
  name: string
  color: string
  bgColor: string
  icon: string
}

const BADGE_CONFIG: Record<number, BadgeInfo> = {
  0: {
    tier: 0,
    name: 'Beginner',
    color: '#10B981',
    bgColor: '#10B98110',
    icon: '🌱'
  },
  1: {
    tier: 1,
    name: 'Explorer',
    color: '#3B82F6',
    bgColor: '#3B82F610',
    icon: '🔍'
  },
  2: {
    tier: 2,
    name: 'Influencer',
    color: '#F59E0B',
    bgColor: '#F59E0B10',
    icon: '⭐'
  },
  3: {
    tier: 3,
    name: 'Leader',
    color: '#8B5CF6',
    bgColor: '#8B5CF610',
    icon: '👑'
  },
  4: {
    tier: 4,
    name: 'Legend',
    color: '#EF4444',
    bgColor: '#EF444410',
    icon: '🏆'
  }
}

export default function BadgeDisplay({ 
  userAddress, 
  isDarkMode = false, 
  size = 'md',
  showText = true,
  className = ''
}: BadgeDisplayProps) {
  const { userTiers, highestTier } = useBadgesContract()

  // Use provided userAddress or current user's address
  const address = userAddress

  // Get size classes
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  // Get badges to display
  const badgesToShow = userTiers && Array.isArray(userTiers) ? userTiers : []
  const highestTierValue = highestTier ? Number(highestTier) : 0

  // Determine which badge to show
  let displayTier = highestTierValue
  
  // If user has no badges from contract, show Beginner badge
  if (badgesToShow.length === 0 && highestTierValue === 0) {
    displayTier = 0 // Beginner tier
  }

  // Get the badge info to display
  const displayBadge = BADGE_CONFIG[displayTier]

  // If no badge config found, don't render anything
  if (!displayBadge) {
    return null
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Display badge */}
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 transition-all hover:scale-110`}
        style={{
          backgroundColor: displayBadge.bgColor,
          borderColor: displayBadge.color,
          color: displayBadge.color
        }}
        title={`${displayBadge.name} Badge`}
      >
        <span className="leading-none">{displayBadge.icon}</span>
      </div>

      {/* Show badge name if requested */}
      {showText && (
        <span 
          className={`${textSizeClasses[size]} font-medium`}
          style={{ color: displayBadge.color }}
        >
          {displayBadge.name}
        </span>
      )}

      {/* Show additional badges count if user has multiple tiers (only for contract badges, not Beginner) */}
      {badgesToShow.length > 1 && displayTier > 0 && (
        <div 
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
          title={`${badgesToShow.length} badges total`}
        >
          <span className={`${textSizeClasses[size]} font-bold`}>
            +{badgesToShow.length - 1}
          </span>
        </div>
      )}
    </div>
  )
}

// Component for displaying all user badges
export function AllBadgesDisplay({ 
  userAddress, 
  isDarkMode = false, 
  className = '' 
}: Omit<BadgeDisplayProps, 'size' | 'showText'>) {
  const { userTiers } = useBadgesContract()
  
  const badgesToShow = userTiers && Array.isArray(userTiers) ? userTiers : []

  // Always show Beginner badge if user has no contract badges
  const allBadges = badgesToShow.length === 0 ? [0] : badgesToShow

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {allBadges.map((tier) => {
        const badgeInfo = BADGE_CONFIG[Number(tier)]
        if (!badgeInfo) return null

        return (
          <div
            key={tier}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all hover:scale-105"
            style={{
              backgroundColor: badgeInfo.bgColor,
              borderColor: badgeInfo.color,
            }}
          >
            <span className="text-lg">{badgeInfo.icon}</span>
            <span 
              className="text-sm font-medium"
              style={{ color: badgeInfo.color }}
            >
              {badgeInfo.name}
            </span>
            {Number(tier) === 0 && (
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                (New User)
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
