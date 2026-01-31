import { ObservationForm } from '@/components/forms/ObservationForm'
import { getAuthHeaders } from '@/lib/auth-helpers'
import { getLatestObservation, getTraps } from '@/lib/payload-client'
import type { Farm, PestType } from '@/payload-types'
import config from '@/payload.config'
import Link from 'next/link'
import { getPayload } from 'payload'

export default async function NewObservationPage() {
  // Get current user for access control
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getAuthHeaders() })

  const traps = await getTraps(user)

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
    const lastObs = await getLatestObservation(trapsWithFarm[0].id, user)
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
  )
}
