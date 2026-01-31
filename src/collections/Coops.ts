import { isAuthenticated, isSuperAdmin } from '@/access'
import type { CollectionConfig } from 'payload'

export const Coops: CollectionConfig = {
  slug: 'coops',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'createdAt'],
  },
  access: {
    // Anyone authenticated can see co-ops (for joining)
    read: isAuthenticated,
    // Only superadmins can create co-ops
    create: isSuperAdmin,
    // Only superadmins can update co-op details
    update: isSuperAdmin,
    // Only superadmins can delete co-ops
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Co-op Name',
    },
    {
      name: 'region',
      type: 'text',
      label: 'Region',
      admin: {
        description: 'Geographic region this co-op covers',
      },
    },
  ],
}
