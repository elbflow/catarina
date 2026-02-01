import { ObservationDetail } from '@/components/dashboard/ObservationDetail'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { getAuthHeaders } from '@/lib/auth-helpers'
import { getObservationById, getTraps } from '@/lib/payload-client'
import type { Farm, PestType } from '@/payload-types'
import config from '@/payload.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ObservationDetailPage({ params }: PageProps) {
  const { id } = await params
  
  // Get current user for access control
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getAuthHeaders() })

  if (!user) {
    notFound()
  }

  // Parse observation ID
  const observationId = parseInt(id, 10)
  if (isNaN(observationId)) {
    notFound()
  }

  // Get observation (access control handled by getObservationById)
  let observation
  try {
    observation = await getObservationById(observationId, user)
  } catch (error) {
    // Observation not found or user doesn't have access
    notFound()
  }

  // Get traps for the user (needed for edit form)
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

  // Get trap and farm names for breadcrumbs
  const trapName =
    typeof observation.trap === 'object' ? observation.trap?.name : 'Unknown Trap'
  const farmName =
    typeof observation.trap === 'object' && typeof observation.trap?.farm === 'object'
      ? observation.trap.farm?.name
      : 'Unknown Farm'

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: trapName, href: `/dashboard?trap=${typeof observation.trap === 'object' ? observation.trap?.id : observation.trap}` },
    { label: 'Observation' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Breadcrumbs items={breadcrumbItems} />
        <Link
          href="/dashboard"
          className="btn-secondary text-sm"
        >
          ← Back
        </Link>
      </div>

      <ObservationDetail
        observation={observation}
        traps={trapsWithFarm}
      />
    </main>
  )
}
