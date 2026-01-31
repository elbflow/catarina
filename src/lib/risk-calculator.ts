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
 * Calculate risk level based on current rate and threshold.
 */
export function calculateRateRisk(currentRate: number, rateThreshold: number): RateRisk {
  const ratePercentage = (currentRate / rateThreshold) * 100
  let level: RiskLevel = 'safe'
  let message = ''

  if (ratePercentage >= 100) {
    level = 'danger'
    message = `Action required: Rate (${currentRate.toFixed(1)}/day) exceeds threshold (${rateThreshold}/day)`
  } else if (ratePercentage >= 80) {
    level = 'warning'
    message = `Approaching threshold: ${currentRate.toFixed(1)}/${rateThreshold} per day (${Math.round(ratePercentage)}%)`
  } else {
    level = 'safe'
    message = `Within safe range: ${currentRate.toFixed(1)}/${rateThreshold} per day (${Math.round(ratePercentage)}%)`
  }

  return {
    level,
    currentRate,
    ratePercentage,
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
