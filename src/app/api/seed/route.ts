import { NextResponse } from 'next/server'
import { seedDemoData } from '@/lib/demo-data'

export async function POST() {
  try {
    await seedDemoData()
    return NextResponse.json({ success: true, message: 'Demo data seeded successfully' })
  } catch (error) {
    console.error('Error seeding demo data:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
