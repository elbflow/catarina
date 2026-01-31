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

  // Create Farm
  const farm = await payload.create({
    collection: 'farms',
    data: {
      name: 'Apple Orchard Demo',
      crop: 'apple',
      location: 'Demo Location',
    },
  })

  // Create Pest Type
  const pestType = await payload.create({
    collection: 'pest-types',
    data: {
      name: 'Codling Moth',
      crop: 'apple',
      threshold: 5,
      description: 'Common pest affecting apple crops. Action threshold: 5 moths per trap.',
    },
  })

  // Create observations for the last 30 days with realistic trend
  const today = new Date()
  const observations = []

  // Generate deterministic data showing a rising trend
  const baseCounts = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 12]

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Add some randomness but keep trend
    const baseCount = baseCounts[29 - i] || 0
    const count = Math.max(0, baseCount + Math.floor(Math.random() * 2) - 1)

    observations.push({
      date: date.toISOString().split('T')[0],
      count,
      farm: farm.id,
      pestType: pestType.id,
      notes: i === 0 ? 'Latest observation' : undefined,
    })
  }

  // Create observations in batches
  for (const obsData of observations) {
    await payload.create({
      collection: 'pest-observations',
      data: obsData,
    })
  }

  console.log('Demo data seeded successfully!')
  console.log(`Farm ID: ${farm.id}`)
  console.log(`Pest Type ID: ${pestType.id}`)
  console.log(`Created ${observations.length} observations`)
}
