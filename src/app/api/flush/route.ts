import { NextResponse } from 'next/server'
import { flushDatabase } from '@/lib/demo-data'

export async function POST() {
  try {
    await flushDatabase()
    return NextResponse.json({ success: true, message: 'Database flushed successfully' })
  } catch (error) {
    console.error('Error flushing database:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
