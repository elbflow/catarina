'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ViewToggleProps {
  coopName: string
  farmName: string
  selectedView: 'farm' | 'coop'
}

export function ViewToggle({ coopName, farmName: _farmName, selectedView }: ViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleViewChange = (view: 'farm' | 'coop') => {
    const params = new URLSearchParams(searchParams.toString())
    if (view === 'farm') {
      params.delete('view')
    } else {
      params.set('view', view)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">View:</span>
      <div className="inline-flex bg-gray-100 rounded-lg p-1 border border-gray-200">
        <button
          onClick={() => handleViewChange('farm')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            selectedView === 'farm'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Farm
        </button>
        <button
          onClick={() => handleViewChange('coop')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            selectedView === 'coop'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Co-Op
        </button>
      </div>
      {selectedView === 'coop' && (
        <span className="text-sm text-gray-500">({coopName})</span>
      )}
    </div>
  )
}
