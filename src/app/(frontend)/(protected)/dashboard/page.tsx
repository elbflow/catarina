import { PaginatedObservationList } from '@/components/dashboard/PaginatedObservationList'
import { RiskZone } from '@/components/dashboard/RiskZone'
import { TrapSelector } from '@/components/dashboard/TrapSelector'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { ViewToggle } from '@/components/dashboard/ViewToggle'
import { EmptyState } from '@/components/layout/EmptyState'
import { getAuthHeaders } from '@/lib/auth-helpers'
import {
    getCoopFarmsWithRisk,
    getFarms,
    getObservationsWithRatesForFarm,
    getObservationsWithRatesForTrap,
    getObservationsWithRatesForCoop,
    getTrap,
    getTrapRates,
} from '@/lib/payload-client'
import {
    calculateAverageRateForLastNDays,
    filterObservationsToLastNDays,
} from '@/lib/risk-calculator'
import type { Coop, PestType } from '@/payload-types'
import config from '@/payload.config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Suspense } from 'react'
import { CoopMapWrapper } from '@/components/dashboard/CoopMapWrapper'

interface PageProps {
  searchParams: Promise<{ trap?: string; page?: string; pageSize?: string; view?: string }>
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

  // Determine view mode (farm or coop)
  const viewParam = params.view
  const selectedView: 'farm' | 'coop' = viewParam === 'coop' ? 'coop' : 'farm'

  // Check if farm has a co-op and get co-op info
  let coop: Coop | null = null
  let coopId: number | null = null
  if (farm.coop) {
    if (typeof farm.coop === 'object') {
      coop = farm.coop
      coopId = coop.id
    } else {
      coopId = farm.coop
      // Fetch co-op details
      const coopDoc = await payload.findByID({
        collection: 'coops',
        id: coopId,
        depth: 0,
      })
      coop = coopDoc as Coop
    }
  }

  // Get farm risk data for map (only in co-op view)
  let coopFarmsWithRisk: Awaited<ReturnType<typeof getCoopFarmsWithRisk>> = []
  if (selectedView === 'coop' && coopId !== null) {
    coopFarmsWithRisk = await getCoopFarmsWithRisk(coopId, user)
  }

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

  // Get observations for the list (always farm-specific)
  const listObservations = validTrapSelected && selectedTrapId !== null
    ? await getObservationsWithRatesForTrap(selectedTrapId, user)
    : await getObservationsWithRatesForFarm(farm.id, user)

  // Get observations for chart and risk zone (farm or co-op based on view)
  let chartAndRiskObservations: typeof listObservations
  if (selectedView === 'coop' && coopId !== null) {
    // Co-op view: use aggregated co-op observations for chart and risk zone
    chartAndRiskObservations = await getObservationsWithRatesForCoop(coopId, user)
  } else {
    // Farm view: use farm observations
    chartAndRiskObservations = listObservations
  }

  // Filter to last 90 days (3 months) for chart - chart will auto-trim to actual data range
  const chartObservations = filterObservationsToLastNDays(chartAndRiskObservations, 90)

  // Calculate 3-day average rate for risk assessment
  const averageRate = calculateAverageRateForLastNDays(chartAndRiskObservations, 3)

  // Pagination for observations list (always uses farm-specific observations)
  const pageSize = Math.min(
    [10, 20, 50].includes(parseInt(params.pageSize || '10', 10))
      ? parseInt(params.pageSize || '10', 10)
      : 10,
    50,
  )
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const totalObservations = listObservations.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedObservations = listObservations.slice(startIndex, endIndex)
  const totalPages = Math.ceil(totalObservations / pageSize)
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
              {coop && (
                <Suspense fallback={<div className="h-9 w-48 bg-gray-100 rounded-lg animate-pulse" />}>
                  <ViewToggle
                    coopName={coop.name}
                    farmName={farm.name}
                    selectedView={selectedView}
                  />
                </Suspense>
              )}
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
            <RiskZone
              averageRate={averageRate}
              isCoopView={selectedView === 'coop'}
              coopName={coop?.name}
            />
          </div>

          {/* Co-op Map (only in co-op view) */}
          {selectedView === 'coop' && coopFarmsWithRisk.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-lg font-semibold mb-4">
                Farm Locations
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({coopFarmsWithRisk.length} farms)
                </span>
              </h2>
              <CoopMapWrapper farms={coopFarmsWithRisk} />
            </div>
          )}

          {/* Trend Chart */}
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Rate Trend
              {selectedView === 'coop' && coop && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Co-Op Average: {coop.name})
                </span>
              )}
              {selectedView === 'farm' && selectedTrapId !== null && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({trapsForSelector.find((t) => t.id === selectedTrapId)?.name})
                </span>
              )}
            </h2>
            {chartObservations.length > 0 ? (
              <TrendChart observations={chartObservations} />
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
            </div>
            {totalObservations > 0 ? (
              <Suspense
                fallback={
                  <div className="text-center py-8 text-gray-500">Loading observations...</div>
                }
              >
                <PaginatedObservationList
                  observations={paginatedObservations}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalObservations={totalObservations}
                  totalPages={totalPages}
                  selectedTrapId={selectedTrapId}
                />
              </Suspense>
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
