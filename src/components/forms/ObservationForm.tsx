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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Observation Date
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
          Trap Count
        </label>
        <input
          type="number"
          id="count"
          required
          min="0"
          value={formData.count}
          onChange={(e) => setFormData({ ...formData, count: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Number of pests caught"
        />
      </div>

      <div>
        <label htmlFor="farm" className="block text-sm font-medium text-gray-700 mb-1">
          Farm
        </label>
        <select
          id="farm"
          required
          value={formData.farm}
          onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a farm</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pestType" className="block text-sm font-medium text-gray-700 mb-1">
          Pest Type
        </label>
        <select
          id="pestType"
          required
          value={formData.pestType}
          onChange={(e) => setFormData({ ...formData, pestType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a pest type</option>
          {pestTypes.map((pest) => (
            <option key={pest.id} value={pest.id}>
              {pest.name} (Threshold: {pest.threshold})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional observations or notes..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Observation'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
