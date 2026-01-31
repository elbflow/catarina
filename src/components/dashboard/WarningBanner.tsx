'use client'

import { calculateRiskLevel } from '@/lib/risk-calculator'

interface WarningBannerProps {
  currentCount: number
  threshold: number
}

export function WarningBanner({ currentCount, threshold }: WarningBannerProps) {
  const risk = calculateRiskLevel(currentCount, threshold)

  if (!risk.shouldShowWarning) {
    return null
  }

  const isDanger = risk.level === 'danger'

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        isDanger
          ? 'bg-red-50 border-red-300 text-red-900'
          : 'bg-amber-50 border-amber-300 text-amber-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{isDanger ? '⚠️' : '⚡'}</div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            {isDanger ? 'Action Required' : 'Approaching Threshold'}
          </h3>
          <p className="text-sm">
            {isDanger
              ? `Pest count (${currentCount}) has exceeded the action threshold (${threshold}). Immediate intervention recommended.`
              : `Pest count (${currentCount}) is approaching the action threshold (${threshold}). Monitor closely and prepare for intervention.`}
          </p>
        </div>
      </div>
    </div>
  )
}
