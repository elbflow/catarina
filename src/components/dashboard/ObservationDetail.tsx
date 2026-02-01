'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateObservation, deleteObservation } from '@/lib/api-client'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import type { ObservationWithRelations } from '@/lib/payload-client'
import type { Farm, PestType, Trap } from '@/payload-types'

interface TrapWithFarm extends Trap {
  farm: Farm & { pestType: PestType }
}

interface ObservationDetailProps {
  observation: ObservationWithRelations
  traps: TrapWithFarm[]
  onUpdate?: () => void
}

export function ObservationDetail({
  observation,
  traps,
  onUpdate,
}: ObservationDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    date: observation.date ? new Date(observation.date).toISOString().split('T')[0] : '',
    count: String(observation.count ?? 0),
    trap: String(observation.trap && typeof observation.trap === 'object' ? observation.trap.id : observation.trap),
    notes: observation.notes || '',
    isBaseline: observation.isBaseline ?? false,
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get farm ID from selected trap
      const selectedTrap = traps.find((t) => String(t.id) === formData.trap)
      const farmId = selectedTrap?.farm
        ? typeof selectedTrap.farm === 'object'
          ? String(selectedTrap.farm.id)
          : String(selectedTrap.farm)
        : null

      // Get current farm ID if trap hasn't changed
      const currentTrapId = typeof observation.trap === 'object' ? observation.trap.id : observation.trap
      const currentFarmId = typeof observation.trap === 'object' && typeof observation.trap.farm === 'object'
        ? String(observation.trap.farm.id)
        : typeof observation.trap === 'object' && typeof observation.trap.farm === 'number'
          ? String(observation.trap.farm)
          : null

      await updateObservation(Number(observation.id), {
        date: formData.date,
        count: parseInt(formData.count, 10),
        trap: formData.trap,
        farm: farmId || currentFarmId || undefined,
        notes: formData.notes || undefined,
        isBaseline: formData.isBaseline,
      })

      setIsEditing(false)
      if (onUpdate) {
        onUpdate()
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update observation')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await deleteObservation(Number(observation.id))
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete observation')
      setShowDeleteModal(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    // Reset form data to original values
    setFormData({
      date: observation.date ? new Date(observation.date).toISOString().split('T')[0] : '',
      count: String(observation.count ?? 0),
      trap: String(observation.trap && typeof observation.trap === 'object' ? observation.trap.id : observation.trap),
      notes: observation.notes || '',
      isBaseline: observation.isBaseline ?? false,
    })
  }

  // Format date for display
  const displayDate = observation.date
    ? new Date(observation.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date'

  const trapName = typeof observation.trap === 'object' ? observation.trap?.name : 'Unknown Trap'
  const farmName =
    typeof observation.trap === 'object' && typeof observation.trap?.farm === 'object'
      ? observation.trap.farm?.name
      : 'Unknown Farm'

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
  const hasMultipleFarms = farmNames.length > 1

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Observation Details</h1>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="btn-secondary text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
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
                {hasMultipleFarms ? (
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
                  traps.map((trap) => (
                    <option key={String(trap.id)} value={String(trap.id)}>
                      {trap.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="isBaseline" className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBaseline"
                  checked={formData.isBaseline}
                  onChange={(e) => setFormData({ ...formData, isBaseline: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="label">Trap Setup (Baseline)</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Marks when the trap was set up or reset (count should be 0)
              </p>
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

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel} disabled={loading} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                <p className="text-lg text-gray-900">{displayDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Count</h3>
                <p className="text-lg text-gray-900">{observation.count}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Trap</h3>
                <p className="text-lg text-gray-900">{trapName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Farm</h3>
                <p className="text-lg text-gray-900">{farmName}</p>
              </div>
              {observation.isBaseline && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <p className="text-lg text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Trap Setup
                    </span>
                  </p>
                </div>
              )}
            </div>

            {observation.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{observation.notes}</p>
              </div>
            )}

            {observation.photo && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
                {typeof observation.photo === 'object' && observation.photo.url ? (
                  <img
                    src={observation.photo.url}
                    alt="Observation photo"
                    className="rounded-lg max-w-md"
                  />
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={loading}
      />
    </>
  )
}
