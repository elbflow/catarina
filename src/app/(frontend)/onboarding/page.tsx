import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { getAuthHeaders } from '@/lib/auth-helpers'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function OnboardingPage() {
  const payload = await getPayload({ config })
  const { user: authUser } = await payload.auth({ headers: await getAuthHeaders() })

  // Only farmers should see this
  if (!authUser || authUser.role !== 'farmer') {
    redirect('/')
  }

  // Fetch fresh user data to check for farms (in case farm was just created)
  const freshUser = await payload.findByID({
    collection: 'users',
    id: authUser.id,
    depth: 1, // Populate tenants
    overrideAccess: true,
  })

  // Already has farms? Go to dashboard
  if (freshUser.tenants && freshUser.tenants.length > 0) {
    redirect('/')
  }

  // Get pest types for dropdown
  const pestTypes = await payload.find({
    collection: 'pest-types',
    limit: 100,
    user: freshUser,
    overrideAccess: false,
  })

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🐞</div>
          <h1 className="text-2xl font-semibold mb-2">Welcome to Catarina</h1>
          <p className="text-gray-600">Let's set up your first farm to start tracking pests.</p>
        </div>
        <OnboardingForm pestTypes={pestTypes.docs} />
      </div>
    </main>
  )
}
