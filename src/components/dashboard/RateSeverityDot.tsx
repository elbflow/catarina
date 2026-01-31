'use client'

interface RateSeverityDotProps {
  rate: number | null
  rateThreshold: number
  size?: 'sm' | 'md'
}

export function RateSeverityDot({ rate, rateThreshold, size = 'sm' }: RateSeverityDotProps) {
  if (rate === null) {
    // Baseline observation - gray dot
    return (
      <span
        className={`inline-block rounded-full bg-gray-300 ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
        title="Baseline observation"
      />
    )
  }

  const percentage = (rate / rateThreshold) * 100
  let colorClass = 'bg-emerald-500'
  let title = 'Safe'

  if (percentage >= 100) {
    colorClass = 'bg-red-500'
    title = 'Danger - exceeds threshold'
  } else if (percentage >= 80) {
    colorClass = 'bg-amber-500'
    title = 'Warning - approaching threshold'
  }

  return (
    <span
      className={`inline-block rounded-full ${colorClass} ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
      title={`${title} (${rate.toFixed(1)}/day)`}
    />
  )
}
