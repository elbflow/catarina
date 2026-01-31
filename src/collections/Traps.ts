import type { CollectionConfig } from 'payload'

export const Traps: CollectionConfig = {
  slug: 'traps',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'farm', 'isActive', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only create baseline on new trap creation
        if (operation !== 'create') return doc

        try {
          // Create baseline observation for this trap
          await req.payload.create({
            collection: 'pest-observations',
            data: {
              date: new Date().toISOString().split('T')[0],
              count: 0,
              trap: doc.id,
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
  ],
  timestamps: true,
}
