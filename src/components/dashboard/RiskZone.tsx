'use client'

import { calculateRateRisk } from '@/lib/risk-calculator'

interface RiskZoneProps {
  averageRate: number
}

export function RiskZone({ averageRate }: RiskZoneProps) {
  const risk = calculateRateRisk(averageRate)

  const getRiskStyles = () => {
    switch (risk.level) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          indicator: 'bg-red-500',
          progressBg: 'bg-red-100',
          label: 'Danger Zone',
          icon: '🚨',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          indicator: 'bg-amber-500',
          progressBg: 'bg-amber-100',
          label: 'Warning Zone',
          icon: '⚡',
        }
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          indicator: 'bg-emerald-500',
          progressBg: 'bg-emerald-100',
          label: 'Safe Zone',
          icon: '✓',
        }
    }
  }

  const styles = getRiskStyles()

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{styles.icon}</span>
          <div>
            <h3 className={`text-lg font-semibold ${styles.text}`}>{styles.label}</h3>
            <p className={`text-sm opacity-80 ${styles.text}`}>{risk.message}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${styles.text}`}>{averageRate.toFixed(1)}</div>
          <div className={`text-xs opacity-60 ${styles.text}`}>3-day avg/day</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className={`flex-1 ${styles.progressBg} rounded-full h-3`}>
          <div
            className={`h-3 rounded-full ${styles.indicator} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(risk.ratePercentage, 100)}%` }}
          />
        </div>
        <div className={`text-sm font-medium ${styles.text}`}>
          {averageRate.toFixed(1)}/2 per day
        </div>
      </div>
    </div>
  )
}
