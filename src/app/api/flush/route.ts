import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Delete all data in reverse dependency order
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

    // Delete users (keep superadmin if exists, or delete all)
    const users = await payload.find({
      collection: 'users',
      limit: 10000,
    })
    for (const user of users.docs) {
      // Skip superadmin if you want to keep it
      // if (user.isSuperAdmin) continue
      await payload.delete({
        collection: 'users',
        id: user.id,
      })
    }
    console.log(`Deleted ${users.totalDocs} users`)

    console.log('Database flushed successfully')
    return NextResponse.json({ success: true, message: 'Database flushed successfully' })
  } catch (error) {
    console.error('Error flushing database:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
