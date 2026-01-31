import { LogoutButton } from '@/components/auth/LogoutButton'
import type { User } from '@/payload-types'

interface EmptyStateProps {
  user: User
  title: string
  message: string
  showLogout?: boolean
}

export function EmptyState({ user, title, message, showLogout = true }: EmptyStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card text-center max-w-md">
        <div className="text-5xl mb-4">👋</div>
        <h1 className="text-2xl font-semibold mb-3">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {showLogout && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  )
}
