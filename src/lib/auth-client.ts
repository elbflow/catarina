const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important for cookies
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Login failed')
  }

  return res.json()
}

export async function signup(data: {
  email: string
  password: string
  name?: string
}) {
  // First create the user
  const createRes = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      role: 'farmer', // Always farmer for self-signup
    }),
    credentials: 'include',
  })

  if (!createRes.ok) {
    const error = await createRes.json()
    throw new Error(error.message || 'Signup failed')
  }

  // Then automatically log them in
  const loginRes = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
    credentials: 'include',
  })

  if (!loginRes.ok) {
    const error = await loginRes.json()
    throw new Error(error.message || 'Auto-login failed after signup')
  }

  return loginRes.json()
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/users/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Logout failed')
  }

  return res.json()
}

export async function createFarm(data: {
  name: string
  pestType: number
  location?: string
  coop?: number
}) {
  const res = await fetch(`${API_URL}/api/farms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to create farm')
  }

  return res.json()
}
