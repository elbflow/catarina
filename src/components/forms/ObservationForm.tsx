'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createObservation } from '@/lib/api-client'
import type { Farm, PestType, Trap } from '@/payload-types'

interface TrapWithFarm extends Trap {
  farm: Farm & { pestType: PestType }
}

interface LastObservationInfo {
  date: string
  daysSince: number
}

interface ObservationFormProps {
  traps: TrapWithFarm[]
  defaultTrapId?: string
  lastObservation?: LastObservationInfo | null
}

export function ObservationForm({
  traps,
  defaultTrapId,
  lastObservation,
}: ObservationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    count: '',
    trap: defaultTrapId || '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createObservation({
        date: formData.date,
        count: parseInt(formData.count, 10),
        trap: formData.trap,
        notes: formData.notes || undefined,
      })

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create observation')
    } finally {
      setLoading(false)
    }
  }

  const formatLastObservationDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Group traps by farm for display
  const trapsByFarm = traps.reduce((acc, trap) => {
    const farmName = typeof trap.farm === 'object' ? trap.farm.name : 'Unknown Farm'
    if (!acc[farmName]) {
      acc[farmName] = []
    }
    acc[farmName].push(trap)
    return acc
  }, {} as Record<string, TrapWithFarm[]>)

  const farmNames = Object.keys(trapsByFarm)
  const hasMutlipleFarms = farmNames.length > 1

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="date" className="label">
          Observation Date
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="count" className="label">
          New Insects Since Last Check
        </label>
        <input
          type="number"
          id="count"
          required
          min="0"
          value={formData.count}
          onChange={(e) => setFormData({ ...formData, count: e.target.value })}
          className="input"
          placeholder="How many additional insects?"
        />
        <p className="text-sm text-gray-500 mt-1">
          Count only the new insects caught since your last observation.
        </p>
        {lastObservation && (
          <p className="text-sm text-blue-600 mt-1">
            Last checked: {formatLastObservationDate(lastObservation.date)} ({lastObservation.daysSince} days ago)
          </p>
        )}
      </div>

      <div>
        <label htmlFor="trap" className="label">
          Trap
        </label>
        <select
          id="trap"
          required
          value={formData.trap}
          onChange={(e) => setFormData({ ...formData, trap: e.target.value })}
          className="input"
        >
          <option value="">Select a trap</option>
          {hasMutlipleFarms ? (
            // Group by farm when multiple farms exist
            farmNames.map((farmName) => (
              <optgroup key={farmName} label={farmName}>
                {trapsByFarm[farmName].map((trap) => (
                  <option key={String(trap.id)} value={String(trap.id)}>
                    {trap.name}
                  </option>
                ))}
              </optgroup>
            ))
          ) : (
            // Flat list when single farm
            traps.map((trap) => (
              <option key={String(trap.id)} value={String(trap.id)}>
                {trap.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Notes <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input"
          placeholder="Additional observations or notes..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : 'Save Observation'}
        </button>
        <button type="button" onClick={() => router.push('/')} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
