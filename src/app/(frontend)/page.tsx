import { getObservations, getFarms, getPestTypes } from '@/lib/payload-client'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { RiskZone } from '@/components/dashboard/RiskZone'
import { WarningBanner } from '@/components/dashboard/WarningBanner'
import { ObservationCard } from '@/components/dashboard/ObservationCard'
import Link from 'next/link'
import type { ObservationWithRelations } from '@/lib/payload-client'

export default async function HomePage() {
  // Get first farm and pest type for demo (V1: single tenant)
  const farms = await getFarms()
  const pestTypes = await getPestTypes()

  if (farms.length === 0 || pestTypes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Found</h1>
          <p className="text-gray-600 mb-6">
            Please seed the demo data first. You can do this via the admin panel or API.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Admin Panel
          </Link>
        </div>
      </div>
    )
  }

  const farm = farms[0]
  const pestType = pestTypes[0]

  const observations = await getObservations(farm.id, pestType.id)

  // Get latest observation for current status
  const latestObservation = observations.length > 0 ? observations[0] : null
  const currentCount = latestObservation?.count || 0
  const threshold = typeof pestType.threshold === 'number' ? pestType.threshold : 5

  // Get recent observations (last 5)
  const recentObservations = observations.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IPM Scout Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {typeof farm === 'object' && farm?.name} •{' '}
                {typeof pestType === 'object' && pestType?.name}
              </p>
            </div>
            <Link
              href="/observations/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Observation
            </Link>
          </div>
        </div>

        {/* Warning Banner */}
        {latestObservation && (
          <div className="mb-6">
            <WarningBanner currentCount={currentCount} threshold={threshold} />
          </div>
        )}

        {/* Risk Zone */}
        <div className="mb-8">
          <RiskZone currentCount={currentCount} threshold={threshold} />
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Trend Analysis</h2>
          {observations.length > 0 ? (
            <TrendChart observations={observations} threshold={threshold} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              No observations yet. Add your first observation to see the trend.
            </div>
          )}
        </div>

        {/* Recent Observations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Observations</h2>
          {recentObservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentObservations.map((obs) => (
                <ObservationCard key={obs.id} observation={obs} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No observations yet.{' '}
              <Link href="/observations/new" className="text-blue-600 hover:underline">
                Add your first observation
              </Link>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's happening?</h3>
          <p className="text-sm text-blue-800 mb-4">
            This dashboard helps you track pest counts over time and identify when action is
            needed. The threshold line indicates when intervention is recommended to prevent crop
            damage.
          </p>
          <h3 className="font-semibold text-blue-900 mb-2">Why it matters</h3>
          <p className="text-sm text-blue-800">
            Timing is critical for sustainable pest control. Acting too late forces growers to
            choose between losing crops or using pesticides, which can cost organic certification
            and trust. This tool helps you catch the narrow intervention window.
          </p>
        </div>
      </div>
    </div>
  )
}
