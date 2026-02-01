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

export async function updateObservation(id: number, data: UpdateObservationData) {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const payload: Record<string, unknown> = {}
  
  if (data.date !== undefined) payload.date = data.date
  if (data.count !== undefined) payload.count = data.count
  if (data.trap !== undefined) payload.trap = parseInt(data.trap, 10)
  if (data.farm !== undefined) payload.tenant = parseInt(data.farm, 10) // Required by multi-tenant plugin
  if (data.notes !== undefined) payload.notes = data.notes
  if (data.isBaseline !== undefined) payload.isBaseline = data.isBaseline

  const response = await fetch(`${apiUrl}/api/pest-observations/${id}`, {
    method: 'PATCH',
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
      'Failed to update observation'
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function deleteObservation(id: number) {
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const response = await fetch(`${apiUrl}/api/pest-observations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include auth cookies
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const errorMessage =
      errorBody.errors?.[0]?.message ||
      errorBody.message ||
      'Failed to delete observation'
    throw new Error(errorMessage)
  }

  return response.json()
}

export interface UpdateObservationData {
  date?: string
  count?: number
  trap?: string
  farm?: string // Tenant ID for multi-tenant plugin (required if trap changes)
  notes?: string
  isBaseline?: boolean
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
