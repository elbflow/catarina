import type { User } from '@/payload-types'
import type { Access } from 'payload'

// Type-safe user extraction
export const getUser = (req: { user?: unknown }): User | null => req.user as User | null

// Superadmin has full access to everything
export const isSuperAdmin: Access = ({ req }) => {
  const user = getUser(req)
  return user?.isSuperAdmin === true
}

// Authenticated users only
export const isAuthenticated: Access = ({ req }) => {
  return Boolean(getUser(req))
}

// Anyone (public read)
export const anyone: Access = () => true

// Factory: Role-based access
export function createRoleBasedAccess(roles: string[]): Access {
  return ({ req }) => {
    const user = getUser(req)
    if (!user) return false
    if (user.isSuperAdmin) return true
    return roles.includes(user.role)
  }
}
