'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createTrap } from '@/lib/api-client'
import { RateSeverityDot } from './RateSeverityDot'

interface TrapInfo {
  id: number
  name: string
  isActive: boolean
  rate: number | null
  observationCount: number
  lastObservationDate: string | null
}

interface TrapSelectorProps {
  farmId: string
  traps: TrapInfo[]
  selectedTrapId: number | null
}

export function TrapSelector({
  farmId,
  traps,
  selectedTrapId,
}: TrapSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newTrapName, setNewTrapName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const selectedTrap = selectedTrapId
    ? traps.find((t) => t.id === selectedTrapId)
    : null

  const buttonLabel = selectedTrap ? selectedTrap.name : 'All Traps'

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (trapId: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (trapId === null) {
      params.delete('trap')
    } else {
      params.set('trap', String(trapId))
    }
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const handleAddTrap = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTrapName.trim()) return

    setLoading(true)
    setError(null)

    try {
      await createTrap({
        name: newTrapName.trim(),
        farm: farmId,
      })

      setNewTrapName('')
      setIsAdding(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {selectedTrap && (
          <RateSeverityDot rate={selectedTrap.rate} />
        )}
        <span>{buttonLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2">
            {/* All Traps Option */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedTrapId === null
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">All Traps</span>
              {selectedTrapId === null && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Divider */}
            {traps.length > 0 && <div className="my-2 border-t border-gray-100" />}

            {/* Trap List */}
            <div className="space-y-1">
              {traps.map((trap) => (
                <button
                  key={trap.id}
                  onClick={() => handleSelect(trap.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedTrapId === trap.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RateSeverityDot rate={trap.rate} />
                    <span className={trap.isActive ? '' : 'text-gray-400'}>
                      {trap.name}
                    </span>
                    {!trap.isActive && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {trap.rate !== null && (
                      <span className="text-xs text-gray-500">
                        {trap.rate.toFixed(1)}/day
                      </span>
                    )}
                    {selectedTrapId === trap.id && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Add Trap Section */}
            {isAdding ? (
              <form onSubmit={handleAddTrap} className="px-2 py-1">
                <input
                  type="text"
                  value={newTrapName}
                  onChange={(e) => setNewTrapName(e.target.value)}
                  placeholder="Trap name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  disabled={loading}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={loading || !newTrapName.trim()}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false)
                      setNewTrapName('')
                      setError(null)
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
                {error && (
                  <div className="mt-2 text-xs text-red-600">{error}</div>
                )}
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Trap
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
