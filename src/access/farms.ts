import type { Access } from 'payload'
import { getUser } from './index'

// User can access farms they're assigned to (via multi-tenant plugin)
export const canAccessFarm: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true
  // Plugin handles tenant filtering automatically
  return true
}

// Farmers can create their own farms
export const canCreateFarm: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true
  return user.role === 'farmer'
}

// Only superadmins can delete farms
export const canDeleteFarm: Access = ({ req }) => {
  const user = getUser(req)
  return user?.isSuperAdmin === true
}
