'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import LeftSidebar from '@/components/Layout/LeftSidebar'
import RightSidebar from '@/components/Layout/RightSidebar'
import PostFeed from '@/components/Feed/PostFeed'
import ChatWidget from '@/components/Chat/ChatWidget'
import ProfileView from '@/components/Profile/ProfileView'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  // const [showChat, setShowChat] = useState(false)
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed')
  const [activeTab, setActiveTab] = useState('feed')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // const handleShowChat = () => {
  //   setShowChat(!showChat)
  // }

  // const handleCloseChat = () => {
  //   setShowChat(false)
  // }

  const handleShowProfile = () => {
    setCurrentView('profile')
    setIsMobileMenuOpen(false) // Close mobile menu when navigating
  }

  const handleBackToFeed = () => {
    setCurrentView('feed')
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false) // Close mobile menu when navigating
    // Switch to feed view when navigating tabs
    if (tab !== 'profile') {
      setCurrentView('feed')
    }
  }

  const handleLike = (postId: number) => {
    // TODO: Implement real like functionality with smart contracts
    console.log('Like post:', postId)
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
                  src="/public/favicon.png" 
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
                      src="/public/favicon.png" 
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
            {currentView === 'profile' ? (
              <ProfileView isDarkMode={isDarkMode} onBackToFeed={handleBackToFeed} />
            ) : (
              <>
                {activeTab === 'feed' && (
                  <PostFeed posts={[]} onLike={handleLike} isDarkMode={isDarkMode} />
                )}
                {activeTab === 'trending' && (
                  <div className="p-4 lg:p-6">
                    <h2 className={`text-xl lg:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Trending Posts
                    </h2>
                    <div className={`p-6 lg:p-8 rounded-lg text-center ${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'}`}>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Trending posts will be displayed here
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === 'communities' && (
                  <div className="p-4 lg:p-6">
                    <h2 className={`text-xl lg:text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Communities
                    </h2>
                    <div className={`p-6 lg:p-8 rounded-lg text-center ${isDarkMode ? 'bg-slate-800/40' : 'bg-gray-50/50'}`}>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Communities will be displayed here
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
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
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onShowProfile={handleShowProfile} />
    </div>
  )
}