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
      className={`rounded-xl border p-4 ${
        isDanger
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{isDanger ? '🚨' : '⚡'}</span>
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${isDanger ? 'text-red-900' : 'text-amber-900'}`}>
            {isDanger ? 'Action Required' : 'Approaching Threshold'}
          </h3>
          <p className={`text-sm ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
            {isDanger
              ? `Pest count (${currentCount}) has exceeded the action threshold (${threshold}). Immediate intervention recommended.`
              : `Pest count (${currentCount}) is approaching the action threshold (${threshold}). Monitor closely and prepare for intervention.`}
          </p>
        </div>
      </div>
    </div>
  )
}
