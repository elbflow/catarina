import type { CollectionConfig } from 'payload'

export const PestObservations: CollectionConfig = {
  slug: 'pest-observations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'count', 'isBaseline', 'trap', 'createdAt'],
  },
  access: {
    read: () => true,
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
