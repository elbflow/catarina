'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ObservationWithRelationsAndRate } from '@/lib/payload-client'
import { ObservationList } from './ObservationList'

interface PaginatedObservationListProps {
  observations: ObservationWithRelationsAndRate[]
  currentPage: number
  pageSize: number
  totalObservations: number
  totalPages: number
  selectedTrapId: number | null
}

export function PaginatedObservationList({
  observations,
  currentPage,
  pageSize,
  totalObservations,
  totalPages,
  selectedTrapId,
}: PaginatedObservationListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateUrl = (newPage: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Preserve trap param if it exists
    if (selectedTrapId !== null) {
      params.set('trap', String(selectedTrapId))
    } else {
      params.delete('trap')
    }
    
    // Update pagination params
    if (newPage > 1) {
      params.set('page', String(newPage))
    } else {
      params.delete('page')
    }
    
    if (newPageSize !== 10) {
      params.set('pageSize', String(newPageSize))
    } else {
      params.delete('pageSize')
    }
    
    // Reset to page 1 if changing page size
    if (newPageSize !== pageSize && newPage === currentPage) {
      params.delete('page')
    }
    
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const handlePageChange = (newPage: number) => {
    updateUrl(newPage, pageSize)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrl(1, newPageSize)
  }

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalObservations)

  if (totalObservations === 0) {
    return null
  }

  return (
    <div>
      <ObservationList observations={observations} />
      
      {/* Pagination Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
        {/* Page Info */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startIndex}</span>-
          <span className="font-medium">{endIndex}</span> of{' '}
          <span className="font-medium">{totalObservations}</span> observations
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">
              Show:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
