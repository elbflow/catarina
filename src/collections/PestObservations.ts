import { getUser } from '@/access'
import type { CollectionConfig } from 'payload'

export const PestObservations: CollectionConfig = {
  slug: 'pest-observations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'count', 'isBaseline', 'trap', 'createdAt'],
  },
  access: {
    // Plugin handles tenant filtering
    read: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return true // Plugin filters by tenant
    },
    // Farmers and technicians can create observations
    create: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
    // Only superadmins can update (observations are generally immutable)
    update: ({ req }) => {
      const user = getUser(req)
      return user?.isSuperAdmin === true
    },
    // Only superadmins can delete
    delete: ({ req }) => {
      const user = getUser(req)
      return user?.isSuperAdmin === true
    },
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Observation Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      label: 'New Insects Since Last Check',
      admin: {
        description: 'Additional insects caught since last observation',
      },
      min: 0,
    },
    {
      name: 'isBaseline',
      type: 'checkbox',
      label: 'Trap Setup',
      defaultValue: false,
      admin: {
        description: 'Marks when the trap was set up or reset (count should be 0)',
      },
    },
    {
      name: 'trap',
      type: 'relationship',
      relationTo: 'traps',
      required: true,
      label: 'Trap',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Optional notes about this observation',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
      admin: {
        description: 'Optional photo of the trap (for V4 AI feature)',
      },
    },
  ],
  timestamps: true,
}
