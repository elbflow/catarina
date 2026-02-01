import { getUser } from '@/access'
import type { CollectionConfig } from 'payload'

export const Traps: CollectionConfig = {
  slug: 'traps',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'farm', 'isActive', 'createdAt'],
  },
  access: {
    // Plugin handles tenant filtering
    read: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return true // Plugin filters by tenant
    },
    create: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
    update: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return user.role === 'farmer' // Only farmers can modify traps
    },
    delete: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      return user.isSuperAdmin === true
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only create baseline on new trap creation
        if (operation !== 'create') return doc

        try {
          // Get farm ID for tenant field
          const farmId = typeof doc.farm === 'number' ? doc.farm : doc.farm?.id

          // Create baseline observation for this trap
          await req.payload.create({
            collection: 'pest-observations',
            data: {
              date: new Date().toISOString().split('T')[0],
              count: 0,
              trap: doc.id,
              tenant: farmId, // Required by multi-tenant plugin
              isBaseline: true,
              notes: 'Trap set up - starting point for rate calculations',
            },
            req,
          })
        } catch (error) {
          // Log but don't fail trap creation if baseline creation fails
          console.error('Failed to create baseline observation:', error)
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Trap Name',
    },
    {
      name: 'farm',
      type: 'relationship',
      relationTo: 'farms',
      required: true,
      label: 'Farm',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Inactive traps are excluded from rate calculations',
      },
    },
    {
      name: 'currentRiskLevel',
      type: 'select',
      options: [
        { label: 'Safe', value: 'safe' },
        { label: 'Warning', value: 'warning' },
        { label: 'Danger', value: 'danger' },
      ],
      defaultValue: 'safe',
      admin: {
        readOnly: true,
        description: 'Current risk level based on recent observations (auto-calculated)',
      },
    },
  ],
  timestamps: true,
}
