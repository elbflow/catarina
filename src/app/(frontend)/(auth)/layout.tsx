import { getAuthHeaders } from '@/lib/auth-helpers'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // If already logged in, redirect to dashboard
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getAuthHeaders() })

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
