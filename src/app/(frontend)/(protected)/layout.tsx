import { AppShell } from '@/components/layout/AppShell'
import { getAuthHeaders } from '@/lib/auth-helpers'
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected/layout.tsx:auth',message:'Auth check result',data:{hasAuthUser:!!authUser,authUserId:authUser?.id,authUserEmail:authUser?.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
  // #endregion

  // Not logged in or invalid user → redirect to login
  if (!authUser || !authUser.id) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected/layout.tsx:auth',message:'No user - redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    redirect('/login')
  }

  // SuperAdmin → skip onboarding check
  if (authUser.isSuperAdmin) {
    return <AppShell user={authUser}>{children}</AppShell>
  }

  // Fetch fresh user data from DB to get latest tenants (in case farm was just created)
  const freshUser = await payload.findByID({
    collection: 'users',
    id: authUser.id,
    depth: 1, // Populate tenants
    overrideAccess: true, // We already authenticated above
  })

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected/layout.tsx',message:'Fresh user data fetched',data:{userId:freshUser.id,tenants:freshUser.tenants,tenantsLength:freshUser.tenants?.length,role:freshUser.role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // Check if user has farms (using fresh data)
  const hasFarms = freshUser.tenants && freshUser.tenants.length > 0

  // Farmer without farms → redirect to onboarding
  // Note: Onboarding has its own layout that doesn't do this redirect
  if (!hasFarms && freshUser.role === 'farmer') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd7f8df7-23ce-4a4a-b7d5-0d59316965b0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected/layout.tsx',message:'Redirecting to onboarding',data:{hasFarms,role:freshUser.role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    redirect('/onboarding')
  }

  return <AppShell user={freshUser}>{children}</AppShell>
}
