import type { CollectionConfig } from 'payload'

export const PestObservations: CollectionConfig = {
  slug: 'pest-observations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'count', 'farm', 'pestType', 'createdAt'],
  },
  access: {
    read: () => true, // Public read for V1
    create: () => true,
    update: () => true,
    delete: () => true,
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
      label: 'Trap Count',
      admin: {
        description: 'Number of pests caught in trap',
      },
      min: 0,
    },
    {
      name: 'farm',
      type: 'relationship',
      relationTo: 'farms',
      required: true,
      label: 'Farm',
    },
    {
      name: 'pestType',
      type: 'relationship',
      relationTo: 'pest-types',
      required: true,
      label: 'Pest Type',
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
