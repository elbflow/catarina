'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      await fetch('/api/users/logout', { method: 'POST' })
      router.push('/login')
    }
    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Logging out...</div>
    </div>
  )
}
