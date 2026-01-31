'use client'

import { createFarm } from '@/lib/auth-client'
import type { PestType } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface OnboardingFormProps {
  pestTypes: PestType[]
}

export function OnboardingForm({ pestTypes }: OnboardingFormProps) {
  const _router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    crop: 'apple' as 'apple' | 'pecan' | 'grape' | 'berry',
    pestType: '',
    location: '',
  })

  // Filter pest types by selected crop
  const filteredPestTypes = pestTypes.filter(
    (pt) => pt.crop === formData.crop
  )

  // Auto-select first pest type when crop changes
  const handleCropChange = (crop: 'apple' | 'pecan' | 'grape' | 'berry') => {
    setFormData({ ...formData, crop, pestType: '' })
    const firstMatching = pestTypes.find((pt) => pt.crop === crop)
    if (firstMatching) {
      setFormData({ ...formData, crop, pestType: String(firstMatching.id) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.pestType) {
      setError('Please select a pest type')
      setLoading(false)
      return
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingForm.tsx:49',message:'Before createFarm call',data:{formData},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const result = await createFarm({
        name: formData.name,
        pestType: parseInt(formData.pestType, 10),
        location: formData.location || undefined,
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingForm.tsx:57',message:'After createFarm call',data:{result},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Wait a bit for the hook to complete, then refresh and redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingForm.tsx:63',message:'Before redirect',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Force a hard refresh to get updated user session
      window.location.href = '/'
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingForm.tsx:69',message:'createFarm error',data:{error:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setError(err instanceof Error ? err.message : 'Failed to create farm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="label">
          Farm Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="My Apple Orchard"
        />
      </div>

      <div>
        <label className="label">What crop do you grow? *</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(['apple', 'pecan', 'grape', 'berry'] as const).map((crop) => (
            <label
              key={crop}
              className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.crop === crop
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="crop"
                value={crop}
                checked={formData.crop === crop}
                onChange={() => handleCropChange(crop)}
                className="sr-only"
              />
              <span className="capitalize font-medium">{crop}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="pestType" className="label">
          Primary Pest * <span className="text-gray-400 font-normal">(based on crop selection)</span>
        </label>
        <select
          id="pestType"
          required
          value={formData.pestType}
          onChange={(e) => setFormData({ ...formData, pestType: e.target.value })}
          className="input"
        >
          <option value="">Select a pest type</option>
          {filteredPestTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name} (threshold: {pt.rateThreshold}/day)
            </option>
          ))}
        </select>
        {filteredPestTypes.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            No pest types found for {formData.crop}. Please contact an admin to add one.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="label">
          Location <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="input"
          placeholder="North Valley"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button type="submit" disabled={loading || !formData.pestType} className="btn-primary w-full">
          {loading ? 'Creating farm...' : 'Create Farm & Start'}
        </button>
      </div>
    </form>
  )
}
