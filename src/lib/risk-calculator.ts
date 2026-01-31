export type RiskLevel = 'safe' | 'warning' | 'danger'

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

export function getDaysUntilThreshold(
  observations: Array<{ date: string; count: number }>,
  threshold: number,
): number | null {
  if (observations.length < 2) return null

  // Sort by date
  const sorted = [...observations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Calculate trend (simple linear regression)
  const recent = sorted.slice(-7) // Use last 7 observations
  if (recent.length < 2) return null

  const dates = recent.map((obs) => new Date(obs.date).getTime())
  const counts = recent.map((obs) => obs.count)

  // Simple linear regression
  const n = recent.length
  const sumX = dates.reduce((a, b) => a + b, 0)
  const sumY = counts.reduce((a, b) => a + b, 0)
  const sumXY = dates.reduce((sum, x, i) => sum + x * counts[i], 0)
  const sumX2 = dates.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const _intercept = (sumY - slope * sumX) / n

  // Project when threshold will be reached
  if (slope <= 0) return null // Not increasing

  const _lastDate = dates[dates.length - 1]
  const lastCount = counts[counts.length - 1]

  if (lastCount >= threshold) return 0 // Already exceeded

  const daysToThreshold = (threshold - lastCount) / (slope / (1000 * 60 * 60 * 24))

  return Math.max(0, Math.round(daysToThreshold))
}
