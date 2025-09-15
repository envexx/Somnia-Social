'use client'

import { useState } from 'react'
import { 
  RoundedTrendingUp, 
  RoundedUsers, 
  RoundedMessage, 
  RoundedHeart,
  RoundedShare,
  RoundedMore
} from '@/components/icons/RoundedIcons'
import '@/styles/hide-scrollbar.css'

interface RightSidebarProps {
  isDarkMode?: boolean
}

export default function RightSidebar({ isDarkMode = false }: RightSidebarProps) {
  const [trendingTopics] = useState([
    { topic: '#Web3', posts: '12.5K' },
    { topic: '#Somnia', posts: '8.2K' },
    { topic: '#Blockchain', posts: '15.1K' },
    { topic: '#NFT', posts: '9.8K' },
    { topic: '#DeFi', posts: '11.3K' },
    { topic: '#Crypto', posts: '18.7K' },
    { topic: '#Metaverse', posts: '6.4K' },
    { topic: '#DAO', posts: '4.2K' },
    { topic: '#GameFi', posts: '7.9K' },
    { topic: '#SocialFi', posts: '3.1K' },
  ])

  const [suggestedUsers] = useState([
    {
      name: 'Alice Johnson',
      username: '@alice',
      avatar: 'A',
      followers: '2.1K',
      verified: true
    },
    {
      name: 'Bob Smith',
      username: '@bob',
      avatar: 'B',
      followers: '1.8K',
      verified: false
    },
    {
      name: 'Carol Davis',
      username: '@carol',
      avatar: 'C',
      followers: '3.2K',
      verified: true
    },
    {
      name: 'David Wilson',
      username: '@david',
      avatar: 'D',
      followers: '4.5K',
      verified: true
    },
    {
      name: 'Eva Brown',
      username: '@eva',
      avatar: 'E',
      followers: '2.8K',
      verified: false
    },
    {
      name: 'Frank Miller',
      username: '@frank',
      avatar: 'F',
      followers: '1.2K',
      verified: false
    },
  ])

  return (
    <div className={`w-full h-full border-l ${isDarkMode ? 'border-slate-700/50' : 'border-gray-300/60'} ${isDarkMode ? 'bg-slate-900/20' : 'bg-white/30'} backdrop-blur-xl relative flex flex-col`}>
      {/* Scrollable content area with hidden scrollbar */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar ${isDarkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'} p-3 xl:p-4`}>


      {/* Trending Topics */}
      <div className="mb-8">
        <h3 className={`font-semibold text-lg mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <RoundedTrendingUp className="w-5 h-5 mr-2" />
          Trending Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800/60' : 'bg-white/40 hover:bg-white/60'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'} transition-all cursor-pointer`}
            >
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{topic.topic}</p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{topic.posts} posts</p>
              </div>
              <RoundedMore className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="mb-8">
        <h3 className={`font-semibold text-lg mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <RoundedUsers className="w-5 h-5 mr-2" />
          Suggested Users
        </h3>
        <div className="space-y-3">
          {suggestedUsers.map((user, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800/60' : 'bg-white/40 hover:bg-white/60'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'} transition-all`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.avatar}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                    {user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{user.username}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{user.followers} followers</p>
                </div>
              </div>
              <button className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-blue-500/20 text-blue-600 border border-blue-500/30 hover:bg-blue-500/30'
              }`}>
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className={`font-semibold text-lg mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <RoundedMessage className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RoundedHeart className="w-4 h-4 text-red-400" />
              <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Someone liked your post</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>2 minutes ago</p>
          </div>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RoundedShare className="w-4 h-4 text-blue-400" />
              <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Your post was shared</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>15 minutes ago</p>
          </div>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RoundedUsers className="w-4 h-4 text-green-400" />
              <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>New follower</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>1 hour ago</p>
          </div>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RoundedMessage className="w-4 h-4 text-blue-400" />
              <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>New comment on your post</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>2 hours ago</p>
          </div>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RoundedHeart className="w-4 h-4 text-red-400" />
              <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Post reached 100 likes</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>3 hours ago</p>
          </div>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/40'} backdrop-blur-sm border ${isDarkMode ? 'border-slate-700/30' : 'border-white/20'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RoundedUsers className="w-4 h-4 text-green-400" />
              <span className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Someone followed you back</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>5 hours ago</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
