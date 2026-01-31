'use client'

interface RateSeverityDotProps {
  rate: number | null
  size?: 'sm' | 'md'
}

/**
 * Displays a colored dot indicating severity based on fixed thresholds:
 * - Safe (green): rate < 1
 * - Warning (amber): rate between 1 and 2
 * - Danger (red): rate > 2
 */
export function RateSeverityDot({ rate, size = 'sm' }: RateSeverityDotProps) {
  if (rate === null) {
    // Baseline observation - gray dot
    return (
      <span
        className={`inline-block rounded-full bg-gray-300 ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
        title="Baseline observation"
      />
    )
  }

  let colorClass = 'bg-emerald-500'
  let title = 'Safe'

  if (rate > 2) {
    colorClass = 'bg-red-500'
    title = 'Danger - exceeds 2/day'
  } else if (rate >= 1) {
    colorClass = 'bg-amber-500'
    title = 'Warning - between 1-2/day'
  }

  return (
    <span
      className={`inline-block rounded-full ${colorClass} ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
      title={`${title} (${rate.toFixed(1)}/day)`}
    />
  )
}
