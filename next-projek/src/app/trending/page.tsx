'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import LeftSidebar from '@/components/Layout/LeftSidebar'
import RightSidebar from '@/components/Layout/RightSidebar'
import ChatWidget from '@/components/Chat/ChatWidget'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function TrendingPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [activeTab, setActiveTab] = useState('trending')
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
                  isDarkMode ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-400 to-red-400'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h1 className={`text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Trending Posts
                </h1>
              </div>
              
              {/* Trending Content */}
              <div className="space-y-6">
                {/* Placeholder for trending posts */}
                <div className={`p-8 rounded-xl text-center ${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-8 h-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Trending Posts Coming Soon
                  </h3>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Discover the most popular posts and trending topics in the Somnia ecosystem
                  </p>
                </div>

                {/* Sample trending categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['#DeFi', '#NFT', '#Web3', '#Blockchain', '#Crypto', '#Somnia'].map((tag) => (
                    <div key={tag} className={`p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/40' 
                        : 'bg-white/50 border-gray-200/50 hover:bg-gray-50/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {tag}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          +0 posts
                        </span>
                      </div>
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
