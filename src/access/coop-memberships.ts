import type { Access, PayloadRequest } from 'payload'
import { getUser } from './index'

// Helper: Check if user is admin of a specific co-op
async function isCoopAdmin(req: PayloadRequest, coopId: string | number): Promise<boolean> {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true

  const adminCheck = await req.payload.find({
    collection: 'coop-memberships',
    where: {
      and: [
        { user: { equals: user.id } },
        { coop: { equals: coopId } },
        { memberRole: { equals: 'admin' } },
        { status: { equals: 'active' } },
      ],
    },
    depth: 0,
    limit: 1,
    req,
  })

  return adminCheck.docs.length > 0
}

// Read: User can see their own memberships + memberships in co-ops they admin
export const canReadMemberships: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true

  // Query constraint: own memberships
  return {
    user: { equals: user.id },
  }
}

// Create: Co-op admins can invite users to their co-op
export const canCreateMemberships: Access = async ({ req, data }): Promise<boolean> => {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true

  // Must specify a co-op
  if (!data?.coop) return false

  // Cache admin status for this request
  const cacheKey = `isCoopAdmin_${data.coop}`
  if (req.context[cacheKey] === undefined) {
    req.context[cacheKey] = await isCoopAdmin(req, data.coop)
  }
  return Boolean(req.context[cacheKey])
}

// Update: User can accept their own invite, admins can modify
export const canUpdateMemberships: Access = async ({ req, id }): Promise<boolean> => {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true

  if (!id) return false

  const membership = await req.payload.findByID({
    collection: 'coop-memberships',
    id: String(id),
    depth: 0,
    req,
  })

  // User can update their own membership (accept invite)
  const membershipUserId =
    typeof membership.user === 'object' && membership.user ? membership.user.id : membership.user
  if (membershipUserId === user.id) return true

  // Co-op admin can update memberships in their co-op
  const coopId =
    typeof membership.coop === 'object' && membership.coop ? membership.coop.id : membership.coop
  const cacheKey = `isCoopAdmin_${coopId}`
  if (req.context[cacheKey] === undefined) {
    req.context[cacheKey] = await isCoopAdmin(req, coopId)
  }
  return Boolean(req.context[cacheKey])
}

// Delete: Co-op admins can remove members, users can leave
export const canDeleteMemberships: Access = async ({ req, id }): Promise<boolean> => {
  const user = getUser(req)
  if (!user) return false
  if (user.isSuperAdmin) return true

  if (!id) return false

  const membership = await req.payload.findByID({
    collection: 'coop-memberships',
    id: String(id),
    depth: 0,
    req,
  })

  // User can delete their own membership (leave co-op)
  const membershipUserId =
    typeof membership.user === 'object' && membership.user ? membership.user.id : membership.user
  if (membershipUserId === user.id) return true

  // Co-op admin can delete memberships in their co-op
  const coopId =
    typeof membership.coop === 'object' && membership.coop ? membership.coop.id : membership.coop
  const cacheKey = `isCoopAdmin_${coopId}`
  if (req.context[cacheKey] === undefined) {
    req.context[cacheKey] = await isCoopAdmin(req, coopId)
  }
  return Boolean(req.context[cacheKey])
}
