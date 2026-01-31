import { getPayload } from 'payload'
import config from '@/payload.config'

export async function seedDemoData() {
  const payload = await getPayload({ config })

  // Check if data already exists
  const existingFarms = await payload.find({
    collection: 'farms',
    limit: 1,
  })

  if (existingFarms.totalDocs > 0) {
    console.log('Demo data already exists, skipping seed')
    return
  }

  // Create default admin user
  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@elbflow.com' } },
    limit: 1,
  })

  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@elbflow.com',
        password: 'catarina2026!',
      },
    })
    console.log('Admin user created: admin@elbflow.com')
  }

  // Create Pest Type first
  const pestType = await payload.create({
    collection: 'pest-types',
    data: {
      name: 'Codling Moth',
      crop: 'apple',
      rateThreshold: 2,
      description: 'Common pest affecting apple crops. Rate threshold: 2 moths/day triggers action.',
    },
  })

  // Create Farm with pestType relationship
  const farm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Apple Orchard Demo',
      pestType: pestType.id,
      location: 'Demo Location',
    },
  })

  // Create traps (baseline observations created automatically via hook)
  const trap1 = await payload.create({
    collection: 'traps',
    data: {
      name: 'North Field Trap',
      farm: farm.id,
      isActive: true,
    },
  })

  const trap2 = await payload.create({
    collection: 'traps',
    data: {
      name: 'South Field Trap',
      farm: farm.id,
      isActive: true,
    },
  })

  const trap3 = await payload.create({
    collection: 'traps',
    data: {
      name: 'East Perimeter Trap',
      farm: farm.id,
      isActive: true,
    },
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

  console.log('Demo data seeded successfully!')
  console.log(`Farm ID: ${farm.id}`)
  console.log(`Pest Type ID: ${pestType.id}`)
  console.log(`Rate Threshold: ${pestType.rateThreshold}/day`)
  console.log(`Traps: ${trap1.name}, ${trap2.name}, ${trap3.name}`)
  console.log(
    `Created ${trap1Observations.length + trap2Observations.length + trap3Observations.length} observations (plus 3 baselines)`,
  )
}
