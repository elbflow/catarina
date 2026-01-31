import { LogoutButton } from '@/components/auth/LogoutButton'
import type { User } from '@/payload-types'
import Link from 'next/link'

interface HeaderProps {
  user: User
  farmName?: string
  pestTypeName?: string
}

export function Header({ user, farmName, pestTypeName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
              🐞
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Catarina</h1>
              {farmName && (
                <p className="text-sm text-gray-500">
                  {farmName}
                  {pestTypeName && ` · ${pestTypeName}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user.name || user.email}</span>
              {user.role && (
                <span className="ml-2 text-gray-400">({user.role})</span>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
