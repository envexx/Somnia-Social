'use client'

import { useState } from 'react'
import { 
  RoundedSearch,
  RoundedSun, 
  RoundedMoon, 
  RoundedMenu,
  RoundedBell,
  RoundedUsers
} from '@/components/icons/RoundedIcons'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface HeaderProps {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

export default function Header({ isDarkMode, setIsDarkMode }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

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
              onClick={() => setIsDarkMode(!isDarkMode)}
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

            {/* Profile */}
            <button className={`p-2 xl:p-3 rounded-xl transition-all hover:scale-105 ${
              isDarkMode 
                ? 'bg-slate-800/80 text-gray-300 hover:bg-slate-700/80' 
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}>
              <RoundedUsers className="w-4 h-4 xl:w-5 xl:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
