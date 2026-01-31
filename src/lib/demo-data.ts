import config from '@/payload.config'
import { getPayload } from 'payload'

/**
 * Flush all data from the database.
 * Deletes in reverse dependency order to avoid foreign key issues.
 */
export async function flushDatabase() {
  const payload = await getPayload({ config })

  console.log('Flushing database...')

  // Delete observations first (depends on traps)
  const observations = await payload.find({
    collection: 'pest-observations',
    limit: 10000,
  })
  for (const obs of observations.docs) {
    await payload.delete({
      collection: 'pest-observations',
      id: obs.id,
    })
  }
  console.log(`Deleted ${observations.totalDocs} observations`)

  // Delete traps (depends on farms)
  const traps = await payload.find({
    collection: 'traps',
    limit: 10000,
  })
  for (const trap of traps.docs) {
    await payload.delete({
      collection: 'traps',
      id: trap.id,
    })
  }
  console.log(`Deleted ${traps.totalDocs} traps`)

  // Delete coop memberships (depends on users and coops)
  const memberships = await payload.find({
    collection: 'coop-memberships',
    limit: 10000,
  })
  for (const membership of memberships.docs) {
    await payload.delete({
      collection: 'coop-memberships',
      id: membership.id,
    })
  }
  console.log(`Deleted ${memberships.totalDocs} coop memberships`)

  // Delete farms (depends on pest types and coops)
  const farms = await payload.find({
    collection: 'farms',
    limit: 10000,
  })
  for (const farm of farms.docs) {
    await payload.delete({
      collection: 'farms',
      id: farm.id,
    })
  }
  console.log(`Deleted ${farms.totalDocs} farms`)

  // Delete coops
  const coops = await payload.find({
    collection: 'coops',
    limit: 10000,
  })
  for (const coop of coops.docs) {
    await payload.delete({
      collection: 'coops',
      id: coop.id,
    })
  }
  console.log(`Deleted ${coops.totalDocs} coops`)

  // Delete pest types
  const pestTypes = await payload.find({
    collection: 'pest-types',
    limit: 10000,
  })
  for (const pestType of pestTypes.docs) {
    await payload.delete({
      collection: 'pest-types',
      id: pestType.id,
    })
  }
  console.log(`Deleted ${pestTypes.totalDocs} pest types`)

  // Delete users
  const users = await payload.find({
    collection: 'users',
    limit: 10000,
  })
  for (const user of users.docs) {
    await payload.delete({
      collection: 'users',
      id: user.id,
    })
  }
  console.log(`Deleted ${users.totalDocs} users`)

  console.log('Database flushed successfully')
}

/**
 * Realistic demo data for a mid-season pest monitoring scenario.
 * 
 * Co-op: Yakima Valley Apple Growers Co-op
 * Crop: Apple
 * Pest: Codling Moth (rate threshold: 2 moths/day triggers action)
 * 
 * This simulates approximately 6 weeks of monitoring data, representing
 * mid-season conditions with varied activity levels across farms.
 * 
 * NOTE: This function flushes the database first, then seeds fresh data.
 */
export async function seedDemoData() {
  // Flush existing data first
  await flushDatabase()

  const payload = await getPayload({ config })

  // ============ USERS ============

  // 1. Superadmin (system administrator)
  const _superadmin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@elbflow.com',
      password: 'catarina2026!',
      name: 'System Admin',
      role: 'farmer',
      isSuperAdmin: true,
      tenants: [], // Multi-tenant plugin field; assigned later for non-superadmins
    },
  })
  console.log('Created superadmin: admin@elbflow.com')

  // 2. Maria Gonzalez - Co-op Admin, largest orchard
  const maria = await payload.create({
    collection: 'users',
    data: {
      email: 'maria.gonzalez@demo.com',
      password: 'demo1234!',
      name: 'Maria Gonzalez',
      role: 'farmer',
      isSuperAdmin: false,
      tenants: [],
    },
  })

  // 3. Tom Mitchell - Farmer
  const tom = await payload.create({
    collection: 'users',
    data: {
      email: 'tom.mitchell@demo.com',
      password: 'demo1234!',
      name: 'Tom Mitchell',
      role: 'farmer',
      isSuperAdmin: false,
      tenants: [],
    },
  })

  // 4. Sarah Chen - Farmer
  const sarah = await payload.create({
    collection: 'users',
    data: {
      email: 'sarah.chen@demo.com',
      password: 'demo1234!',
      name: 'Sarah Chen',
      role: 'farmer',
      isSuperAdmin: false,
      tenants: [],
    },
  })

  // 5. Bob Williams - Farmer
  const bob = await payload.create({
    collection: 'users',
    data: {
      email: 'bob.williams@demo.com',
      password: 'demo1234!',
      name: 'Bob Williams',
      role: 'farmer',
      isSuperAdmin: false,
      tenants: [],
    },
  })

  // 6. David Park - Farmer (organic focus)
  const david = await payload.create({
    collection: 'users',
    data: {
      email: 'david.park@demo.com',
      password: 'demo1234!',
      name: 'David Park',
      role: 'farmer',
      isSuperAdmin: false,
      tenants: [],
    },
  })

  // 7. Jennifer Marks - Technician (works across multiple farms)
  const jennifer = await payload.create({
    collection: 'users',
    data: {
      email: 'jennifer.marks@demo.com',
      password: 'demo1234!',
      name: 'Jennifer Marks',
      role: 'technician',
      isSuperAdmin: false,
      tenants: [],
    },
  })

  console.log('Created 6 farmer accounts and 1 technician')

  // ============ CO-OP ============

  const coop = await payload.create({
    collection: 'coops',
    data: {
      name: 'Yakima Valley Apple Growers',
      region: 'Yakima Valley, Washington',
    },
  })
  console.log('Created co-op: Yakima Valley Apple Growers')

  // ============ PEST TYPE ============

  const codlingMoth = await payload.create({
    collection: 'pest-types',
    data: {
      name: 'Codling Moth',
      crop: 'apple',
      rateThreshold: 2,
      description:
        'The codling moth (Cydia pomonella) is the most significant pest of apple crops worldwide. Adult moths are about 1/2 inch long with gray-brown wings featuring a copper-colored patch at the wing tips. Larvae bore into fruit, causing "wormy" apples. Action threshold: 2 moths per trap per day indicates first spray timing.',
    },
  })
  console.log('Created pest type: Codling Moth')

  // ============ FARMS ============

  // Farm 1 - Gonzalez Family Orchards (Maria's farm - largest, well-established)
  const gonzalezFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Gonzalez Family Orchards',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Tieton, WA',
    },
  })

  // Farm 2 - Mitchell Apple Ranch (Tom's farm)
  const mitchellFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Mitchell Apple Ranch',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Naches, WA',
    },
  })

  // Farm 3 - Sunrise Orchards (Sarah's farm)
  const sunriseFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Sunrise Orchards',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Selah, WA',
    },
  })

  // Farm 4 - Williams Grove (Bob's farm - smaller operation)
  const williamsFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Williams Grove',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Zillah, WA',
    },
  })

  // Farm 5 - Park's Organic Apples (David's farm - organic certified)
  const parkFarm = await payload.create({
    collection: 'farms',
    data: {
      name: "Park's Organic Apples",
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Wapato, WA',
    },
  })

  console.log('Created 5 farms in the co-op')

  // ============ ASSIGN USERS TO FARMS ============

  // Maria owns Gonzalez Family Orchards
  await payload.update({
    collection: 'users',
    id: maria.id,
    data: { tenants: [{ tenant: gonzalezFarm.id }] },
    overrideAccess: true,
  })

  // Tom owns Mitchell Apple Ranch
  await payload.update({
    collection: 'users',
    id: tom.id,
    data: { tenants: [{ tenant: mitchellFarm.id }] },
    overrideAccess: true,
  })

  // Sarah owns Sunrise Orchards
  await payload.update({
    collection: 'users',
    id: sarah.id,
    data: { tenants: [{ tenant: sunriseFarm.id }] },
    overrideAccess: true,
  })

  // Bob owns Williams Grove
  await payload.update({
    collection: 'users',
    id: bob.id,
    data: { tenants: [{ tenant: williamsFarm.id }] },
    overrideAccess: true,
  })

  // David owns Park's Organic Apples
  await payload.update({
    collection: 'users',
    id: david.id,
    data: { tenants: [{ tenant: parkFarm.id }] },
    overrideAccess: true,
  })

  // Jennifer (technician) works on all farms
  await payload.update({
    collection: 'users',
    id: jennifer.id,
    data: {
      tenants: [
        { tenant: gonzalezFarm.id },
        { tenant: mitchellFarm.id },
        { tenant: sunriseFarm.id },
        { tenant: williamsFarm.id },
        { tenant: parkFarm.id },
      ],
    },
    overrideAccess: true,
  })

  console.log('Assigned users to farms')

  // ============ CO-OP MEMBERSHIPS ============

  // Maria is co-op admin
  await payload.create({
    collection: 'coop-memberships',
    data: { user: maria.id, coop: coop.id, status: 'active', memberRole: 'admin' },
  })

  // Other farmers are members
  await payload.create({
    collection: 'coop-memberships',
    data: { user: tom.id, coop: coop.id, status: 'active', memberRole: 'member' },
  })

  await payload.create({
    collection: 'coop-memberships',
    data: { user: sarah.id, coop: coop.id, status: 'active', memberRole: 'member' },
  })

  await payload.create({
    collection: 'coop-memberships',
    data: { user: bob.id, coop: coop.id, status: 'active', memberRole: 'member' },
  })

  await payload.create({
    collection: 'coop-memberships',
    data: { user: david.id, coop: coop.id, status: 'active', memberRole: 'member' },
  })

  // Jennifer has pending invite to join co-op
  await payload.create({
    collection: 'coop-memberships',
    data: { user: jennifer.id, coop: coop.id, status: 'pending', memberRole: 'member' },
  })

  console.log('Created co-op memberships')

  // ============ TRAPS ============

  // Gonzalez Family Orchards - 4 traps (largest farm)
  const gonzalezTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Block A - North', farm: gonzalezFarm.id, tenant: gonzalezFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Block A - South', farm: gonzalezFarm.id, tenant: gonzalezFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Block B - Honeycrisp', farm: gonzalezFarm.id, tenant: gonzalezFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Block C - Gala', farm: gonzalezFarm.id, tenant: gonzalezFarm.id, isActive: true },
    }),
  ]

  // Mitchell Apple Ranch - 3 traps
  const mitchellTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'East Orchard', farm: mitchellFarm.id, tenant: mitchellFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'West Orchard', farm: mitchellFarm.id, tenant: mitchellFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Young Trees', farm: mitchellFarm.id, tenant: mitchellFarm.id, isActive: true },
    }),
  ]

  // Sunrise Orchards - 3 traps
  const sunriseTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Main Field', farm: sunriseFarm.id, tenant: sunriseFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Hillside Plot', farm: sunriseFarm.id, tenant: sunriseFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Border Trap', farm: sunriseFarm.id, tenant: sunriseFarm.id, isActive: true },
    }),
  ]

  // Williams Grove - 2 traps (smaller operation)
  const williamsTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Primary Trap', farm: williamsFarm.id, tenant: williamsFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Secondary Trap', farm: williamsFarm.id, tenant: williamsFarm.id, isActive: true },
    }),
  ]

  // Park's Organic Apples - 3 traps
  const parkTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Certified Block 1', farm: parkFarm.id, tenant: parkFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Certified Block 2', farm: parkFarm.id, tenant: parkFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Perimeter Monitor', farm: parkFarm.id, tenant: parkFarm.id, isActive: true },
    }),
  ]

  console.log('Created 15 traps across all farms')

  // ============ OBSERVATIONS ============
  // Generate realistic mid-season data (about 6 weeks = 42 days)
  // Observations are made every 2-4 days

  const today = new Date()

  type ObservationData = { daysAgo: number; count: number; notes?: string }

  // Helper to create observations
  async function createObservations(
    trapId: number,
    farmId: number,
    observations: ObservationData[],
  ) {
    for (const obs of observations) {
      const date = new Date(today)
      date.setDate(date.getDate() - obs.daysAgo)
      const dateStr = date.toISOString().split('T')[0]

      // Check if observation already exists for this trap/date
      const existing = await payload.find({
        collection: 'pest-observations',
        where: {
          and: [
            { trap: { equals: trapId } },
            { date: { equals: dateStr } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        // Update existing observation (likely a baseline observation)
        await payload.update({
          collection: 'pest-observations',
          id: existing.docs[0].id,
          data: {
            count: obs.count,
            isBaseline: false,
            notes: obs.notes,
          },
        })
      } else {
        // Create new observation
        await payload.create({
          collection: 'pest-observations',
          data: {
            date: dateStr,
            count: obs.count,
            trap: trapId,
            tenant: farmId,
            isBaseline: false,
            notes: obs.notes,
          },
        })
      }
    }
  }

  // ========== GONZALEZ FAMILY ORCHARDS ==========
  // Well-managed farm, currently in WARNING zone but controlled

  // Block A - North: Moderate activity, stable
  await createObservations(gonzalezTraps[0].id, gonzalezFarm.id, [
    { daysAgo: 42, count: 1 },
    { daysAgo: 39, count: 2 },
    { daysAgo: 36, count: 2 },
    { daysAgo: 33, count: 3 },
    { daysAgo: 30, count: 4, notes: 'First generation emerging' },
    { daysAgo: 27, count: 5 },
    { daysAgo: 24, count: 4 },
    { daysAgo: 21, count: 5 },
    { daysAgo: 18, count: 4, notes: 'Applied first spray' },
    { daysAgo: 15, count: 2 },
    { daysAgo: 12, count: 3 },
    { daysAgo: 9, count: 4 },
    { daysAgo: 6, count: 3 },
    { daysAgo: 3, count: 4 },
    { daysAgo: 0, count: 3, notes: 'Holding steady' },
  ])

  // Block A - South: Lower activity (good airflow area)
  await createObservations(gonzalezTraps[1].id, gonzalezFarm.id, [
    { daysAgo: 42, count: 0 },
    { daysAgo: 39, count: 1 },
    { daysAgo: 36, count: 1 },
    { daysAgo: 33, count: 2 },
    { daysAgo: 30, count: 2 },
    { daysAgo: 27, count: 3 },
    { daysAgo: 24, count: 2 },
    { daysAgo: 21, count: 2 },
    { daysAgo: 18, count: 2 },
    { daysAgo: 15, count: 1 },
    { daysAgo: 12, count: 2 },
    { daysAgo: 9, count: 2 },
    { daysAgo: 6, count: 1 },
    { daysAgo: 3, count: 2 },
    { daysAgo: 0, count: 1 },
  ])

  // Block B - Honeycrisp: Higher activity (variety attracts more moths)
  await createObservations(gonzalezTraps[2].id, gonzalezFarm.id, [
    { daysAgo: 42, count: 2 },
    { daysAgo: 39, count: 3 },
    { daysAgo: 36, count: 4 },
    { daysAgo: 33, count: 5 },
    { daysAgo: 30, count: 6, notes: 'Honeycrisp block always higher' },
    { daysAgo: 27, count: 7 },
    { daysAgo: 24, count: 6 },
    { daysAgo: 21, count: 7 },
    { daysAgo: 18, count: 5, notes: 'Post-spray check' },
    { daysAgo: 15, count: 4 },
    { daysAgo: 12, count: 5 },
    { daysAgo: 9, count: 6 },
    { daysAgo: 6, count: 5 },
    { daysAgo: 3, count: 6 },
    { daysAgo: 1, count: 5, notes: 'Consider second application' },
  ])

  // Block C - Gala: Moderate, steady
  await createObservations(gonzalezTraps[3].id, gonzalezFarm.id, [
    { daysAgo: 42, count: 1 },
    { daysAgo: 39, count: 2 },
    { daysAgo: 36, count: 2 },
    { daysAgo: 33, count: 3 },
    { daysAgo: 30, count: 3 },
    { daysAgo: 27, count: 4 },
    { daysAgo: 24, count: 3 },
    { daysAgo: 21, count: 4 },
    { daysAgo: 18, count: 3 },
    { daysAgo: 15, count: 2 },
    { daysAgo: 12, count: 3 },
    { daysAgo: 9, count: 3 },
    { daysAgo: 6, count: 2 },
    { daysAgo: 3, count: 3 },
    { daysAgo: 0, count: 2 },
  ])

  // ========== MITCHELL APPLE RANCH ==========
  // Currently in DANGER zone - needs immediate action

  // East Orchard: Very high activity - hotspot
  await createObservations(mitchellTraps[0].id, mitchellFarm.id, [
    { daysAgo: 41, count: 2 },
    { daysAgo: 38, count: 3 },
    { daysAgo: 35, count: 4 },
    { daysAgo: 32, count: 5 },
    { daysAgo: 29, count: 6 },
    { daysAgo: 26, count: 8, notes: 'Significant increase' },
    { daysAgo: 23, count: 9 },
    { daysAgo: 20, count: 10 },
    { daysAgo: 17, count: 11, notes: 'Need to spray ASAP' },
    { daysAgo: 14, count: 9 },
    { daysAgo: 11, count: 10 },
    { daysAgo: 8, count: 12, notes: 'Peak activity' },
    { daysAgo: 5, count: 11 },
    { daysAgo: 2, count: 10 },
    { daysAgo: 0, count: 9, notes: 'Still very high - action required' },
  ])

  // West Orchard: High but not as severe
  await createObservations(mitchellTraps[1].id, mitchellFarm.id, [
    { daysAgo: 41, count: 1 },
    { daysAgo: 38, count: 2 },
    { daysAgo: 35, count: 3 },
    { daysAgo: 32, count: 4 },
    { daysAgo: 29, count: 5 },
    { daysAgo: 26, count: 6 },
    { daysAgo: 23, count: 7 },
    { daysAgo: 20, count: 6 },
    { daysAgo: 17, count: 7 },
    { daysAgo: 14, count: 6 },
    { daysAgo: 11, count: 7 },
    { daysAgo: 8, count: 8 },
    { daysAgo: 5, count: 7 },
    { daysAgo: 2, count: 6 },
    { daysAgo: 0, count: 7 },
  ])

  // Young Trees: Moderate (less established)
  await createObservations(mitchellTraps[2].id, mitchellFarm.id, [
    { daysAgo: 41, count: 1 },
    { daysAgo: 38, count: 1 },
    { daysAgo: 35, count: 2 },
    { daysAgo: 32, count: 2 },
    { daysAgo: 29, count: 3 },
    { daysAgo: 26, count: 4 },
    { daysAgo: 23, count: 4 },
    { daysAgo: 20, count: 5 },
    { daysAgo: 17, count: 4 },
    { daysAgo: 14, count: 5 },
    { daysAgo: 11, count: 4 },
    { daysAgo: 8, count: 5 },
    { daysAgo: 5, count: 4 },
    { daysAgo: 2, count: 4 },
    { daysAgo: 0, count: 5 },
  ])

  // ========== SUNRISE ORCHARDS ==========
  // Currently in SAFE zone - excellent pest management

  // Main Field: Low, stable activity
  await createObservations(sunriseTraps[0].id, sunriseFarm.id, [
    { daysAgo: 40, count: 1 },
    { daysAgo: 37, count: 1 },
    { daysAgo: 34, count: 2 },
    { daysAgo: 31, count: 2 },
    { daysAgo: 28, count: 3 },
    { daysAgo: 25, count: 2, notes: 'Mating disruption working well' },
    { daysAgo: 22, count: 2 },
    { daysAgo: 19, count: 1 },
    { daysAgo: 16, count: 2 },
    { daysAgo: 13, count: 1 },
    { daysAgo: 10, count: 1 },
    { daysAgo: 7, count: 2 },
    { daysAgo: 4, count: 1 },
    { daysAgo: 1, count: 1, notes: 'Excellent control' },
  ])

  // Hillside Plot: Very low
  await createObservations(sunriseTraps[1].id, sunriseFarm.id, [
    { daysAgo: 40, count: 0 },
    { daysAgo: 37, count: 1 },
    { daysAgo: 34, count: 1 },
    { daysAgo: 31, count: 1 },
    { daysAgo: 28, count: 2 },
    { daysAgo: 25, count: 1 },
    { daysAgo: 22, count: 1 },
    { daysAgo: 19, count: 0 },
    { daysAgo: 16, count: 1 },
    { daysAgo: 13, count: 1 },
    { daysAgo: 10, count: 0 },
    { daysAgo: 7, count: 1 },
    { daysAgo: 4, count: 1 },
    { daysAgo: 1, count: 0 },
  ])

  // Border Trap: Slightly higher (edge effect from neighboring property)
  await createObservations(sunriseTraps[2].id, sunriseFarm.id, [
    { daysAgo: 40, count: 1 },
    { daysAgo: 37, count: 2 },
    { daysAgo: 34, count: 2 },
    { daysAgo: 31, count: 3 },
    { daysAgo: 28, count: 3, notes: 'Migration from neighbor?' },
    { daysAgo: 25, count: 4 },
    { daysAgo: 22, count: 3 },
    { daysAgo: 19, count: 3 },
    { daysAgo: 16, count: 2 },
    { daysAgo: 13, count: 3 },
    { daysAgo: 10, count: 2 },
    { daysAgo: 7, count: 2 },
    { daysAgo: 4, count: 2 },
    { daysAgo: 1, count: 3, notes: 'Edge effect - monitoring closely' },
  ])

  // ========== WILLIAMS GROVE ==========
  // Currently in WARNING zone - trending upward, needs attention

  // Primary Trap: Moderate, increasing trend
  await createObservations(williamsTraps[0].id, williamsFarm.id, [
    { daysAgo: 39, count: 1 },
    { daysAgo: 36, count: 1 },
    { daysAgo: 33, count: 2 },
    { daysAgo: 30, count: 2 },
    { daysAgo: 27, count: 3 },
    { daysAgo: 24, count: 3 },
    { daysAgo: 21, count: 4 },
    { daysAgo: 18, count: 4 },
    { daysAgo: 15, count: 5, notes: 'Numbers climbing' },
    { daysAgo: 12, count: 5 },
    { daysAgo: 9, count: 6 },
    { daysAgo: 6, count: 5 },
    { daysAgo: 3, count: 6, notes: 'Prepare for treatment' },
    { daysAgo: 0, count: 6 },
  ])

  // Secondary Trap: Similar pattern
  await createObservations(williamsTraps[1].id, williamsFarm.id, [
    { daysAgo: 39, count: 0 },
    { daysAgo: 36, count: 1 },
    { daysAgo: 33, count: 1 },
    { daysAgo: 30, count: 2 },
    { daysAgo: 27, count: 2 },
    { daysAgo: 24, count: 3 },
    { daysAgo: 21, count: 3 },
    { daysAgo: 18, count: 4 },
    { daysAgo: 15, count: 4 },
    { daysAgo: 12, count: 5 },
    { daysAgo: 9, count: 4 },
    { daysAgo: 6, count: 5 },
    { daysAgo: 3, count: 5 },
    { daysAgo: 0, count: 5 },
  ])

  // ========== PARK'S ORGANIC APPLES ==========
  // Mixed results - organic management challenges

  // Certified Block 1: Moderate activity (organic methods take longer)
  await createObservations(parkTraps[0].id, parkFarm.id, [
    { daysAgo: 42, count: 2 },
    { daysAgo: 39, count: 2 },
    { daysAgo: 36, count: 3 },
    { daysAgo: 33, count: 3 },
    { daysAgo: 30, count: 4 },
    { daysAgo: 27, count: 5 },
    { daysAgo: 24, count: 5, notes: 'Released beneficial insects' },
    { daysAgo: 21, count: 5 },
    { daysAgo: 18, count: 4 },
    { daysAgo: 15, count: 4 },
    { daysAgo: 12, count: 3 },
    { daysAgo: 9, count: 4 },
    { daysAgo: 6, count: 3, notes: 'Biocontrol showing results' },
    { daysAgo: 3, count: 3 },
    { daysAgo: 0, count: 3 },
  ])

  // Certified Block 2: Better results
  await createObservations(parkTraps[1].id, parkFarm.id, [
    { daysAgo: 42, count: 1 },
    { daysAgo: 39, count: 2 },
    { daysAgo: 36, count: 2 },
    { daysAgo: 33, count: 3 },
    { daysAgo: 30, count: 3 },
    { daysAgo: 27, count: 4 },
    { daysAgo: 24, count: 4 },
    { daysAgo: 21, count: 3 },
    { daysAgo: 18, count: 3 },
    { daysAgo: 15, count: 2 },
    { daysAgo: 12, count: 2 },
    { daysAgo: 9, count: 3 },
    { daysAgo: 6, count: 2 },
    { daysAgo: 3, count: 2 },
    { daysAgo: 0, count: 2 },
  ])

  // Perimeter Monitor: Higher (catching migrants from conventional farms)
  await createObservations(parkTraps[2].id, parkFarm.id, [
    { daysAgo: 42, count: 3 },
    { daysAgo: 39, count: 4 },
    { daysAgo: 36, count: 4 },
    { daysAgo: 33, count: 5 },
    { daysAgo: 30, count: 6, notes: 'High edge pressure' },
    { daysAgo: 27, count: 7 },
    { daysAgo: 24, count: 6 },
    { daysAgo: 21, count: 7 },
    { daysAgo: 18, count: 6 },
    { daysAgo: 15, count: 5 },
    { daysAgo: 12, count: 6 },
    { daysAgo: 9, count: 5 },
    { daysAgo: 6, count: 5, notes: 'Buffer zone helping' },
    { daysAgo: 3, count: 4 },
    { daysAgo: 0, count: 4 },
  ])

  console.log('Created observations for all traps')

  console.log(`
================================================================================
DEMO DATA SEEDED SUCCESSFULLY
================================================================================

CO-OP: Yakima Valley Apple Growers
REGION: Yakima Valley, Washington
CROP: Apple
PEST: Codling Moth (threshold: 2 moths/day)

DEMO ACCOUNTS:
-----------------------------------------------------------------
| Email                        | Password     | Role       | Farm                    |
-----------------------------------------------------------------
| admin@elbflow.com            | catarina2026! | Superadmin | All access              |
| maria.gonzalez@demo.com      | demo1234!    | Farmer     | Gonzalez Family Orchards |
| tom.mitchell@demo.com        | demo1234!    | Farmer     | Mitchell Apple Ranch     |
| sarah.chen@demo.com          | demo1234!    | Farmer     | Sunrise Orchards        |
| bob.williams@demo.com        | demo1234!    | Farmer     | Williams Grove          |
| david.park@demo.com          | demo1234!    | Farmer     | Park's Organic Apples   |
| jennifer.marks@demo.com      | demo1234!    | Technician | All 5 farms             |
-----------------------------------------------------------------

FARM STATUS (Mid-Season Snapshot):
-----------------------------------------------------------------
| Farm                     | Traps | Risk Level | Notes                          |
-----------------------------------------------------------------
| Gonzalez Family Orchards | 4     | WARNING    | Well-managed, stable           |
| Mitchell Apple Ranch     | 3     | DANGER     | Needs immediate action         |
| Sunrise Orchards         | 3     | SAFE       | Excellent pest management      |
| Williams Grove           | 2     | WARNING    | Trending upward               |
| Park's Organic Apples    | 3     | WARNING    | Organic challenges, improving  |
-----------------------------------------------------------------

Total: 5 farms, 15 traps, ~210 observations over 6 weeks
================================================================================
  `)
}
