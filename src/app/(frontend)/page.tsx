import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { LandingNav } from '@/components/landing/LandingNav'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { getAuthHeaders } from '@/lib/auth-helpers'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Catarina - Sustainable Pest Control, Timed Perfectly',
  description: 'Turn scattered field observations into confident, timely decisions for sustainable farming.',
}

export default async function LandingPage() {
  // Check if user is authenticated - if so, redirect to dashboard
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getAuthHeaders() })

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-grow">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
