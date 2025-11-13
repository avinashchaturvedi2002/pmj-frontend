import { Users, X, Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export default function GroupChatHeader({ groupName, memberCount, onClose, isAdmin }) {
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              {groupName || 'Group Chat'}
            </h3>
            {isAdmin && (
              <Badge variant="default" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {memberCount || 0} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

