import { ObservationList } from '@/components/dashboard/ObservationList'
import { RiskZone } from '@/components/dashboard/RiskZone'
import { TrapSelector } from '@/components/dashboard/TrapSelector'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { EmptyState } from '@/components/layout/EmptyState'
import { getAuthHeaders } from '@/lib/auth-helpers'
import {
    getFarms,
    getObservationsWithRatesForFarm,
    getObservationsWithRatesForTrap,
    getTrap,
    getTrapRates,
} from '@/lib/payload-client'
import {
    calculateAverageRateForLastNDays,
    filterObservationsToLastNDays,
} from '@/lib/risk-calculator'
import type { PestType } from '@/payload-types'
import config from '@/payload.config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{ trap?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Get current user for access control
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getAuthHeaders() })

  if (!user) {
    return null // Should be caught by layout, but TypeScript needs this
  }

  const farms = await getFarms(user)

  // Handle technician with no farms
  if (farms.length === 0 && user.role === 'technician') {
    return (
      <EmptyState
        user={user}
        title="No Farms Assigned Yet"
        message="You're logged in as a technician. Contact your farm manager or co-op admin to be assigned to farms."
      />
    )
  }

  // Handle farmer with no farms (should be caught by layout, but handle gracefully)
  if (farms.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="card text-center">
          <div className="text-5xl mb-4">🐞</div>
          <h1 className="text-2xl font-semibold mb-3">Welcome to Catarina</h1>
          <p className="text-gray-600 mb-6">
            No farms found. Please create your first farm to get started.
          </p>
          <Link href="/onboarding" className="btn-primary">
            Create Your First Farm
          </Link>
        </div>
      </main>
    )
  }

  const farm = farms[0]
  const _pestType = farm.pestType as PestType

  // Get trap info for the trap selector
  const trapRatesData = await getTrapRates(farm.id, user)
  const trapsForSelector = trapRatesData
    .filter((t) => t.trap != null)
    .map((t) => ({
      id: t.trap.id,
      name: t.trap.name,
      isActive: t.trap.isActive ?? true,
      rate: t.rate,
      observationCount: t.observationCount,
      lastObservationDate: t.lastObservationDate,
    }))

  // Determine selected trap from URL params
  const trapIdParam = params.trap
  let selectedTrapId: number | null = null
  let validTrapSelected = false

  if (trapIdParam) {
    const parsedId = parseInt(trapIdParam, 10)
    if (!isNaN(parsedId)) {
      // Validate that the trap exists
      try {
        await getTrap(parsedId, user)
        selectedTrapId = parsedId
        validTrapSelected = true
      } catch {
        // Invalid trap ID - fall back to all traps
        selectedTrapId = null
      }
    }
  }

  // Get observations based on selection
  const allObservations = validTrapSelected && selectedTrapId !== null
    ? await getObservationsWithRatesForTrap(selectedTrapId, user)
    : await getObservationsWithRatesForFarm(farm.id, user)

  // Filter to last 5 days for display
  const observations = filterObservationsToLastNDays(allObservations, 5)

  // Calculate 3-day average rate for risk assessment
  const averageRate = calculateAverageRateForLastNDays(allObservations, 3)

  const recentObservations = observations.slice(0, 10)
  const hasTraps = trapsForSelector.length > 0

  return (
    <>
      {/* Dashboard Header Actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Suspense fallback={<div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />}>
                <TrapSelector
                  farmId={String(farm.id)}
                  traps={trapsForSelector}
                  selectedTrapId={selectedTrapId}
                />
              </Suspense>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/observations/new" className="btn-primary">
                + Add Observation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
      {/* No Traps State */}
      {!hasTraps && (
        <div className="card text-center mb-8">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="text-xl font-semibold mb-2">Set Up Your First Trap</h2>
          <p className="text-gray-600 mb-6">
            Add traps to start recording observations. Each trap tracks its own
            capture rate, and the dashboard shows the average across all traps.
          </p>
          <p className="text-gray-500 text-sm">
            Use the trap selector in the header to add your first trap.
          </p>
        </div>
      )}

      {hasTraps && (
        <>
          {/* Risk Zone */}
          <div className="mb-8">
            <RiskZone averageRate={averageRate} />
          </div>

          {/* Trend Chart */}
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Rate Trend
              {selectedTrapId !== null && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({trapsForSelector.find((t) => t.id === selectedTrapId)?.name})
                </span>
              )}
            </h2>
            {observations.length > 0 ? (
              <TrendChart observations={observations} />
            ) : (
              <div className="text-center py-16 text-gray-500">
                No observations yet. Add your first observation to see the trend.
              </div>
            )}
          </div>

          {/* Recent Observations */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Recent Observations
                {selectedTrapId !== null && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({trapsForSelector.find((t) => t.id === selectedTrapId)?.name})
                  </span>
                )}
              </h2>
              {recentObservations.length > 0 && (
                <span className="text-sm text-gray-500">Last {recentObservations.length} entries</span>
              )}
            </div>
            {recentObservations.length > 0 ? (
              <ObservationList observations={recentObservations} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                No observations yet.{' '}
                <Link href="/observations/new" className="text-blue-600 hover:underline">
                  Add your first observation
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How to use this dashboard</h3>
            <p className="text-sm text-blue-800 mb-3">
              Track pest capture rates over time and identify when action is needed. The red threshold line
              indicates when the daily capture rate suggests intervention is recommended.
            </p>
            <p className="text-sm text-blue-700">
              <strong>Why rate matters:</strong> 10 insects caught over 10 days (1/day) is very different from
              10 insects in 1 day (10/day). Rate-based tracking helps you make better decisions about timing.
            </p>
          </div>
        </div>
      </div>
      </main>
    </>
  )
}
