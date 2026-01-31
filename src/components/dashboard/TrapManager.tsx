'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface TrapManagerProps {
  farmId: string
  traps: TrapInfo[]
  rateThreshold: number
}

export function TrapManager({ farmId, traps, rateThreshold }: TrapManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [newTrapName, setNewTrapName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No observations'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Traps</span>
          <span className="text-sm text-gray-500">({traps.length})</span>
        </div>
        <span className="text-gray-400 text-xl">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {traps.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="mb-3">No traps set up yet.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="btn-primary"
              >
                Add First Trap
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {traps.map((trap) => (
                  <div
                    key={trap.id}
                    className="flex items-center justify-between py-3 first:pt-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${trap.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {trap.name}
                      </span>
                      {!trap.isActive && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(trap.lastObservationDate)}
                      </span>
                      {trap.rate !== null && (
                        <span className="text-sm font-medium text-gray-700">
                          {trap.rate.toFixed(1)}/day
                        </span>
                      )}
                      <RateSeverityDot rate={trap.rate} rateThreshold={rateThreshold} />
                    </div>
                  </div>
                ))}
              </div>

              {isAdding ? (
                <form onSubmit={handleAddTrap} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newTrapName}
                    onChange={(e) => setNewTrapName(e.target.value)}
                    placeholder="Trap name"
                    className="input flex-1"
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !newTrapName.trim()}
                    className="btn-primary"
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
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Trap
                </button>
              )}

              {error && (
                <div className="mt-2 text-sm text-red-600">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
