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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Farms.ts:hook',message:'afterChange hook called',data:{operation,docId:doc.id,hasUser:!!req.user,isSuperAdmin:req.user?.isSuperAdmin},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Farms.ts:hook',message:'About to update user tenants',data:{userId:user.id,currentFarmIds,newFarmId:doc.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

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

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Farms.ts:hook',message:'User tenants updated successfully',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

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
  ],
  timestamps: true,
}
