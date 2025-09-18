'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  RoundedHeart, 
  RoundedMessage, 
  RoundedShare, 
  RoundedClose,
  RoundedShield
} from '@/components/icons/RoundedIcons'
import { useAccount } from 'wagmi'
import { usePostContract, useReactionsContract, useProfileContract } from '@/hooks/useContracts'
import { ipfsService } from '@/lib/ipfs'
import BadgeDisplay from '@/components/Badges/BadgeDisplay'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: number
  postAuthor: {
    name: string
    username: string
    avatar: string
    address: string
  }
  postContent: string
  isDarkMode?: boolean
}

interface Comment {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    address: string
  }
  content: string
  timestamp: string
  likes: number
  liked: boolean
}

export default function CommentModal({ 
  isOpen, 
  onClose, 
  postId, 
  postAuthor, 
  postContent,
  isDarkMode = false 
}: CommentModalProps) {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { createPost, getComments, refetchLatestPosts } = usePostContract()
  const { hasLiked, getLikeCount, toggleLike } = useReactionsContract()
  const { hasProfile, getProfileByOwner } = useProfileContract()
  const { isDarkMode: contextDarkMode } = useDarkMode()
  
  const darkMode = isDarkMode || contextDarkMode
  
  // Simple state management without complex caching
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentLikes, setCommentLikes] = useState<Map<string, { count: number; liked: boolean }>>(new Map())
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('https://ui-avatars.com/api/?name=U&background=random&color=fff&size=64')
  
  const modalRef = useRef<HTMLDivElement>(null)

  // Load current user avatar
  const loadCurrentUserAvatar = useCallback(async () => {
    if (!address) return
    
    try {
      const userProfile = await getProfileByOwner(address)
      if (userProfile) {
        const profileCid = (userProfile as unknown as unknown[])[3] as string
        if (profileCid) {
          const profileData = await ipfsService.fetchFromIPFS(profileCid)
          const profile = profileData as Record<string, unknown>
          
          let avatarUrl: string
          if (profile.avatar) {
            avatarUrl = ipfsService.convertToGatewayUrl(profile.avatar as string)
          } else {
            // Fallback to generated avatar
            const displayName = (profile.displayName as string) || 'U'
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=64`
          }
          
          setCurrentUserAvatar(avatarUrl)
        }
      }
    } catch (error) {
      console.error('Error loading current user avatar:', error)
    }
  }, [address, getProfileByOwner])

  const loadComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const { comments: rawComments } = await getComments(postId, 0, 20)

      if (rawComments && Array.isArray(rawComments)) {
        const processedComments = await Promise.all(
          rawComments.map(async (comment: Record<string, unknown>) => {
            try {
              const commentData = await ipfsService.fetchFromIPFS(comment.cid as string)
              const commentContent = commentData as Record<string, unknown>
              const authorProfile = await getProfileByOwner(comment.author as string)
              let authorData = {
                name: 'Unknown User',
                username: 'unknown',
                avatar: '/default-avatar.png',
                address: comment.author as string
              }

              if (authorProfile) {
                const profileCid = (authorProfile as unknown as unknown[])[3] as string
                if (profileCid) {
                  const profileData = await ipfsService.fetchFromIPFS(profileCid)
                  const profile = profileData as Record<string, unknown>

                  let avatarUrl: string
                  if (profile.avatar) {
                    avatarUrl = ipfsService.convertToGatewayUrl(profile.avatar as string)
                  } else {
                    const displayName = (profile.displayName as string) || 'U'
                    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=64`
                  }

                  authorData = {
                    name: (profile.displayName as string) || 'Unknown User',
                    username: (profile.username as string) || 'unknown',
                    avatar: avatarUrl,
                    address: comment.author as string
                  }
                }
              }

              const likeCount = await getLikeCount(Number(comment.createdAt))
              const liked = address ? await hasLiked(Number(comment.createdAt)) : false

              return {
                id: (comment.createdAt as number).toString(),
                author: authorData,
                content: (commentContent.text as string) || 'No content available',
                timestamp: new Date(Number(comment.createdAt) * 1000).toLocaleDateString(),
                likes: likeCount,
                liked: liked
              }
            } catch (error) {
              console.error('Error processing comment:', error)
              return null
            }
          })
        )

        const validComments = processedComments.filter(Boolean) as Comment[]
        setComments(validComments)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [postId, getComments, getProfileByOwner, getLikeCount, hasLiked, address])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen) {
      // Call functions directly to avoid stale closure issues
      const loadData = async () => {
        await loadComments()
        await loadCurrentUserAvatar()
      }
      loadData()
    } else {
      // Clear cache when modal closes to free memory
      setComments([])
      setCommentLikes(new Map())
    }
  }, [isOpen, postId]) // Only essential dependencies

  const handlePostComment = async () => {
    if (!newComment.trim() || !isConnected || !address) return

    if (!hasProfile) {
      // Redirect to profile page to create profile instead of showing alert
      router.push('/profile')
      return
    }

    setIsPosting(true)
    try {
      // Create comment data for IPFS
      const commentData = {
        version: 1,
        type: 'comment' as const,
        author: address,
        text: newComment.trim(),
        images: [],
        embeds: [],
        createdAt: Math.floor(Date.now() / 1000)
      }

      // Upload to IPFS
      const cid = await ipfsService.uploadPost(commentData)
      
      // Create comment on blockchain (replyTo = postId)
      await createPost(newComment.trim(), [], undefined, postId, 0)
      
      // Clear input and reload comments (force refresh)
      setNewComment('')
      
      // Wait a moment for blockchain to process the transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      await loadComments() // Reload comments to get new comment
      
      // Refetch latest posts to update comment count
      await refetchLatestPosts()
      
      // Show success feedback
      console.log('✅ Comment posted successfully!')
      
      // Additional refresh after a short delay to ensure the comment appears
      setTimeout(async () => {
        await loadComments()
        await refetchLatestPosts()
        console.log('🔄 Comments refreshed to show new comment')
      }, 2500)
      
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!isConnected || !address) return

    try {
      const numericCommentId = Number(commentId)
      await toggleLike(numericCommentId)
      
      // Update local state
      const currentLikeData = commentLikes.get(commentId) || { count: 0, liked: false }
      const newLikeData = {
        count: currentLikeData.liked ? currentLikeData.count - 1 : currentLikeData.count + 1,
        liked: !currentLikeData.liked
      }
      
      setCommentLikes(prev => {
        const newMap = new Map(prev)
        newMap.set(commentId, newLikeData)
        return newMap
      })
      
      // Update comments array
      const updatedComments = comments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: newLikeData.count, liked: newLikeData.liked }
          : comment
      )

      setComments(updatedComments)
      
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className={`
          ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} 
          rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border
        `}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <RoundedMessage className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Comments
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-full transition-all duration-200
                ${darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}
              `}
            >
              <RoundedClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Original Post */}
        <div className={`p-6 ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-100'} border-b`}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Image 
                src={postAuthor.avatar} 
                alt={postAuthor.username} 
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {postAuthor.name}
                </h4>
                <BadgeDisplay 
                  userAddress={postAuthor.address}
                  isDarkMode={darkMode}
                  size="xs"
                  showText={false}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  @{postAuthor.username}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {postContent}
              </p>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        {isConnected && (
          <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Image 
                  src={currentUserAvatar} 
                  alt="Your avatar" 
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10" 
                />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className={`
                    w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 resize-none
                    ${darkMode 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                    }
                    focus:outline-none focus:ring-0
                  `}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {newComment.length}/280
                  </span>
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || isPosting || newComment.length > 280}
                    className={`
                      px-5 py-2 text-sm font-medium rounded-full transition-all duration-200
                      ${!newComment.trim() || isPosting || newComment.length > 280
                        ? `${darkMode ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`
                        : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                      }
                    `}
                  >
                    {isPosting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className={`inline-flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className={`w-4 h-4 rounded-full animate-spin border-2 ${darkMode ? 'border-gray-600 border-t-gray-400' : 'border-gray-300 border-t-gray-600'}`}></div>
                Loading comments...
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div>
              {comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={`
                    p-6 transition-colors duration-150
                    ${index !== comments.length - 1 ? (darkMode ? 'border-b border-gray-800' : 'border-b border-gray-100') : ''}
                    ${darkMode ? 'hover:bg-gray-900/50' : 'hover:bg-gray-50/50'}
                  `}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Image 
                        src={comment.author.avatar} 
                        alt={comment.author.username} 
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {comment.author.name}
                        </h5>
                        <BadgeDisplay 
                          userAddress={comment.author.address}
                          isDarkMode={darkMode}
                          size="xs"
                          showText={false}
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          @{comment.author.username}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {comment.content}
                      </p>
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        disabled={!isConnected}
                        className={`
                          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                          transition-all duration-200
                          ${comment.liked
                            ? 'text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
                            : `${darkMode 
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30' 
                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200'
                              }`
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <RoundedHeart 
                          className={`w-4 h-4 ${comment.liked ? 'fill-current' : ''}`} 
                        />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <RoundedMessage className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No comments yet
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}