'use client'

import { calculateRiskLevel } from '@/lib/risk-calculator'

interface RiskZoneProps {
  currentCount: number
  threshold: number
}

export function RiskZone({ currentCount, threshold }: RiskZoneProps) {
  const risk = calculateRiskLevel(currentCount, threshold)

  const getRiskStyles = () => {
    switch (risk.level) {
      case 'danger':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          indicator: 'bg-red-500',
          label: 'Danger',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          indicator: 'bg-amber-500',
          label: 'Warning',
        }
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          indicator: 'bg-emerald-500',
          label: 'Safe',
        }
    }
  }

  const styles = getRiskStyles()

  return (
    <div className={`rounded-lg border-2 p-6 ${styles.bg} ${styles.text}`}>
      <div className="flex items-center gap-4">
        <div className={`w-4 h-4 rounded-full ${styles.indicator}`} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{styles.label} Zone</h3>
          <p className="text-sm opacity-80">{risk.message}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{currentCount}</div>
          <div className="text-xs opacity-60">of {threshold}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${styles.indicator} transition-all duration-300`}
            style={{ width: `${Math.min(risk.percentage, 100)}%` }}
          />
        </div>
        <div className="text-xs mt-1 opacity-60">
          {Math.round(risk.percentage)}% of threshold
        </div>
      </div>
    </div>
  )
}
