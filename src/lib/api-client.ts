// Client-side API client (for use in Client Components)
// Uses fetch to call Payload REST API

export interface CreateObservationData {
  date: string
  count: number
  farm: string
  pestType: string
  notes?: string
}

export async function createObservation(data: CreateObservationData) {
  // Use current origin to avoid port mismatch issues
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  // Convert string IDs to numbers for PostgreSQL
  const payload = {
    date: data.date,
    count: data.count,
    farm: parseInt(data.farm, 10),
    pestType: parseInt(data.pestType, 10),
    notes: data.notes,
  }

  const response = await fetch(`${apiUrl}/api/pest-observations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create observation' }))
    throw new Error(error.message || 'Failed to create observation')
  }

  return response.json()
}
