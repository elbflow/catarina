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

  const trapName = typeof observation.trap === 'object' ? observation.trap?.name : ''
  const farmName =
    typeof observation.trap === 'object' && typeof observation.trap?.farm === 'object'
      ? observation.trap.farm?.name
      : ''

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{date}</span>
        <span className="text-xl font-semibold text-blue-600">{observation.count}</span>
      </div>
      <div className="text-xs text-gray-500">
        {trapName} · {farmName}
      </div>
      {observation.notes && (
        <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">{observation.notes}</p>
      )}
    </div>
  )
}
