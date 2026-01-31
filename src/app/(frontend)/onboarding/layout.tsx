// Separate layout for onboarding that doesn't redirect
import { AppShell } from '@/components/layout/AppShell'
import { getAuthHeaders } from '@/lib/auth-helpers'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getAuthHeaders() })

  // Not logged in → redirect to login
  if (!user) {
    redirect('/login')
  }

  // Onboarding layout - no redirect check, let the page handle it
  return <AppShell user={user}>{children}</AppShell>
}
