import { getUser } from '@/access';
import { canAccessFarm, canCreateFarm, canDeleteFarm } from '@/access/farms';
import type { CollectionConfig } from 'payload';

export const Farms: CollectionConfig = {
  slug: 'farms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'coop', 'pestType', 'createdAt'],
  },
  access: {
    // Read: Users see only farms they're assigned to (plugin handles this)
    read: canAccessFarm,
    // Create: Farmers can create their own farms
    create: canCreateFarm,
    // Update: Farm owners can update, superadmins can do anything
    update: canAccessFarm,
    // Delete: Only superadmins
    delete: canDeleteFarm,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only on create, and only for non-admins
        if (operation !== 'create') return doc
        if (!req.user || req.user.isSuperAdmin) return doc

        const user = getUser(req)
        if (!user) return doc

        const currentTenants = user.tenants || []
        const currentFarmIds = currentTenants
          .filter((t) => t.tenant != null)
          .map((t) =>
            typeof t.tenant === 'number' ? t.tenant : t.tenant!.id,
          )

        // Add new farm to user's tenants
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: {
            tenants: [
              ...currentFarmIds.map((id) => ({ tenant: id })),
              { tenant: doc.id },
            ],
          },
          req, // Important for transaction
        })

        return doc
      },
    ],
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
      name: 'coop',
      type: 'relationship',
      relationTo: 'coops',
      label: 'Co-op (optional)',
      admin: {
        description: 'Join a co-op to share aggregated metrics with other farmers',
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
    {
      name: 'lat',
      type: 'number',
      label: 'Latitude',
      admin: {
        description: 'GPS latitude coordinate (e.g., 24.0530)',
        step: 0.0001,
      },
    },
    {
      name: 'lng',
      type: 'number',
      label: 'Longitude',
      admin: {
        description: 'GPS longitude coordinate (e.g., -104.7785)',
        step: 0.0001,
      },
    },
  ],
  timestamps: true,
}
