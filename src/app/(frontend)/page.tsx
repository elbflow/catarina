import { getObservations, getFarms, getPestTypes } from '@/lib/payload-client'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { RiskZone } from '@/components/dashboard/RiskZone'
import { WarningBanner } from '@/components/dashboard/WarningBanner'
import { ObservationCard } from '@/components/dashboard/ObservationCard'
import Link from 'next/link'
import type { ObservationWithRelations } from '@/lib/payload-client'

export default async function HomePage() {
  const farms = await getFarms()
  const pestTypes = await getPestTypes()

  if (farms.length === 0 || pestTypes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card text-center max-w-md">
          <div className="text-5xl mb-4">🐞</div>
          <h1 className="text-2xl font-semibold mb-3">Welcome to Catarina</h1>
          <p className="text-gray-600 mb-6">
            No data found. Seed the demo data or create a farm and pest type to get started.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/api/seed" className="btn-primary text-center">
              Seed Demo Data
            </Link>
            <Link href="/admin" className="btn-secondary text-center">
              Open Admin Panel
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const farm = farms[0]
  const pestType = pestTypes[0]
  const observations = await getObservations(farm.id, pestType.id)

  const latestObservation = observations.length > 0 ? observations[0] : null
  const currentCount = latestObservation?.count || 0
  const threshold = typeof pestType.threshold === 'number' ? pestType.threshold : 5
  const recentObservations = observations.slice(0, 5)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐞</span>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Catarina</h1>
                <p className="text-sm text-gray-500">
                  {typeof farm === 'object' && farm?.name} · {typeof pestType === 'object' && pestType?.name}
                </p>
              </div>
            </div>
            <Link href="/observations/new" className="btn-primary">
              + Add Observation
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Warning Banner */}
        {latestObservation && (
          <div className="mb-6">
            <WarningBanner currentCount={currentCount} threshold={threshold} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Zone - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RiskZone currentCount={currentCount} threshold={threshold} />
          </div>
          
          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Observations</p>
                <p className="text-2xl font-semibold">{observations.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Latest Count</p>
                <p className="text-2xl font-semibold">{currentCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Action Threshold</p>
                <p className="text-2xl font-semibold text-red-600">{threshold}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Trend Analysis</h2>
          {observations.length > 0 ? (
            <TrendChart observations={observations} threshold={threshold} />
          ) : (
            <div className="text-center py-16 text-gray-500">
              No observations yet. Add your first observation to see the trend.
            </div>
          )}
        </div>

        {/* Recent Observations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Observations</h2>
            {recentObservations.length > 0 && (
              <span className="text-sm text-gray-500">Last {recentObservations.length} entries</span>
            )}
          </div>
          {recentObservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentObservations.map((obs) => (
                <ObservationCard key={obs.id} observation={obs} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No observations yet.{' '}
              <Link href="/observations/new" className="text-blue-600 hover:underline">
                Add your first observation
              </Link>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How to use this dashboard</h3>
              <p className="text-sm text-blue-800 mb-3">
                Track pest counts over time and identify when action is needed. The red threshold line 
                indicates when intervention is recommended to prevent crop damage.
              </p>
              <p className="text-sm text-blue-700">
                <strong>Why timing matters:</strong> Acting too late forces growers to choose between 
                losing crops or using pesticides, which can cost organic certification. This tool helps 
                you catch the narrow intervention window.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
