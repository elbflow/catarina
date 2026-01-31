// Client-side API client (for use in Client Components)
// Uses fetch to call Payload REST API

const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'

export interface CreateObservationData {
  date: string
  count: number
  farm: string
  pestType: string
  notes?: string
}

export async function createObservation(data: CreateObservationData) {
  const response = await fetch(`${API_URL}/api/pest-observations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create observation' }))
    throw new Error(error.message || 'Failed to create observation')
  }

  return response.json()
}
