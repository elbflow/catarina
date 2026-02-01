import { AppShell } from '@/components/layout/AppShell'
import { ChatProvider } from '@/components/chat'
import { getAuthHeaders } from '@/lib/auth-helpers'
import type { Farm, PestType } from '@/payload-types'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config })
  const { user: authUser } = await payload.auth({ headers: await getAuthHeaders() })

  // Not logged in or invalid user → redirect to login
  if (!authUser?.id) {
    redirect('/login')
  }

  // SuperAdmin → skip onboarding check
  if (authUser.isSuperAdmin) {
    return <AppShell user={authUser}>{children}</AppShell>
  }

  // Extra safety check for race conditions
  if (!authUser.id) {
    redirect('/login')
  }

  // Fetch fresh user data from DB to get latest tenants (in case farm was just created)
  let freshUser
  try {
    freshUser = await payload.findByID({
      collection: 'users',
      id: authUser.id,
      depth: 1, // Populate tenants
      overrideAccess: true, // We already authenticated above
    })
  } catch (error) {
    console.error('Error fetching fresh user data:', error)
    // Fall back to authUser if findByID fails
    freshUser = authUser
  }

  // Check if user has farms (using fresh data)
  const hasFarms = freshUser.tenants && freshUser.tenants.length > 0

  // Farmer without farms → redirect to onboarding
  // Note: Onboarding has its own layout that doesn't do this redirect
  if (!hasFarms && freshUser.role === 'farmer') {
    redirect('/onboarding')
  }

  // Get first farm for header display and chat context
  const firstTenant = freshUser.tenants?.[0]
  const farmFromTenant = typeof firstTenant?.tenant === 'object' ? firstTenant.tenant : null
  const farmId = farmFromTenant?.id ?? (typeof firstTenant?.tenant === 'number' ? firstTenant.tenant : undefined)

  // Fetch farm with pestType populated for AppShell header
  let farm: (Farm & { pestType: PestType }) | undefined = undefined
  if (farmId) {
    try {
      farm = await payload.findByID({
        collection: 'farms',
        id: farmId,
        depth: 1, // Populate pestType
        overrideAccess: true,
      }) as Farm & { pestType: PestType }
    } catch (error) {
      console.error('Error fetching farm:', error)
    }
  }

  // Fetch traps for the user's farm (for AI Scout chat)
  // Using overrideAccess since we already authenticated and filter by user's farmId
  let trapsForChat: Array<{ id: number; name: string }> = []
  if (farmId) {
    const trapsResult = await payload.find({
      collection: 'traps',
      where: {
        farm: { equals: farmId },
        isActive: { equals: true },
      },
      limit: 100,
      overrideAccess: true,
    })
    trapsForChat = trapsResult.docs.map((trap) => ({
      id: trap.id,
      name: trap.name,
    }))
  }

  return (
    <ChatProvider farmId={farmId || 0} traps={trapsForChat}>
      <AppShell user={freshUser} farm={farm}>{children}</AppShell>
    </ChatProvider>
  )
}
