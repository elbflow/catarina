'use client'

import { logout } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
      // Still redirect on error
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="btn-secondary text-sm"
    >
      {loading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}
