// Client-side API client (for use in Client Components)
// Uses fetch to call Payload REST API

export interface CreateObservationData {
  date: string
  count: number
  trap: string
  farm: string // Tenant ID for multi-tenant plugin
  notes?: string
}

export async function createObservation(data: CreateObservationData) {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const payload = {
    date: data.date,
    count: data.count,
    trap: parseInt(data.trap, 10),
    tenant: parseInt(data.farm, 10), // Required by multi-tenant plugin
    notes: data.notes,
  }

  const response = await fetch(`${apiUrl}/api/pest-observations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include auth cookies
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    // Payload returns { errors: [{ message: "..." }] }
    const errorMessage =
      errorBody.errors?.[0]?.message ||
      errorBody.message ||
      'Failed to create observation'
    throw new Error(errorMessage)
  }

  return response.json()
}

export interface CreateTrapData {
  name: string
  farm: string
}

export async function createTrap(data: CreateTrapData) {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const farmId = parseInt(data.farm, 10)
  const payload = {
    name: data.name,
    farm: farmId,
    tenant: farmId, // Required by multi-tenant plugin
    isActive: true,
  }

  const response = await fetch(`${apiUrl}/api/traps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include auth cookies
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create trap' }))
    throw new Error(error.message || 'Failed to create trap')
  }

  return response.json()
}
