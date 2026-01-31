'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createObservation } from '@/lib/api-client'
import type { Farm, PestType } from '@/payload-types'

interface ObservationFormProps {
  farms: Farm[]
  pestTypes: PestType[]
  defaultFarmId?: string
  defaultPestTypeId?: string
}

export function ObservationForm({
  farms,
  pestTypes,
  defaultFarmId,
  defaultPestTypeId,
}: ObservationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    count: '',
    farm: defaultFarmId || '',
    pestType: defaultPestTypeId || '',
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
        farm: formData.farm,
        pestType: formData.pestType,
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
          Trap Count
        </label>
        <input
          type="number"
          id="count"
          required
          min="0"
          value={formData.count}
          onChange={(e) => setFormData({ ...formData, count: e.target.value })}
          className="input"
          placeholder="Number of pests caught"
        />
      </div>

      <div>
        <label htmlFor="farm" className="label">
          Farm
        </label>
        <select
          id="farm"
          required
          value={formData.farm}
          onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
          className="input"
        >
          <option value="">Select a farm</option>
          {farms.map((farm) => (
            <option key={String(farm.id)} value={String(farm.id)}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pestType" className="label">
          Pest Type
        </label>
        <select
          id="pestType"
          required
          value={formData.pestType}
          onChange={(e) => setFormData({ ...formData, pestType: e.target.value })}
          className="input"
        >
          <option value="">Select a pest type</option>
          {pestTypes.map((pest) => (
            <option key={String(pest.id)} value={String(pest.id)}>
              {pest.name} (Threshold: {pest.threshold})
            </option>
          ))}
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
