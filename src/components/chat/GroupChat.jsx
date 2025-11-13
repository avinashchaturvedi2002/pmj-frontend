import { useState, useEffect, useRef } from 'react'
import { poolingService } from '../../services'
import { useAuthStore } from '../../store/authStore'
import GroupChatHeader from './GroupChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Loader2 } from 'lucide-react'

export default function GroupChat({ groupId, groupName, memberCount, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false)
  const [chatId, setChatId] = useState(null)
  const { user } = useAuthStore()
  const pollingIntervalRef = useRef(null)
  const isAdmin = user?.role === 'ADMIN'

  // Fetch initial messages
  useEffect(() => {
    if (!groupId) return

    const fetchChat = async () => {
      try {
        setLoading(true)
        const response = await poolingService.getGroupChat(groupId)
        const data = response.data?.data || response.data
        
        if (data.chat) {
          setChatId(data.chat.id)
          const formattedMessages = (data.messages || []).map(msg => ({
            ...msg,
            senderId: msg.senderId || msg.sender?.id
          }))
          setMessages(formattedMessages)
          setShouldScrollToBottom(true)
        }
      } catch (error) {
        console.error('Failed to fetch chat:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChat()

    // Poll for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (chatId) {
        try {
          const response = await poolingService.getGroupChatMessages(groupId, { limit: 50 })
          const data = response.data?.data || response.data
          const newMessages = (data.messages || []).map(msg => ({
            ...msg,
            senderId: msg.senderId || msg.sender?.id
          }))
          
          // Only update if we have new messages
          if (newMessages.length > messages.length) {
            setMessages(newMessages)
            // Only scroll if the last message is not from current user
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.senderId !== user?.id) {
              setShouldScrollToBottom(true)
            }
          }
        } catch (error) {
          console.error('Failed to poll messages:', error)
        }
      }
    }, 3000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [groupId, chatId, messages.length, user?.id])

  const sendMessage = async () => {
    if (!input.trim() || !groupId || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      const response = await poolingService.sendGroupMessage(groupId, { content })
      const newMessage = response.data?.data?.message || response.data?.message
      
      if (newMessage) {
        setMessages(prev => [...prev, {
          ...newMessage,
          senderId: newMessage.senderId || newMessage.sender?.id
        }])
        setShouldScrollToBottom(true)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert(error.response?.data?.message || 'Failed to send message')
      setInput(content) // Restore input on error
    } finally {
      setSending(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!chatId || isLoadingMore || !hasMore || messages.length === 0) return

    setIsLoadingMore(true)
    try {
      const oldestMessage = messages[0]
      const before = oldestMessage?.createdAt
      
      const response = await poolingService.getGroupChatMessages(groupId, {
        before,
        limit: 20
      })
      
      const data = response.data?.data || response.data
      const olderMessages = (data.messages || []).map(msg => ({
        ...msg,
        senderId: msg.senderId || msg.sender?.id
      }))

      if (olderMessages.length === 0) {
        setHasMore(false)
      } else {
        setMessages(prev => [...olderMessages, ...prev])
      }
    } catch (error) {
      console.error('Failed to load more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      <GroupChatHeader
        groupName={groupName}
        memberCount={memberCount}
        onClose={onClose}
        isAdmin={isAdmin}
      />
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        isTyping={false}
        onLoadMore={loadMoreMessages}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        shouldScrollToBottom={shouldScrollToBottom}
        setShouldScrollToBottom={setShouldScrollToBottom}
      />
      <MessageInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSend={sendMessage}
        disabled={sending}
      />
    </div>
  )
}

