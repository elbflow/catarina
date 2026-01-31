// Client-side API client (for use in Client Components)
// Uses fetch to call Payload REST API

export interface CreateObservationData {
  date: string
  count: number
  trap: string
  notes?: string
}

export async function createObservation(data: CreateObservationData) {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const payload = {
    date: data.date,
    count: data.count,
    trap: parseInt(data.trap, 10),
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

export interface CreateTrapData {
  name: string
  farm: string
}

export async function createTrap(data: CreateTrapData) {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const payload = {
    name: data.name,
    farm: parseInt(data.farm, 10),
    isActive: true,
  }

  const response = await fetch(`${apiUrl}/api/traps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create trap' }))
    throw new Error(error.message || 'Failed to create trap')
  }

  return response.json()
}
