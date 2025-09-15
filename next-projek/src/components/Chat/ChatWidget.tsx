'use client'

import { useState } from 'react'
import { 
  MessageCircle, 
  X, 
  Send,
  Smile,
  Image,
  Mic
} from 'lucide-react'

interface ChatWidgetProps {
  isDarkMode?: boolean
}

export default function ChatWidget({ isDarkMode = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages] = useState([
    {
      id: 1,
      sender: 'Alice',
      message: 'Hey! How are you enjoying Somnia?',
      timestamp: '2:30 PM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'It\'s amazing! The gasless transactions are incredible.',
      timestamp: '2:31 PM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Bob',
      message: 'Just minted my first NFT profile picture! 🎨',
      timestamp: '2:32 PM',
      isOwn: false
    }
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement send message functionality
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}}
        >
          <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 lg:bottom-6 lg:right-6 w-80 lg:w-96 h-80 lg:h-[500px] backdrop-blur-xl rounded-2xl border shadow-2xl z-50 flex flex-col ${
          isDarkMode 
            ? 'bg-slate-800/90 border-slate-700/50' 
            : 'bg-white/90 border-white/50'
        }`}>
          {/* Chat Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h3 className={`font-semibold text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Community Chat</h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>3 online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-700/50' 
                  : 'hover:bg-gray-100/50'
              }`}
            >
              <X className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm px-4 py-3 rounded-2xl ${
                    msg.isOwn
                      ? 'text-white'
                      : isDarkMode 
                        ? 'bg-slate-700/50 text-white' 
                        : 'bg-gray-100 text-gray-900'
                  }`}
                  style={msg.isOwn ? {background: 'linear-gradient(to right, #0000FF, #4485F3)'} : {}}
                >
                  {!msg.isOwn && (
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{msg.sender}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.isOwn 
                      ? 'text-blue-100' 
                      : isDarkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-500'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className={`p-3 border-t ${
            isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
          }`}>
            <div className="flex items-center space-x-2">
              <button className={`p-1.5 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-700/50' 
                  : 'hover:bg-gray-100/50'
              }`}>
                <Image className={`w-3.5 h-3.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} alt="Image attachment" />
              </button>
              <button className={`p-1.5 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-700/50' 
                  : 'hover:bg-gray-100/50'
              }`}>
                <Smile className={`w-3.5 h-3.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </button>
              <button className={`p-1.5 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-700/50' 
                  : 'hover:bg-gray-100/50'
              }`}>
                <Mic className={`w-3.5 h-3.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-1.5 rounded-full transition-all duration-200 flex-shrink-0"
                style={{background: 'linear-gradient(to right, #0000FF, #4485F3)'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #0033CC, #3366CC)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #0000FF, #4485F3)'
                }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
