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
 * Sum of counts in the period divided by number of days.
 */
export function calculateAverageRateForLastNDays<T extends { date: string; count: number }>(
  observations: T[],
  days: number,
): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  const recentObs = observations.filter((obs) => new Date(obs.date) >= cutoff)

  if (recentObs.length === 0) return 0

  const totalCount = recentObs.reduce((sum, obs) => sum + obs.count, 0)
  return totalCount / days
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
