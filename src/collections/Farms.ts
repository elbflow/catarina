import type { CollectionConfig } from 'payload'

export const Farms: CollectionConfig = {
  slug: 'farms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'pestType', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
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
      name: 'pestType',
      type: 'relationship',
      relationTo: 'pest-types',
      required: true,
      label: 'Pest Type',
      admin: {
        description: 'The pest type being monitored at this farm',
      },
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
