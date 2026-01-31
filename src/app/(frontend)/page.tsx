import { Suspense } from 'react'
import {
  getFarms,
  getObservationsWithRatesForFarm,
  getObservationsWithRatesForTrap,
  getTrapRates,
  getTrap,
} from '@/lib/payload-client'
import {
  filterObservationsToLastNDays,
  calculateAverageRateForLastNDays,
} from '@/lib/risk-calculator'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { RiskZone } from '@/components/dashboard/RiskZone'
import { ObservationList } from '@/components/dashboard/ObservationList'
import { TrapSelector } from '@/components/dashboard/TrapSelector'
import Link from 'next/link'
import type { PestType } from '@/payload-types'

interface PageProps {
  searchParams: Promise<{ trap?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const farms = await getFarms()

  if (farms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card text-center max-w-md">
          <div className="text-5xl mb-4">🐞</div>
          <h1 className="text-2xl font-semibold mb-3">Welcome to Catarina</h1>
          <p className="text-gray-600 mb-6">
            No farms found. Seed the demo data or create a farm to get started.
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
  const pestType = farm.pestType as PestType

  // Get trap info for the trap selector
  const trapRatesData = await getTrapRates(farm.id)
  const trapsForSelector = trapRatesData.map((t) => ({
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
        await getTrap(parsedId)
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
    ? await getObservationsWithRatesForTrap(selectedTrapId)
    : await getObservationsWithRatesForFarm(farm.id)

  // Filter to last 5 days for display
  const observations = filterObservationsToLastNDays(allObservations, 5)

  // Calculate 3-day average rate for risk assessment
  const averageRate = calculateAverageRateForLastNDays(allObservations, 3)

  const recentObservations = observations.slice(0, 10)
  const hasTraps = trapsForSelector.length > 0

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
                  {farm.name} · {pestType.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Suspense fallback={<div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />}>
                <TrapSelector
                  farmId={String(farm.id)}
                  traps={trapsForSelector}
                  selectedTrapId={selectedTrapId}
                />
              </Suspense>
              <Link href="/observations/new" className="btn-primary">
                + Add Observation
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
    </div>
  )
}
