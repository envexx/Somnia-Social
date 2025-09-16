'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
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
  const { address, isConnected } = useAccount()
  const { createPost, getComments, refetchLatestPosts } = usePostContract()
  const { hasLiked, getLikeCount, toggleLike } = useReactionsContract()
  const { getProfileByOwner } = useProfileContract()
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
            avatarUrl = (profile.avatar as string).replace('ipfs://', 'https://ipfs.io/ipfs/')
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
                    avatarUrl = (profile.avatar as string).replace('ipfs://', 'https://ipfs.io/ipfs/')
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
      await loadComments() // Reload comments to get new comment
      
      // Refetch latest posts to update comment count
      await refetchLatestPosts()
      
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Comments
            </h2>
            <button
              onClick={onClose}
              className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-lg transition-all`}
            >
              <RoundedClose className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Original Post */}
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-start space-x-3">
            <Image 
              src={postAuthor.avatar} 
              alt={postAuthor.username} 
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" 
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {postAuthor.name}
                </h4>
                <BadgeDisplay 
                  userAddress={postAuthor.address}
                  isDarkMode={darkMode}
                  size="sm"
                  showText={false}
                />
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
                @{postAuthor.username}
              </p>
              <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'} text-base leading-relaxed`}>
                {postContent}
              </p>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        {isConnected && (
          <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-start space-x-3">
              <Image 
                src={currentUserAvatar} 
                alt="Your avatar" 
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-white/50 object-cover" 
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className={`w-full px-4 py-3 text-sm rounded-lg border ${darkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white/50 border-gray-300/50 text-slate-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none`}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || isPosting}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                      !newComment.trim() || isPosting
                        ? `${darkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                        : `${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} hover:scale-105`
                    }`}
                  >
                    {isPosting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Loading comments...
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {comments.map((comment) => (
                <div key={comment.id} className="p-6">
                  <div className="flex items-start space-x-3">
                    <Image 
                      src={comment.author.avatar} 
                      alt={comment.author.username} 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border border-white/50 object-cover" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {comment.author.name}
                        </h5>
                        <BadgeDisplay 
                          userAddress={comment.author.address}
                          isDarkMode={darkMode}
                          size="sm"
                          showText={false}
                        />
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          @{comment.author.username}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'} text-sm leading-relaxed mb-3`}>
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleLikeComment(comment.id)}
                          disabled={!isConnected}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all ${
                            comment.liked
                              ? `${darkMode ? 'text-red-400 bg-red-500/20 border border-red-500/30' : 'text-red-600 bg-red-50 border border-red-200'}`
                              : `${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <RoundedHeart className={`w-4 h-4 ${comment.liked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                          <span className="text-xs font-medium">{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                No comments yet. Be the first to comment!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
