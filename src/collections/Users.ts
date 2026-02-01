import { anyone, isSuperAdmin } from '@/access'
import { sendWelcomeEmail } from '@/lib/email-service'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'isSuperAdmin', 'createdAt'],
  },
  auth: true,
  access: {
    // Anyone can create (signup)
    create: anyone,
    // Users can read their own data, admins can read all
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.isSuperAdmin) return true
      return { id: { equals: req.user.id } }
    },
    // Users can update their own data (except isSuperAdmin), admins can update all
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.isSuperAdmin) return true
      return { id: { equals: req.user.id } }
    },
    // Only superadmins can delete
    delete: isSuperAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only send welcome email on user creation
        if (operation !== 'create') return doc

        // Skip if user doesn't have an email
        if (!doc.email) return doc

        // Fire-and-forget: don't await to keep response fast
        sendWelcomeEmail(req.payload, doc as any).catch((error) => {
          console.error('Failed to send welcome email:', error)
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'farmer',
      options: [
        { label: 'Farmer', value: 'farmer' },
        { label: 'Technician', value: 'technician' },
      ],
      saveToJWT: true, // Fast access checks without DB lookup
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      saveToJWT: true,
      admin: {
        description: 'Grants full system access. Only modify via direct DB access.',
        condition: (data, siblingData, { user }) => user?.isSuperAdmin === true,
      },
      access: {
        update: ({ req }) => req.user?.isSuperAdmin === true,
      },
    },
    // Plugin will add: farms (array of tenant relationships)
  ],
}
