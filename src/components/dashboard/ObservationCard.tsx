'use client'

import type { ObservationWithRelations } from '@/lib/payload-client'

interface ObservationCardProps {
  observation: ObservationWithRelations
}

export function ObservationCard({ observation }: ObservationCardProps) {
  const date = new Date(observation.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{date}</span>
        <span className="text-2xl font-bold text-blue-600">{observation.count}</span>
      </div>
      <div className="text-xs text-gray-500">
        {typeof observation.farm === 'object' && observation.farm?.name} •{' '}
        {typeof observation.pestType === 'object' && observation.pestType?.name}
      </div>
      {observation.notes && (
        <p className="text-sm text-gray-600 mt-2">{observation.notes}</p>
      )}
    </div>
  )
}
