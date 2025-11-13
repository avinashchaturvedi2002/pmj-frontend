import { Send } from 'lucide-react'
import { Button } from '../ui/Button'

export default function MessageInput({ input, onChange, onSend, disabled }) {
  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
      <input
        value={input}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        disabled={disabled}
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
        placeholder="Type a message..."
      />
      <Button
        onClick={onSend}
        disabled={disabled || !input.trim()}
        size="sm"
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}

