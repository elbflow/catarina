import config from '@/payload.config'
import { getPayload } from 'payload'

export async function seedDemoData() {
  const payload = await getPayload({ config })

  // Check if data already exists
  const existingFarms = await payload.find({ collection: 'farms', limit: 1 })
  if (existingFarms.totalDocs > 0) {
    console.log('Demo data already exists, skipping seed')
    return
  }

  // ============ USERS ============

  // 1. Superadmin (developer)
  const _superadmin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@elbflow.com',
      password: 'catarina2026!',
      name: 'System Admin',
      role: 'farmer', // Role doesn't matter for superadmin
      isSuperAdmin: true,
    },
  })
  console.log('Created superadmin: admin@elbflow.com')

  // 2. Farmer 1 - Apple Orchard Owner
  const farmer1 = await payload.create({
    collection: 'users',
    data: {
      email: 'farmer1@demo.com',
      password: 'demo1234!',
      name: 'John Apple',
      role: 'farmer',
      isSuperAdmin: false,
    },
  })

  // 3. Farmer 2 - Pecan Farm Owner
  const farmer2 = await payload.create({
    collection: 'users',
    data: {
      email: 'farmer2@demo.com',
      password: 'demo1234!',
      name: 'Jane Pecan',
      role: 'farmer',
      isSuperAdmin: false,
    },
  })

  // 4. Technician - Works for multiple farms
  const technician = await payload.create({
    collection: 'users',
    data: {
      email: 'tech@demo.com',
      password: 'demo1234!',
      name: 'Tech Worker',
      role: 'technician',
      isSuperAdmin: false,
    },
  })

  console.log('Created demo users: farmer1, farmer2, technician')

  // ============ CO-OP ============

  const coop = await payload.create({
    collection: 'coops',
    data: {
      name: 'Central Valley Co-op',
      region: 'Central California',
    },
  })
  console.log('Created co-op: Central Valley Co-op')

  // ============ PEST TYPES ============

  const applePest = await payload.create({
    collection: 'pest-types',
    data: {
      name: 'Codling Moth',
      crop: 'apple',
      rateThreshold: 2,
      description: 'Common pest affecting apple crops. Rate threshold: 2 moths/day triggers action.',
    },
  })

  const pecanPest = await payload.create({
    collection: 'pest-types',
    data: {
      name: 'Pecan Weevil',
      crop: 'pecan',
      rateThreshold: 3,
      description: 'Primary pest of pecans. Rate threshold: 3 weevils/day triggers action.',
    },
  })

  // ============ FARMS ============

  // Farm 1 - Owned by farmer1, in co-op
  const farm1 = await payload.create({
    collection: 'farms',
    data: {
      name: 'Apple Orchard Demo',
      pestType: applePest.id,
      coop: coop.id,
      location: 'North Valley',
    },
  })

  // Farm 2 - Owned by farmer2, in co-op
  const farm2 = await payload.create({
    collection: 'farms',
    data: {
      name: 'Pecan Grove',
      pestType: pecanPest.id,
      coop: coop.id,
      location: 'South Valley',
    },
  })

  console.log('Created farms: Apple Orchard Demo, Pecan Grove')

  // ============ ASSIGN USERS TO FARMS (via plugin) ============
  // Use Local API with overrideAccess for seed script

  // Farmer1 owns Farm1
  await payload.update({
    collection: 'users',
    id: farmer1.id,
    data: {
      tenants: [{ tenant: farm1.id }],
    },
    overrideAccess: true, // Seed script needs admin access
  })

  // Farmer2 owns Farm2
  await payload.update({
    collection: 'users',
    id: farmer2.id,
    data: {
      tenants: [{ tenant: farm2.id }],
    },
    overrideAccess: true,
  })

  // Technician works on both farms
  await payload.update({
    collection: 'users',
    id: technician.id,
    data: {
      tenants: [{ tenant: farm1.id }, { tenant: farm2.id }],
    },
    overrideAccess: true,
  })

  console.log('Assigned users to farms')

  // ============ CO-OP MEMBERSHIPS ============

  // Farmer1 is co-op admin
  await payload.create({
    collection: 'coop-memberships',
    data: {
      user: farmer1.id,
      coop: coop.id,
      status: 'active',
      memberRole: 'admin',
    },
  })

  // Farmer2 is co-op member
  await payload.create({
    collection: 'coop-memberships',
    data: {
      user: farmer2.id,
      coop: coop.id,
      status: 'active',
      memberRole: 'member',
    },
  })

  // Technician has pending invite
  await payload.create({
    collection: 'coop-memberships',
    data: {
      user: technician.id,
      coop: coop.id,
      status: 'pending',
      memberRole: 'member',
    },
  })

  console.log('Created co-op memberships')

  // ============ TRAPS & OBSERVATIONS ============
  // (Keep existing trap/observation seeding logic, but for both farms)

  const trap1 = await payload.create({
    collection: 'traps',
    data: { name: 'North Field Trap', farm: farm1.id, isActive: true },
  })

  const trap2 = await payload.create({
    collection: 'traps',
    data: { name: 'South Field Trap', farm: farm1.id, isActive: true },
  })

  const trap3 = await payload.create({
    collection: 'traps',
    data: { name: 'East Perimeter Trap', farm: farm1.id, isActive: true },
  })

  // Add a trap for farm2
  const trap4 = await payload.create({
    collection: 'traps',
    data: { name: 'Main Grove Trap', farm: farm2.id, isActive: true },
  })

  // Create observations distributed across traps
  // Delta-based observations with varying intervals
  const today = new Date()

  // Observations for Trap 1 (North Field - higher activity)
  const trap1Observations: Array<{ daysAgo: number; delta: number; notes?: string }> = [
    { daysAgo: 25, delta: 2 },
    { daysAgo: 22, delta: 3 },
    { daysAgo: 19, delta: 4 },
    { daysAgo: 16, delta: 5, notes: 'High activity' },
    { daysAgo: 13, delta: 4 },
    { daysAgo: 10, delta: 6 },
    { daysAgo: 7, delta: 3 },
    { daysAgo: 4, delta: 5 },
    { daysAgo: 1, delta: 4, notes: 'Latest - rate increasing' },
  ]

  // Observations for Trap 2 (South Field - moderate activity)
  const trap2Observations: Array<{ daysAgo: number; delta: number; notes?: string }> = [
    { daysAgo: 26, delta: 1 },
    { daysAgo: 23, delta: 2 },
    { daysAgo: 20, delta: 2 },
    { daysAgo: 17, delta: 3 },
    { daysAgo: 14, delta: 2 },
    { daysAgo: 11, delta: 3 },
    { daysAgo: 8, delta: 2 },
    { daysAgo: 5, delta: 2 },
    { daysAgo: 2, delta: 3 },
  ]

  // Observations for Trap 3 (East Perimeter - lower activity)
  const trap3Observations: Array<{ daysAgo: number; delta: number; notes?: string }> = [
    { daysAgo: 27, delta: 1 },
    { daysAgo: 24, delta: 1 },
    { daysAgo: 21, delta: 2 },
    { daysAgo: 18, delta: 1 },
    { daysAgo: 15, delta: 2 },
    { daysAgo: 12, delta: 1 },
    { daysAgo: 9, delta: 2 },
    { daysAgo: 6, delta: 1 },
    { daysAgo: 3, delta: 2 },
    { daysAgo: 0, delta: 1, notes: 'Low consistent activity' },
  ]

  // Observations for Trap 4 (Farm 2 - moderate activity)
  const trap4Observations: Array<{ daysAgo: number; delta: number; notes?: string }> = [
    { daysAgo: 24, delta: 1 },
    { daysAgo: 21, delta: 2 },
    { daysAgo: 18, delta: 2 },
    { daysAgo: 15, delta: 3 },
    { daysAgo: 12, delta: 2 },
    { daysAgo: 9, delta: 3 },
    { daysAgo: 6, delta: 2 },
    { daysAgo: 3, delta: 2 },
    { daysAgo: 0, delta: 3 },
  ]

  // Helper to create observations for a trap
  async function createObservationsForTrap(
    trapId: number,
    observations: Array<{ daysAgo: number; delta: number; notes?: string }>,
  ) {
    for (const obs of observations) {
      const date = new Date(today)
      date.setDate(date.getDate() - obs.daysAgo)

      await payload.create({
        collection: 'pest-observations',
        data: {
          date: date.toISOString().split('T')[0],
          count: obs.delta,
          trap: trapId,
          isBaseline: false,
          notes: obs.notes,
        },
      })
    }
  }

  await createObservationsForTrap(trap1.id, trap1Observations)
  await createObservationsForTrap(trap2.id, trap2Observations)
  await createObservationsForTrap(trap3.id, trap3Observations)
  await createObservationsForTrap(trap4.id, trap4Observations)

  console.log('Demo data seeded successfully!')
  console.log(`
  Demo Accounts:
  - Superadmin: admin@elbflow.com / catarina2026!
  - Farmer 1 (co-op admin): farmer1@demo.com / demo1234!
  - Farmer 2 (co-op member): farmer2@demo.com / demo1234!
  - Technician: tech@demo.com / demo1234!
  
  Data Created:
  - 1 Co-op: Central Valley Co-op
  - 2 Farms: Apple Orchard Demo, Pecan Grove
  - 4 Traps with observations
  `)
}
