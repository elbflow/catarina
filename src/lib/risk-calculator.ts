export type RiskLevel = 'safe' | 'warning' | 'danger'

export interface ObservationWithRate {
  id: number
  date: string
  count: number // delta (new insects since last check)
  daysSincePrevious: number | null
  rate: number | null // count / daysSincePrevious
  isBaseline?: boolean
}

export interface RateRisk {
  level: RiskLevel
  currentRate: number
  ratePercentage: number
  message: string
}

/**
 * Calculate rates for a list of observations.
 * Observations should be sorted by date descending (newest first).
 */
export function calculateObservationRates(
  observations: Array<{ id: number; date: string; count: number; isBaseline?: boolean }>,
): ObservationWithRate[] {
  if (observations.length === 0) return []

  // Sort by date ascending for rate calculation (oldest first)
  const sorted = [...observations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const result: ObservationWithRate[] = []

  for (let i = 0; i < sorted.length; i++) {
    const obs = sorted[i]

    if (i === 0 || obs.isBaseline) {
      // First observation or baseline - no rate calculation
      result.push({
        id: obs.id,
        date: obs.date,
        count: obs.count,
        daysSincePrevious: null,
        rate: null,
        isBaseline: obs.isBaseline,
      })
    } else {
      const prevObs = sorted[i - 1]
      const currentDate = new Date(obs.date)
      const prevDate = new Date(prevObs.date)
      const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

      // Use minimum of 0.5 days for same-day observations
      const daysSincePrevious = Math.max(daysDiff, 0.5)
      const rate = obs.count / daysSincePrevious

      result.push({
        id: obs.id,
        date: obs.date,
        count: obs.count,
        daysSincePrevious,
        rate,
        isBaseline: obs.isBaseline,
      })
    }
  }

  // Return in descending order (newest first)
  return result.reverse()
}

/**
 * Calculate risk level based on average rate using fixed thresholds.
 * Safe: average < 1
 * Warning: average between 1 and 2
 * Danger: average > 2
 */
export function calculateRateRisk(averageRate: number): RateRisk {
  let level: RiskLevel = 'safe'
  let message = ''

  if (averageRate > 2) {
    level = 'danger'
    message = `Action required: Average rate (${averageRate.toFixed(1)}/day) exceeds 2/day`
  } else if (averageRate >= 1) {
    level = 'warning'
    message = `Warning: Average rate (${averageRate.toFixed(1)}/day) between 1-2/day`
  } else {
    level = 'safe'
    message = `Safe: Average rate (${averageRate.toFixed(1)}/day) below 1/day`
  }

  return {
    level,
    currentRate: averageRate,
    ratePercentage: (averageRate / 2) * 100,
    message,
  }
}

/**
 * Get the most recent rate from observations with rates.
 * Returns 0 if no valid rate exists.
 */
export function getMostRecentRate(observationsWithRates: ObservationWithRate[]): number {
  for (const obs of observationsWithRates) {
    if (obs.rate !== null) {
      return obs.rate
    }
  }
  return 0
}

/**
 * Filter observations to last N days.
 */
export function filterObservationsToLastNDays<T extends { date: string }>(
  observations: T[],
  days: number,
): T[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  return observations.filter((obs) => new Date(obs.date) >= cutoff)
}

/**
 * Calculate average daily rate for last N days.
 * 
 * This function correctly accounts for time gaps between observations.
 * Each observation's rate applies to the days it covers (from previous observation + 1 to this observation date).
 * For each day in the window, we find the observation that covers it and use its rate.
 * 
 * @param observations - Observations with calculated rates (must have rate and daysSincePrevious)
 * @param days - Number of days to look back (e.g., 3 for 3-day average)
 * @returns Average daily rate over the period, or 0 if no observations cover the period
 */
export function calculateAverageRateForLastNDays<
  T extends { date: string; rate: number | null; daysSincePrevious?: number | null },
>(
  observations: T[],
  days: number,
): number {
  if (observations.length === 0) return 0

  // Calculate the window start date (N days ago at midnight)
  const windowEnd = new Date()
  windowEnd.setHours(23, 59, 59, 999) // End of today
  const windowStart = new Date()
  windowStart.setDate(windowStart.getDate() - days)
  windowStart.setHours(0, 0, 0, 0) // Start of day N days ago

  // Sort observations by date ascending (oldest first) to process chronologically
  const sorted = [...observations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Filter to observations that could be relevant (within or before the window)
  // We need observations before the window too, as they may cover early days
  const relevantObs = sorted.filter((obs) => {
    const obsDate = new Date(obs.date)
    // Include observations on or before window end, and observations that might cover window start
    return obsDate <= windowEnd
  })

  if (relevantObs.length === 0) return 0

  // For each day in the window, find the rate that applies to it
  // An observation covers a day if the day falls within the period from
  // (previous observation date + 1) to (this observation date)
  const dailyRates: number[] = []

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDay = new Date(windowStart)
    currentDay.setDate(currentDay.getDate() + dayOffset)
    currentDay.setHours(0, 0, 0, 0)
    const currentDayTime = currentDay.getTime()

    // Find the observation that covers this day
    // An observation covers a day if the day falls within:
    // (previous observation date + 1) to (this observation date)
    let coveringObs: T | null = null

    // Find observations whose date is >= current day (they could cover this day)
    // Then check if their coverage period includes the current day
    for (let i = 0; i < relevantObs.length; i++) {
      const obs = relevantObs[i]
      const obsDate = new Date(obs.date)
      obsDate.setHours(0, 0, 0, 0)
      const obsDateTime = obsDate.getTime()

      // Skip if observation date is before current day (can't cover future days)
      if (obsDateTime < currentDayTime) continue

      // Determine the coverage period for this observation
      // Coverage starts the day after the previous observation
      let coverageStartTime: number
      if (
        obs.daysSincePrevious !== null &&
        obs.daysSincePrevious !== undefined &&
        obs.daysSincePrevious > 0
      ) {
        // Use daysSincePrevious to calculate coverage start
        // Coverage starts the day after the previous observation
        // prevObsDate = obsDate - daysSincePrevious
        // coverageStart = prevObsDate + 1 day = obsDate - daysSincePrevious + 1 day
        const coverageStart = new Date(obsDate)
        coverageStart.setDate(coverageStart.getDate() - obs.daysSincePrevious + 1)
        coverageStart.setHours(0, 0, 0, 0)
        coverageStartTime = Math.max(coverageStart.getTime(), windowStart.getTime())
      } else if (i > 0) {
        // Fallback: use previous observation in array (for cases without daysSincePrevious)
        const prevObs = relevantObs[i - 1]
        const prevObsDate = new Date(prevObs.date)
        prevObsDate.setHours(0, 0, 0, 0)
        coverageStartTime = prevObsDate.getTime() + 24 * 60 * 60 * 1000 // +1 day
        // Coverage can't start before the window start
        coverageStartTime = Math.max(coverageStartTime, windowStart.getTime())
      } else {
        // First observation with no daysSincePrevious - use window start or its own date
        coverageStartTime = Math.min(obsDateTime, windowStart.getTime())
      }

      // Check if current day falls within this observation's coverage period
      // The day must be >= coverage start and <= observation date
      if (currentDayTime >= coverageStartTime && currentDayTime <= obsDateTime) {
        // Only use this observation if it has a valid rate
        if (obs.rate !== null && obs.rate !== undefined) {
          coveringObs = obs
          break
        }
        // If it's a baseline (no rate), continue to find the next observation that covers this day
      }
    }

    // If we found a covering observation with a rate, use it
    // Otherwise, use 0 (no observation covers this day)
    if (coveringObs && coveringObs.rate !== null) {
      dailyRates.push(coveringObs.rate)
    } else {
      // No observation covers this day - treat as 0 rate
      dailyRates.push(0)
    }
  }

  // Calculate average of daily rates
  if (dailyRates.length === 0) return 0

  const sum = dailyRates.reduce((acc, rate) => acc + rate, 0)
  return sum / dailyRates.length
}

/**
 * Expand observations to daily rate data points.
 * Each day from the earliest to latest observation gets a data point with the rate
 * from the observation that covers it. This allows charts to show continuous daily
 * rates rather than discrete observation events.
 *
 * @param observations - Observations with date, count, rate, and daysSincePrevious
 * @returns Daily data points with rate for each day
 */
export function expandObservationsToDailyRates<
  T extends {
    date: string
    rate: number | null
    daysSincePrevious: number | null
    count: number
  },
>(observations: T[]): Array<{
  date: string
  timestamp: number
  rate: number
  count: number
  daysSincePrevious: number | null
  isObservationDay: boolean
}> {
  if (observations.length === 0) return []

  // Sort by date ascending (oldest first)
  const sorted = [...observations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Find date range
  const dates = sorted.map((obs) => new Date(obs.date))
  let minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
  
  // Extend minDate backward based on first rate-bearing observation's daysSincePrevious
  // This ensures days covered by the first observation's rate are included
  const firstWithRate = sorted.find((obs) => obs.rate !== null && obs.rate !== undefined)
  if (firstWithRate?.daysSincePrevious !== null && firstWithRate.daysSincePrevious !== undefined && firstWithRate.daysSincePrevious > 0) {
    const firstDate = new Date(firstWithRate.date)
    firstDate.setHours(0, 0, 0, 0)
    const extendedMin = new Date(firstDate)
    extendedMin.setDate(extendedMin.getDate() - firstWithRate.daysSincePrevious + 1)
    if (extendedMin.getTime() < minDate.getTime()) {
      minDate = extendedMin
    }
  }
  
  minDate.setHours(0, 0, 0, 0)
  maxDate.setHours(0, 0, 0, 0)

  const dailyData: Array<{
    date: string
    timestamp: number
    rate: number
    count: number
    daysSincePrevious: number | null
    isObservationDay: boolean
  }> = []

  // Track which dates have actual observations
  const observationDates = new Set(
    sorted.map((obs) => {
      const d = new Date(obs.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    }),
  )

  // For each day in the range, find the observation that covers it
  const currentDay = new Date(minDate)
  while (currentDay <= maxDate) {
    const currentDayTime = currentDay.getTime()
    const currentDayStr = currentDay.toISOString().split('T')[0]

    // Find the observation that covers this day
    // An observation covers a day if the day falls within:
    // (previous observation date + 1) to (this observation date)
    let coveringObs: T | null = null

    for (let i = 0; i < sorted.length; i++) {
      const obs = sorted[i]
      if (obs.rate === null || obs.rate === undefined) continue

      const obsDate = new Date(obs.date)
      obsDate.setHours(0, 0, 0, 0)
      const obsDateTime = obsDate.getTime()

      // Skip if observation date is before current day
      if (obsDateTime < currentDayTime) continue

      // Determine coverage period for this observation
      let coverageStartTime: number
      if (obs.daysSincePrevious !== null && obs.daysSincePrevious !== undefined && obs.daysSincePrevious > 0) {
        // Use daysSincePrevious to calculate coverage start
        // Coverage starts the day after the previous observation
        // prevObsDate = obsDate - daysSincePrevious
        // coverageStart = prevObsDate + 1 day = obsDate - daysSincePrevious + 1 day
        const coverageStart = new Date(obsDate)
        coverageStart.setDate(coverageStart.getDate() - obs.daysSincePrevious + 1)
        coverageStart.setHours(0, 0, 0, 0)
        coverageStartTime = Math.max(coverageStart.getTime(), minDate.getTime())
      } else if (i > 0) {
        // Fallback: use previous observation in array (for cases without daysSincePrevious)
        const prevObs = sorted[i - 1]
        const prevObsDate = new Date(prevObs.date)
        prevObsDate.setHours(0, 0, 0, 0)
        coverageStartTime = prevObsDate.getTime() + 24 * 60 * 60 * 1000 // +1 day
        coverageStartTime = Math.max(coverageStartTime, minDate.getTime())
      } else {
        // First observation with no daysSincePrevious - use its own date
        coverageStartTime = Math.min(obsDateTime, minDate.getTime())
      }

      // Check if current day falls within this observation's coverage period
      if (currentDayTime >= coverageStartTime && currentDayTime <= obsDateTime) {
        coveringObs = obs
        break
      }
    }

    // Add data point for this day
    if (coveringObs && coveringObs.rate !== null) {
      dailyData.push({
        date: currentDayStr,
        timestamp: currentDayTime,
        rate: coveringObs.rate,
        count: coveringObs.count,
        daysSincePrevious: coveringObs.daysSincePrevious,
        isObservationDay: observationDates.has(currentDayTime),
      })
    } else {
      // No observation covers this day - use 0 rate
      dailyData.push({
        date: currentDayStr,
        timestamp: currentDayTime,
        rate: 0,
        count: 0,
        daysSincePrevious: null,
        isObservationDay: observationDates.has(currentDayTime),
      })
    }

    // Move to next day
    currentDay.setDate(currentDay.getDate() + 1)
  }

  return dailyData
}

/**
 * Aggregate observations by date, summing counts for same-day observations.
 * This is useful for displaying charts where multiple observations on the same day
 * should be shown as a single point with combined counts.
 *
 * @param observations - Observations with date, count, rate, and daysSincePrevious
 * @returns Aggregated observations (one per date)
 */
export function aggregateObservationsByDate<
  T extends { date: string; count: number; rate: number | null; daysSincePrevious: number | null },
>(observations: T[]): T[] {
  if (observations.length === 0) return []

  // Group observations by date (YYYY-MM-DD)
  const byDate = new Map<string, T[]>()

  for (const obs of observations) {
    // Extract date part (YYYY-MM-DD) from ISO string
    const dateKey = obs.date.split('T')[0]
    const existing = byDate.get(dateKey) || []
    existing.push(obs)
    byDate.set(dateKey, existing)
  }

  // Aggregate each date group
  return Array.from(byDate.entries()).map(([dateKey, obsGroup]) => {
    // If only one observation for this date, return it as-is
    if (obsGroup.length === 1) {
      return obsGroup[0]
    }

    // Multiple observations on same day: sum counts and recalculate rate
    const totalCount = obsGroup.reduce((sum, o) => sum + o.count, 0)

    // Use the first observation as the base (preserves other fields like id, trap, etc.)
    const first = obsGroup[0]

    // Recalculate rate: if we have daysSincePrevious, use it; otherwise use 1 day
    const days = first.daysSincePrevious ?? 1
    const newRate = totalCount / days

    return {
      ...first,
      count: totalCount,
      rate: newRate,
    } as T
  })
}

// Legacy function - kept for backwards compatibility during migration
export interface RiskCalculation {
  level: RiskLevel
  percentage: number
  shouldShowWarning: boolean
  message: string
}

export function calculateRiskLevel(
  count: number,
  threshold: number,
): RiskCalculation {
  const percentage = (count / threshold) * 100
  let level: RiskLevel = 'safe'
  let message = ''

  if (count >= threshold) {
    level = 'danger'
    message = `Action required: Count (${count}) exceeds threshold (${threshold})`
  } else if (percentage >= 80) {
    level = 'warning'
    message = `Approaching threshold: ${count}/${threshold} (${Math.round(percentage)}%)`
  } else {
    level = 'safe'
    message = `Within safe range: ${count}/${threshold} (${Math.round(percentage)}%)`
  }

  return {
    level,
    percentage,
    shouldShowWarning: percentage >= 80,
    message,
  }
}
