'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Zap, Award, Crown, ChevronRight, Trophy } from 'lucide-react';
import { useBadgesContract } from '@/hooks/useContracts'

interface BadgeDisplayProps {
  userAddress?: string
  isDarkMode?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

interface BadgeInfo {
  id: string
  name: string
  level: number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  color: string
  requirement: { posts: number; likes: number }
  description: string
  earned: boolean
  progress?: number
  rarity: string
}

const BADGE_CONFIG: Record<number, BadgeInfo> = {
  0: {
    id: 'beginner',
    name: 'Beginner',
    level: 0,
    icon: Star,
    gradient: 'from-slate-400 to-slate-600',
    color: '#64748b',
    requirement: { posts: 0, likes: 0 },
    description: 'Welcome to Somnia Social - Start your journey',
    earned: true,
    rarity: 'Common'
  },
  1: {
    id: 'explorer',
    name: 'Explorer',
    level: 1,
    icon: Star,
    gradient: 'from-slate-400 to-slate-600',
    color: '#64748b',
    requirement: { posts: 10, likes: 20 },
    description: 'Begin exploring the Somnia community',
    earned: true,
    rarity: 'Common'
  },
  2: {
    id: 'influencer',
    name: 'Influencer',
    level: 2,
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
    color: '#3b82f6',
    requirement: { posts: 1000, likes: 5000 },
    description: 'Growing your influence with 1000+ followers',
    earned: false,
    progress: 15,
    rarity: 'Rare'
  },
  3: {
    id: 'leader',
    name: 'Leader',
    level: 3,
    icon: Award,
    gradient: 'from-violet-500 to-purple-600',
    color: '#8b5cf6',
    requirement: { posts: 5, likes: 100 },
    description: 'Community leadership through events and spaces',
    earned: false,
    progress: 25,
    rarity: 'Epic'
  },
  4: {
    id: 'legend',
    name: 'Legend',
    level: 4,
    icon: Crown,
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    color: '#f59e0b',
    requirement: { posts: 10000, likes: 50000 },
    description: 'Elite status with 10,000+ followers and high NPS',
    earned: false,
    progress: 5,
    rarity: 'Legendary'
  }
}

// Minimal badge component
const MiniBadge = ({ badge, size = 40, isDarkMode = false, onClick }: { badge: BadgeInfo; size?: number; isDarkMode?: boolean; onClick?: () => void }) => {
  const Icon = badge.icon;
  
  return (
    <div className="relative group" onClick={onClick}>
      <div 
        className={`
          rounded-full bg-gradient-to-br ${badge.gradient}
          flex items-center justify-center
          transition-all duration-300
          ${badge.earned ? 'shadow-lg shadow-black/20 hover:shadow-xl hover:scale-110' : 'opacity-40 grayscale'}
          border-2 border-white/20
          ${onClick ? 'cursor-pointer' : ''}
        `}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Icon 
          className="text-white drop-shadow-sm" 
        />
      </div>
      
      {badge.earned && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm">
          <div className="w-full h-full rounded-full bg-green-400 animate-ping"></div>
          <div className="absolute inset-0 w-full h-full rounded-full bg-green-300 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

// Modern card component
const BadgeCard = ({ badge, compact = false, isDarkMode = false, onClick }: { badge: BadgeInfo; compact?: boolean; isDarkMode?: boolean; onClick?: () => void }) => {
  const Icon = badge.icon;
  
  return (
    <div 
      className={`
        group relative overflow-hidden
        ${compact ? 'p-4' : 'p-6'} 
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-2xl transition-all duration-300
        hover:border-gray-300 dark:hover:border-gray-700
        hover:shadow-xl hover:shadow-black/5
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl 
            bg-gradient-to-br ${badge.gradient}
            flex items-center justify-center
            transition-transform duration-300 group-hover:scale-110
          `}>
            <Icon className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {badge.name}
            </h3>
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {badge.rarity}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {badge.earned ? (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          ) : (
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          )}
          <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Stats */}
      {!compact && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Posts required</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {badge.requirement.posts}+
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Likes required</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {badge.requirement.likes}+
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      {!badge.earned && badge.progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{badge.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${badge.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${badge.progress}%` }}
            />
          </div>
        </div>
      )}

      {badge.earned && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <Trophy size={14} />
          Earned
        </div>
      )}
    </div>
  );
};

// Profile badge strip
const ProfileBadges = ({ badges = ['explorer', 'influencer'], isDarkMode = false }: { badges?: string[]; isDarkMode?: boolean }) => {
  const userBadges = Object.values(BADGE_CONFIG).filter(badge => 
    badges.includes(badge.id) && badge.earned
  );

  return (
    <div className="flex items-center gap-2">
      {userBadges.map(badge => (
        <MiniBadge key={badge.id} badge={badge} size={32} isDarkMode={isDarkMode} />
      ))}
      {userBadges.length > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

// Badge detail modal
const BadgeDetail = ({ badge, onClose, isDarkMode = false }: { badge: BadgeInfo | null; onClose: () => void; isDarkMode?: boolean }) => {
  const Icon = badge?.icon;
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!badge) return;
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [badge]);

  // Handle escape key
  useEffect(() => {
    if (!badge) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, badge]);
  
  if (!badge) return null;
  
  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-black/50 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-xl
            bg-gradient-to-br ${badge.gradient}
            flex items-center justify-center
            shadow-lg
          `}>
            {Icon && <Icon className="text-white" />}
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {badge.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {badge.description}
          </p>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Rarity</span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">{badge.rarity}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Posts needed</span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">{badge.requirement.posts}+</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Likes needed</span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">{badge.requirement.likes}+</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document.body level
  return createPortal(modalContent, document.body);
};

export default function BadgeDisplay({ 
  userAddress, 
  isDarkMode = false, 
  size = 'md',
  showText = true,
  className = ''
}: BadgeDisplayProps) {
  const { userTiers, highestTier } = useBadgesContract()

  // Get size classes
  const sizeClasses = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48
  }

  const textSizeClasses = {
    xs: 'text-xs',
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
      <MiniBadge 
        badge={displayBadge} 
        size={sizeClasses[size]} 
        isDarkMode={isDarkMode}
      />

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
          className={`w-${sizeClasses[size] === 32 ? '8' : sizeClasses[size] === 40 ? '10' : '12'} h-${sizeClasses[size] === 32 ? '8' : sizeClasses[size] === 40 ? '10' : '12'} rounded-full flex items-center justify-center border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
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
  userAddress: _userAddress, 
  isDarkMode = false, 
  className = '' 
}: Omit<BadgeDisplayProps, 'size' | 'showText'>) {
  const { userTiers } = useBadgesContract()
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null)
  
  const badgesToShow = userTiers && Array.isArray(userTiers) ? userTiers : []

  // Always show Beginner badge if user has no contract badges
  const allBadges = badgesToShow.length === 0 ? [0] : badgesToShow

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allBadges.map((tier) => {
        const badgeInfo = BADGE_CONFIG[Number(tier)]
        if (!badgeInfo) return null

        return (
            <div key={tier}>
              <BadgeCard 
                badge={badgeInfo} 
                compact={true}
                isDarkMode={isDarkMode}
                onClick={() => setSelectedBadge(badgeInfo)}
              />
          </div>
        )
      })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetail 
          badge={selectedBadge} 
          onClose={() => setSelectedBadge(null)}
          isDarkMode={isDarkMode}
        /> 
      )}
    </div>
  )
}

// Export ProfileBadges for use in other components
export { ProfileBadges }