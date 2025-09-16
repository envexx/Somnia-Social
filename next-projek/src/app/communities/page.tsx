'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import LeftSidebar from '@/components/Layout/LeftSidebar'
import RightSidebar from '@/components/Layout/RightSidebar'
import ChatWidget from '@/components/Chat/ChatWidget'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function CommunitiesPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [activeTab, setActiveTab] = useState('communities')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleShowProfile = () => {
    // Navigate to profile using Next.js router
    window.location.href = '/profile'
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false) // Close mobile menu when navigating
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      
      {/* Main Layout Container */}
      <div className={`w-full ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/80'} backdrop-blur-xl shadow-2xl h-screen overflow-hidden`}>
        
        {/* Mobile Header */}
        <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${
          isDarkMode 
            ? 'bg-gray-900/90 border-gray-700/50' 
            : 'bg-white/90 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="/favicon.png" 
                  alt="Somnia Social Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Somnia Social</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className={`fixed left-0 top-0 bottom-0 w-80 shadow-xl transition-colors ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`} onClick={(e) => e.stopPropagation()}>
              {/* Mobile Menu Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
                    <img 
                      src="/favicon.png" 
                      alt="Somnia Social Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Somnia Social</h1>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <LeftSidebar 
                isDarkMode={isDarkMode} 
                onShowProfile={handleShowProfile}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                hideBrandHeader={true}
              />
            </div>
          </div>
        )}
        
        {/* Layout Grid System */}
        <div className="flex h-screen">
          
          {/* Left Sidebar Area - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block left-sidebar-area w-80 h-screen overflow-y-auto scrollbar-hide">
            <LeftSidebar 
              isDarkMode={isDarkMode} 
              onShowProfile={handleShowProfile}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </aside>

          {/* Main Content Area */}
          <main className="main-content-area flex-1 h-screen overflow-y-auto scrollbar-hide pt-16 lg:pt-20">
            <div className="p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className={`text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Communities
                </h1>
              </div>
              
              {/* Communities Content */}
              <div className="space-y-6">
                {/* Create Community Button */}
                <div className={`p-6 rounded-xl border-2 border-dashed transition-colors ${
                  isDarkMode 
                    ? 'border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-800/20' 
                    : 'border-gray-300/50 hover:border-gray-400/50 hover:bg-gray-50/50'
                }`}>
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                    }`}>
                      <svg className={`w-6 h-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Create Your Community
                    </h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Start a new community and connect with like-minded people
                    </p>
                    <button className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}>
                      Create Community
                    </button>
                  </div>
                </div>

                {/* Sample Communities */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'DeFi Enthusiasts', members: 1250, description: 'Discussing decentralized finance' },
                    { name: 'NFT Collectors', members: 890, description: 'Sharing NFT collections and insights' },
                    { name: 'Web3 Developers', members: 2100, description: 'Building the future of the web' },
                    { name: 'Crypto Traders', members: 3400, description: 'Trading strategies and market analysis' },
                    { name: 'Blockchain Gaming', members: 1560, description: 'Gaming on the blockchain' },
                    { name: 'Somnia Ecosystem', members: 500, description: 'Official Somnia community' }
                  ].map((community) => (
                    <div key={community.name} className={`p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/40' 
                        : 'bg-white/50 border-gray-200/50 hover:bg-gray-50/50'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <button className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}>
                          Join
                        </button>
                      </div>
                      <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {community.name}
                      </h3>
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {community.description}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {community.members.toLocaleString()} members
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar Area - Hidden on mobile and tablet, visible on desktop */}
          <aside className="hidden xl:block right-sidebar-area w-88 h-screen overflow-y-auto scrollbar-hide pt-20">
            <RightSidebar isDarkMode={isDarkMode} />
          </aside>
          
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget isDarkMode={isDarkMode} />
      
      {/* Fixed Header - Hidden on mobile, visible on desktop */}
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onShowProfile={handleShowProfile} />
    </div>
  )
}
