import type { CollectionConfig } from 'payload'

export const Farms: CollectionConfig = {
  slug: 'farms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'crop', 'createdAt'],
  },
  access: {
    read: () => true, // Public read for V1
    create: () => true, // Allow creation for demo
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Farm Name',
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
      name: 'location',
      type: 'text',
      label: 'Location',
      admin: {
        description: 'Optional location for future use',
      },
    },
  ],
  timestamps: true,
}
