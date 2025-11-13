import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function MessageList({
  messages,
  currentUserId,
  isTyping,
  onLoadMore,
  hasMore,
  isLoadingMore,
  shouldScrollToBottom,
  setShouldScrollToBottom
}) {
  const containerRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      setShouldScrollToBottom(false)
    }
  }, [messages, shouldScrollToBottom, setShouldScrollToBottom])

  // Load more messages when scrolling to top
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
        const prevHeight = container.scrollHeight
        onLoadMore().then(() => {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevHeight
          })
        })
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore, onLoadMore])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-3"
    >
      {isLoadingMore && hasMore && (
        <div className="text-center text-xs text-gray-500 py-2">
          Loading more messages...
        </div>
      )}

      {messages.length === 0 && !isLoadingMore && (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          No messages yet. Start the conversation!
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}

      {isTyping && (
        <div className="flex items-center gap-2 text-xs text-gray-500 italic">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Someone is typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

