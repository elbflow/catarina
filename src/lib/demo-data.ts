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

  // Delete users BEFORE farms (users have tenants relationship to farms)
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
      name: 'Canatlán Growers Co-op',
      region: 'Canatlán, Durango, Mexico',
    },
  })
  console.log('Created co-op: Canatlán Growers Co-op')

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

  // Farm 1 - North Orchard (Maria's farm - largest, well-established)
  const northOrchardFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'North Orchard',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Canatlán, Durango',
      lat: 24.0820,
      lng: -104.7650,
    },
  })

  // Farm 2 - Valley Farm (Tom's farm)
  const valleyFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Valley Farm',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Canatlán, Durango',
      lat: 24.0530,
      lng: -104.7785,
    },
  })

  // Farm 3 - South Grove (Sarah's farm)
  const southGroveFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'South Grove',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Canatlán, Durango',
      lat: 24.0180,
      lng: -104.7890,
    },
  })

  // Farm 4 - East Orchard (Bob's farm - smaller operation)
  const eastOrchardFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'East Orchard',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Canatlán, Durango',
      lat: 24.0450,
      lng: -104.7350,
    },
  })

  // Farm 5 - West Fields (David's farm - organic certified)
  const westFieldsFarm = await payload.create({
    collection: 'farms',
    data: {
      name: 'West Fields',
      pestType: codlingMoth.id,
      coop: coop.id,
      location: 'Canatlán, Durango',
      lat: 24.0600,
      lng: -104.8200,
    },
  })

  console.log('Created 5 farms in the co-op')

  // ============ ASSIGN USERS TO FARMS ============

  // Maria owns North Orchard
  await payload.update({
    collection: 'users',
    id: maria.id,
    data: { tenants: [{ tenant: northOrchardFarm.id }] },
    overrideAccess: true,
  })

  // Tom owns Valley Farm
  await payload.update({
    collection: 'users',
    id: tom.id,
    data: { tenants: [{ tenant: valleyFarm.id }] },
    overrideAccess: true,
  })

  // Sarah owns South Grove
  await payload.update({
    collection: 'users',
    id: sarah.id,
    data: { tenants: [{ tenant: southGroveFarm.id }] },
    overrideAccess: true,
  })

  // Bob owns East Orchard
  await payload.update({
    collection: 'users',
    id: bob.id,
    data: { tenants: [{ tenant: eastOrchardFarm.id }] },
    overrideAccess: true,
  })

  // David owns West Fields
  await payload.update({
    collection: 'users',
    id: david.id,
    data: { tenants: [{ tenant: westFieldsFarm.id }] },
    overrideAccess: true,
  })

  // Jennifer (technician) works on all farms
  await payload.update({
    collection: 'users',
    id: jennifer.id,
    data: {
      tenants: [
        { tenant: northOrchardFarm.id },
        { tenant: valleyFarm.id },
        { tenant: southGroveFarm.id },
        { tenant: eastOrchardFarm.id },
        { tenant: westFieldsFarm.id },
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

  // North Orchard - 4 traps (largest farm)
  const northOrchardTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Block A - North', farm: northOrchardFarm.id, tenant: northOrchardFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Block A - South', farm: northOrchardFarm.id, tenant: northOrchardFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Block B - Honeycrisp', farm: northOrchardFarm.id, tenant: northOrchardFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Block C - Gala', farm: northOrchardFarm.id, tenant: northOrchardFarm.id, isActive: true },
    }),
  ]

  // Valley Farm - 3 traps
  const valleyFarmTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'East Section', farm: valleyFarm.id, tenant: valleyFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'West Section', farm: valleyFarm.id, tenant: valleyFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Young Trees', farm: valleyFarm.id, tenant: valleyFarm.id, isActive: true },
    }),
  ]

  // South Grove - 3 traps
  const southGroveTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Main Field', farm: southGroveFarm.id, tenant: southGroveFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Hillside Plot', farm: southGroveFarm.id, tenant: southGroveFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Border Trap', farm: southGroveFarm.id, tenant: southGroveFarm.id, isActive: true },
    }),
  ]

  // East Orchard - 2 traps (smaller operation)
  const eastOrchardTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Primary Trap', farm: eastOrchardFarm.id, tenant: eastOrchardFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Secondary Trap', farm: eastOrchardFarm.id, tenant: eastOrchardFarm.id, isActive: true },
    }),
  ]

  // West Fields - 3 traps
  const westFieldsTraps = [
    await payload.create({
      collection: 'traps',
      data: { name: 'Certified Block 1', farm: westFieldsFarm.id, tenant: westFieldsFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Certified Block 2', farm: westFieldsFarm.id, tenant: westFieldsFarm.id, isActive: true },
    }),
    await payload.create({
      collection: 'traps',
      data: { name: 'Perimeter Monitor', farm: westFieldsFarm.id, tenant: westFieldsFarm.id, isActive: true },
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

  // ========== NORTH ORCHARD ==========
  // Well-managed farm, currently in WARNING zone but controlled

  // Block A - North: Moderate activity, stable
  await createObservations(northOrchardTraps[0].id, northOrchardFarm.id, [
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
  await createObservations(northOrchardTraps[1].id, northOrchardFarm.id, [
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
  await createObservations(northOrchardTraps[2].id, northOrchardFarm.id, [
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
  await createObservations(northOrchardTraps[3].id, northOrchardFarm.id, [
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

  // ========== VALLEY FARM ==========
  // Currently in DANGER zone - needs immediate action

  // East Section: Very high activity - hotspot
  await createObservations(valleyFarmTraps[0].id, valleyFarm.id, [
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

  // West Section: High but not as severe
  await createObservations(valleyFarmTraps[1].id, valleyFarm.id, [
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
  await createObservations(valleyFarmTraps[2].id, valleyFarm.id, [
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

  // ========== SOUTH GROVE ==========
  // Currently in SAFE zone - excellent pest management

  // Main Field: Low, stable activity
  await createObservations(southGroveTraps[0].id, southGroveFarm.id, [
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
  await createObservations(southGroveTraps[1].id, southGroveFarm.id, [
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
  await createObservations(southGroveTraps[2].id, southGroveFarm.id, [
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

  // ========== EAST ORCHARD ==========
  // Currently in WARNING zone - trending upward, needs attention

  // Primary Trap: Moderate, increasing trend
  await createObservations(eastOrchardTraps[0].id, eastOrchardFarm.id, [
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
  await createObservations(eastOrchardTraps[1].id, eastOrchardFarm.id, [
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

  // ========== WEST FIELDS ==========
  // Mixed results - organic management challenges

  // Certified Block 1: Moderate activity (organic methods take longer)
  await createObservations(westFieldsTraps[0].id, westFieldsFarm.id, [
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
  await createObservations(westFieldsTraps[1].id, westFieldsFarm.id, [
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
  await createObservations(westFieldsTraps[2].id, westFieldsFarm.id, [
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

CO-OP: Canatlán Growers Co-op
REGION: Canatlán, Durango, Mexico
CROP: Apple
PEST: Codling Moth (threshold: 2 moths/day)

DEMO ACCOUNTS:
-----------------------------------------------------------------
| Email                        | Password     | Role       | Farm          |
-----------------------------------------------------------------
| admin@elbflow.com            | catarina2026! | Superadmin | All access    |
| maria.gonzalez@demo.com      | demo1234!    | Farmer     | North Orchard |
| tom.mitchell@demo.com        | demo1234!    | Farmer     | Valley Farm   |
| sarah.chen@demo.com          | demo1234!    | Farmer     | South Grove   |
| bob.williams@demo.com        | demo1234!    | Farmer     | East Orchard  |
| david.park@demo.com          | demo1234!    | Farmer     | West Fields   |
| jennifer.marks@demo.com      | demo1234!    | Technician | All 5 farms   |
-----------------------------------------------------------------

FARM STATUS (Mid-Season Snapshot):
-----------------------------------------------------------------
| Farm          | Traps | Risk Level | Notes                          |
-----------------------------------------------------------------
| North Orchard | 4     | WARNING    | Well-managed, stable           |
| Valley Farm   | 3     | DANGER     | Needs immediate action         |
| South Grove   | 3     | SAFE       | Excellent pest management      |
| East Orchard  | 2     | WARNING    | Trending upward               |
| West Fields   | 3     | WARNING    | Organic challenges, improving  |
-----------------------------------------------------------------

Total: 5 farms, 15 traps, ~210 observations over 6 weeks
================================================================================
  `)
}
