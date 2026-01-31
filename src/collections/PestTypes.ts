import type { CollectionConfig } from 'payload'

export const PestTypes: CollectionConfig = {
  slug: 'pest-types',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'crop', 'rateThreshold', 'createdAt'],
  },
  access: {
    read: () => true, // Public read for V1
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Pest Name',
    },
    {
      name: 'crop',
      type: 'select',
      required: true,
      options: [
        { label: 'Apple', value: 'apple' },
        { label: 'Pecan', value: 'pecan' },
        { label: 'Grape', value: 'grape' },
        { label: 'Berry', value: 'berry' },
      ],
      defaultValue: 'apple',
    },
    {
      name: 'rateThreshold',
      type: 'number',
      required: true,
      label: 'Rate Threshold (insects/day)',
      admin: {
        description: 'Daily rate that triggers warning',
      },
      defaultValue: 2,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional description of the pest',
      },
    },
  ],
  timestamps: true,
}
