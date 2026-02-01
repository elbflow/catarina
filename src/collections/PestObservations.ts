import { getUser } from '@/access'
import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

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
    // Farmers and technicians can update observations in their farms (plugin filters by tenant)
    update: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
    // Farmers and technicians can delete observations in their farms (plugin filters by tenant)
    delete: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data.trap && data.date) {
          // Check if observation already exists for this trap + date
          const existing = await req.payload.find({
            collection: 'pest-observations',
            where: {
              and: [
                { trap: { equals: typeof data.trap === 'object' ? data.trap.id : data.trap } },
                { date: { equals: data.date } },
              ],
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            // Format the date for a user-friendly error message
            const observationDate = new Date(data.date)
            const formattedDate = observationDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })

            throw new APIError(
              `An observation for this trap already exists on ${formattedDate}. ` +
                `You can edit the existing observation in the admin panel or choose a different date. ` +
                `Only one observation per trap per day is allowed.`,
              400,
            )
          }
        }
        return data
      },
    ],
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
