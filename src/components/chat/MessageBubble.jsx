import { format } from 'date-fns'

export default function MessageBubble({ message, isOwn }) {
  const senderName = message.sender?.name || 'Unknown'
  const senderInitial = senderName.charAt(0).toUpperCase()
  
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-primary">
            {senderInitial}
          </span>
        </div>
      )}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">
            {senderName}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span
          className={`text-[10px] text-gray-500 mt-1 px-1 ${
            isOwn ? 'text-right' : 'text-left'
          }`}
        >
          {format(new Date(message.createdAt), 'h:mm a')}
        </span>
      </div>
    </div>
  )
}

