import { getTraps, getLatestObservation } from '@/lib/payload-client'
import { ObservationForm } from '@/components/forms/ObservationForm'
import Link from 'next/link'
import type { Farm, PestType } from '@/payload-types'

export default async function NewObservationPage() {
  const traps = await getTraps()

  // Cast to the expected type with nested relations
  const trapsWithFarm = traps as Array<{
    id: number
    name: string
    isActive?: boolean | null
    farm: Farm & { pestType: PestType }
    createdAt: string
    updatedAt: string
  }>

  // Get last observation info for context (from first trap if available)
  let lastObservationInfo = null
  if (trapsWithFarm.length > 0) {
    const lastObs = await getLatestObservation(trapsWithFarm[0].id)
    if (lastObs) {
      const obsDate = new Date(lastObs.date)
      const today = new Date()
      const daysSince = Math.floor((today.getTime() - obsDate.getTime()) / (1000 * 60 * 60 * 24))
      lastObservationInfo = {
        date: lastObs.date,
        daysSince,
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">🐞</Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Add Observation</h1>
              <p className="text-sm text-gray-500">Record new insects caught since last check</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {trapsWithFarm.length === 0 ? (
          <div className="card text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">No Traps Available</h2>
            <p className="text-gray-600 mb-6">
              Please add at least one trap from the dashboard before recording observations.
            </p>
            <Link href="/" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="card">
            <ObservationForm
              traps={trapsWithFarm}
              defaultTrapId={String(trapsWithFarm[0]?.id)}
              lastObservation={lastObservationInfo}
            />
          </div>
        )}
      </main>
    </div>
  )
}
