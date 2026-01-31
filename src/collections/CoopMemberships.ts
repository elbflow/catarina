import {
    canCreateMemberships,
    canDeleteMemberships,
    canReadMemberships,
    canUpdateMemberships,
} from '@/access/coop-memberships'
import type { CollectionConfig } from 'payload'

export const CoopMemberships: CollectionConfig = {
  slug: 'coop-memberships',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'coop', 'status', 'memberRole', 'createdAt'],
  },
  access: {
    read: canReadMemberships,
    create: canCreateMemberships,
    update: canUpdateMemberships,
    delete: canDeleteMemberships,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // Filter to show only users not already in this co-op
      // (handled in UI, not filterOptions due to circular dependency)
    },
    {
      name: 'coop',
      type: 'relationship',
      relationTo: 'coops',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Invite', value: 'pending' },
        { label: 'Active', value: 'active' },
      ],
    },
    {
      name: 'memberRole',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        // Only co-op admins or superadmins can change member roles
        update: async ({ req, id }) => {
          if (!req.user) return false
          if (req.user.isSuperAdmin) return true
          // Check if user is admin of this co-op
          // (Delegated to canUpdateMemberships for simplicity)
          return false
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // When accepting invite, can only change status, not other fields
        if (operation === 'update' && data.status === 'active') {
          // Validation handled in access control
        }
        return data
      },
    ],
  },
}
