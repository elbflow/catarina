import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { CoopMemberships } from './collections/CoopMemberships'
import { Coops } from './collections/Coops'
import { Farms } from './collections/Farms'
import { Media } from './collections/Media'
import { PestObservations } from './collections/PestObservations'
import { PestTypes } from './collections/PestTypes'
import { Traps } from './collections/Traps'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Farms,
    Traps,
    PestTypes,
    PestObservations,
    Coops,
    CoopMemberships,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev',
    defaultFromName: 'Catarina',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  sharp,
  plugins: [
    multiTenantPlugin({
      tenantsSlug: 'farms',
      tenantsArrayField: {},
      collections: {
        traps: {},
        'pest-observations': {},
      },
      userHasAccessToAllTenants: (user) => user?.isSuperAdmin === true,
    }),
  ],
})
