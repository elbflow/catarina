import type { Farm, PestObservation, PestType, Trap, User } from '@/payload-types'
import config from '@/payload.config'
import { getPayload, type Where } from 'payload'
import {
  calculateObservationRates,
  calculateAverageRateForLastNDays,
  type ObservationWithRate,
} from './risk-calculator'

export interface TrapWithRelations extends Trap {
  farm: Farm
}

export interface ObservationWithRelations extends PestObservation {
  trap: TrapWithRelations
}

export interface ObservationWithRelationsAndRate extends ObservationWithRelations {
  daysSincePrevious: number | null
  rate: number | null
}

// ============ TRAP FUNCTIONS ============

/**
 * Get all traps for a farm.
 */
export async function getTraps(
  user: User | null,
  farmId?: string | number,
): Promise<TrapWithRelations[]> {
  const payload = await getPayload({ config })

  const where: Where = farmId ? { farm: { equals: farmId } } : {}

  const result = await payload.find({
    collection: 'traps',
    where,
    depth: 2,
    sort: 'name',
    user,
    overrideAccess: false,
  })

  return result.docs as TrapWithRelations[]
}

/**
 * Get a single trap by ID.
 */
export async function getTrap(id: string | number, user: User | null): Promise<TrapWithRelations> {
  const payload = await getPayload({ config })
  return await payload.findByID({
    collection: 'traps',
    id,
    depth: 2,
    user,
    overrideAccess: false,
  }) as TrapWithRelations
}

/**
 * Create a new trap. Baseline observation is created via afterChange hook.
 */
export async function createTrap(
  data: {
    name: string
    farm: number | string
  },
  user: User | null,
): Promise<Trap> {
  const payload = await getPayload({ config })

  return await payload.create({
    collection: 'traps',
    data: {
      name: data.name,
      farm: typeof data.farm === 'string' ? parseInt(data.farm, 10) : data.farm,
      isActive: true,
    },
    user,
    overrideAccess: false,
  })
}

/**
 * Get active traps for a farm.
 */
export async function getActiveTraps(
  farmId: string | number,
  user: User | null,
): Promise<TrapWithRelations[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'traps',
    where: {
      and: [
        { farm: { equals: farmId } },
        { isActive: { equals: true } },
      ],
    },
    depth: 2,
    sort: 'name',
    user,
    overrideAccess: false,
  })

  return result.docs as TrapWithRelations[]
}

// ============ OBSERVATION FUNCTIONS ============

/**
 * Get observations for a specific trap.
 */
export async function getObservationsForTrap(
  trapId: string | number,
  user: User | null,
): Promise<ObservationWithRelations[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pest-observations',
    where: { trap: { equals: trapId } },
    depth: 3,
    sort: '-date',
    user,
    overrideAccess: false,
  })

  return result.docs as ObservationWithRelations[]
}

/**
 * Get all observations for a farm (from all traps).
 */
export async function getObservationsForFarm(
  farmId: string | number,
  user: User | null,
): Promise<ObservationWithRelations[]> {
  const payload = await getPayload({ config })

  // First get all trap IDs for this farm
  const traps = await payload.find({
    collection: 'traps',
    where: { farm: { equals: farmId } },
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (traps.docs.length === 0) {
    return []
  }

  const trapIds = traps.docs.map((t) => t.id).filter((id) => id != null)

  if (trapIds.length === 0) {
    return []
  }

  // Get all observations for these traps
  const result = await payload.find({
    collection: 'pest-observations',
    where: {
      trap: { in: trapIds },
    },
    depth: 3,
    sort: '-date',
    limit: 1000,
    user,
    overrideAccess: false,
  })

  return result.docs as ObservationWithRelations[]
}

/**
 * Get observations with calculated rates for a specific trap.
 */
export async function getObservationsWithRatesForTrap(
  trapId: string | number,
  user: User | null,
): Promise<ObservationWithRelationsAndRate[]> {
  const observations = await getObservationsForTrap(trapId, user)
  return enrichObservationsWithRates(observations)
}

/**
 * Get observations with calculated rates for a farm (all traps).
 */
export async function getObservationsWithRatesForFarm(
  farmId: string | number,
  user: User | null,
): Promise<ObservationWithRelationsAndRate[]> {
  const observations = await getObservationsForFarm(farmId, user)
  return enrichObservationsWithRates(observations)
}

/**
 * Calculate rates for each trap and return the average across active traps.
 * This is the farm-level aggregated rate.
 * 
 * For each trap, calculates the 3-day average rate, then averages those trap rates.
 * This provides a farm-level view that accounts for time gaps between observations.
 */
export async function getAggregatedFarmRate(
  farmId: string | number,
  user: User | null,
): Promise<number> {
  const traps = await getActiveTraps(farmId, user)

  if (traps.length === 0) {
    return 0
  }

  const trapRates: number[] = []

  for (const trap of traps) {
    const observations = await getObservationsWithRatesForTrap(trap.id, user)
    // Calculate 3-day average rate for this trap
    const trapAverageRate = calculateAverageRateForLastNDays(observations, 3)
    trapRates.push(trapAverageRate)
  }

  if (trapRates.length === 0) {
    return 0
  }

  // Return average of trap rates (e.g., Trap A: 1/day + Trap B: 2/day = 1.5/day average)
  return trapRates.reduce((sum, rate) => sum + rate, 0) / trapRates.length
}

/**
 * Get rate info for each trap in a farm.
 */
export async function getTrapRates(
  farmId: string | number,
  user: User | null,
): Promise<Array<{
  trap: TrapWithRelations
  rate: number | null
  observationCount: number
  lastObservationDate: string | null
}>> {
  const traps = await getTraps(user, farmId)
  const results: Array<{
    trap: TrapWithRelations
    rate: number | null
    observationCount: number
    lastObservationDate: string | null
  }> = []

  for (const trap of traps) {
    const observations = await getObservationsWithRatesForTrap(trap.id, user)
    const mostRecentWithRate = observations.find((obs) => obs.rate !== null)

    results.push({
      trap,
      rate: mostRecentWithRate?.rate ?? null,
      observationCount: observations.length,
      lastObservationDate: observations[0]?.date ?? null,
    })
  }

  return results
}

/**
 * Helper to enrich observations with calculated rates.
 */
function enrichObservationsWithRates(
  observations: ObservationWithRelations[],
): ObservationWithRelationsAndRate[] {
  if (observations.length === 0) return []

  // Group observations by trap for rate calculation
  const byTrap = new Map<number, ObservationWithRelations[]>()
  for (const obs of observations) {
    const trapId = typeof obs.trap === 'object' ? obs.trap.id : obs.trap
    const existing = byTrap.get(trapId) || []
    existing.push(obs)
    byTrap.set(trapId, existing)
  }

  // Calculate rates per trap
  const ratesMap = new Map<number, ObservationWithRate>()

  for (const [, trapObs] of byTrap) {
    const forRates = trapObs.map((obs) => ({
      id: obs.id,
      date: obs.date,
      count: obs.count,
      isBaseline: obs.isBaseline ?? false,
    }))

    const withRates = calculateObservationRates(forRates)
    for (const obs of withRates) {
      ratesMap.set(obs.id, obs)
    }
  }

  // Merge rates back into observations
  return observations.map((obs) => {
    const rateData = ratesMap.get(obs.id)
    return {
      ...obs,
      daysSincePrevious: rateData?.daysSincePrevious ?? null,
      rate: rateData?.rate ?? null,
    }
  })
}

/**
 * Create an observation for a trap.
 */
export async function createObservation(
  data: {
    date: string
    count: number
    trap: number | string
    notes?: string
    isBaseline?: boolean
  },
  user: User | null,
): Promise<PestObservation> {
  const payload = await getPayload({ config })

  return await payload.create({
    collection: 'pest-observations',
    data: {
      date: data.date,
      count: data.count,
      trap: typeof data.trap === 'string' ? parseInt(data.trap, 10) : data.trap,
      notes: data.notes,
      isBaseline: data.isBaseline ?? false,
    },
    user,
    overrideAccess: false,
  })
}

/**
 * Create a baseline observation for a trap.
 */
export async function createBaselineObservation(
  data: {
    trap: number
    date?: string
  },
  user: User | null,
): Promise<PestObservation> {
  const payload = await getPayload({ config })

  return await payload.create({
    collection: 'pest-observations',
    data: {
      date: data.date || new Date().toISOString().split('T')[0],
      count: 0,
      trap: data.trap,
      isBaseline: true,
      notes: 'Trap set up - starting point for rate calculations',
    },
    user,
    overrideAccess: false,
  })
}

// ============ FARM FUNCTIONS ============

export async function getFarm(
  id: string | number,
  user: User | null,
): Promise<Farm & { pestType: PestType }> {
  const payload = await getPayload({ config })
  return await payload.findByID({
    collection: 'farms',
    id,
    depth: 1,
    user,
    overrideAccess: false,
  }) as Farm & { pestType: PestType }
}

export async function getFarms(
  user: User | null,
): Promise<Array<Farm & { pestType: PestType }>> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'farms',
    depth: 1,
    user,
    overrideAccess: false,
  })
  return result.docs as Array<Farm & { pestType: PestType }>
}

// ============ PEST TYPE FUNCTIONS ============

export async function getPestType(id: string | number): Promise<PestType> {
  const payload = await getPayload({ config })
  return await payload.findByID({
    collection: 'pest-types',
    id,
    depth: 0,
  })
}

export async function getPestTypes(): Promise<PestType[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pest-types',
    depth: 0,
  })
  return result.docs
}

/**
 * Get the most recent observation for a trap.
 */
export async function getLatestObservation(
  trapId: string | number,
  user: User | null,
): Promise<ObservationWithRelations | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pest-observations',
    where: {
      trap: { equals: trapId },
    },
    depth: 3,
    sort: '-date',
    limit: 1,
    user,
    overrideAccess: false,
  })

  return result.docs.length > 0 ? (result.docs[0] as ObservationWithRelations) : null
}

/**
 * Get the latest calculated rate for a specific trap.
 */
export async function getLatestRateForTrap(
  trapId: string | number,
  user: User | null,
): Promise<number> {
  const observations = await getObservationsWithRatesForTrap(trapId, user)
  const mostRecentWithRate = observations.find((obs) => obs.rate !== null)
  return mostRecentWithRate?.rate ?? 0
}

// Note: This file is for server-side use only (Server Components, API routes, etc.)
// For client-side API calls, use '@/lib/api-client' instead
