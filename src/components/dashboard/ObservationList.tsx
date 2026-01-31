'use client'

import type { ObservationWithRelationsAndRate } from '@/lib/payload-client'
import { RateSeverityDot } from './RateSeverityDot'

interface ObservationListProps {
  observations: ObservationWithRelationsAndRate[]
}

export function ObservationList({ observations }: ObservationListProps) {
  if (observations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No observations yet.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {observations.map((obs) => {
        const date = new Date(obs.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })

        const trapName = typeof obs.trap === 'object' ? obs.trap?.name : null

        // Get pest type name from trap -> farm -> pestType
        const pestTypeName = typeof obs.trap === 'object' &&
          typeof obs.trap?.farm === 'object' &&
          typeof obs.trap.farm?.pestType === 'object'
            ? obs.trap.farm.pestType.name
            : 'insects'

        const daysLabel = obs.daysSincePrevious !== null
          ? obs.daysSincePrevious === 1
            ? '1 day'
            : `${obs.daysSincePrevious.toFixed(0)} days`
          : null

        const rateLabel = obs.rate !== null ? `${obs.rate.toFixed(1)}/day` : null

        return (
          <div
            key={obs.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-16">{date}</span>

              {obs.isBaseline ? (
                <span className="text-sm text-gray-400">Trap set up</span>
              ) : (
                <span className="text-sm text-gray-900">
                  {obs.count} {pestTypeName} caught{daysLabel ? ` over ${daysLabel}` : ''}
                </span>
              )}

              {trapName && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {trapName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {rateLabel && (
                <span className="text-sm font-medium text-gray-700">{rateLabel}</span>
              )}
              <RateSeverityDot rate={obs.rate} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
