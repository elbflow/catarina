import { Footer } from '@/components/landing/Footer'
import { LandingNav } from '@/components/landing/LandingNav'
import Link from 'next/link'

export const metadata = {
  title: 'About - Catarina',
  description: 'Why we built Catarina and our mission to help growers catch the narrow intervention window.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-grow">
        {/* Hero */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Why We Built Catarina
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              We help growers stop missing the narrow windows where sustainable pest control actually works.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
              The Problem
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
              <p>
                Food production is becoming more sustainable, but <strong className="text-gray-900">timing is everything</strong>. Small and medium growers who want to use biological pest control often fail—not because they don&apos;t care, but because they miss the short intervention window.
              </p>
              <p>
                When that happens, growers face an impossible choice: lose most of their crop or fall back to pesticides. Either way, they lose—organic certification, revenue, and trust.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
                <p className="text-gray-800 font-medium mb-2">
                  The consequences are real:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Miss the window, and larvae enter the fruit—making control nearly impossible</li>
                  <li>Fall back to pesticides, and you risk losing organic certification</li>
                  <li>Lose certification, and you lose premium pricing and customer trust</li>
                </ul>
              </div>
              <p>
                Existing solutions—spreadsheets, extension emails, trap vendors—don&apos;t fully solve the timing problem. They provide data, but not clarity. They show counts, but not risk windows. They require growers to become pest-modeling experts just to know when to act.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
              Our Mission
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
              <p>
                We believe sustainable agriculture is possible—when growers have the right information at the right time. Our mission is to turn scattered field observations into confident, timely decisions.
              </p>
              <p>
                Catarina helps growers understand what&apos;s happening in their fields and what&apos;s likely coming next, so they can plan the right action at the right time. By turning simple field observations and local conditions into clear risk signals and reminders, we help farmers coordinate, act earlier, and stay sustainable—without requiring them to become pest-modeling experts.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8">
                <p className="text-gray-800 font-medium mb-2">
                  The broader impact:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>More growers can maintain organic certification</li>
                  <li>Reduced pesticide use protects soil health and biodiversity</li>
                  <li>Better crop yields mean more sustainable livelihoods</li>
                  <li>Consumer trust grows when transparency meets results</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Catarina Helps */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
              How Catarina Helps
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
              <p>
                Catarina is an IPM (Integrated Pest Management) Scout-to-Action tool that converts trap counts into risk signals with threshold-based warnings. Here&apos;s how it works:
              </p>
              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Simple Observation</h3>
                  <p className="text-gray-600 text-sm">
                    Record trap catches quickly from the field. No complex forms, no expert knowledge required.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Clear Risk Signals</h3>
                  <p className="text-gray-600 text-sm">
                    See trends, thresholds, and risk zones at a glance. Know where you are in the season.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Timely Reminders</h3>
                  <p className="text-gray-600 text-sm">
                    Get alerts when risk windows are approaching. Never miss the intervention window.
                  </p>
                </div>
                <div className="card p-6">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Planning Support</h3>
                  <p className="text-gray-600 text-sm">
                    Coordinate supplies, labor, and actions. Plan ahead, not react in crisis.
                  </p>
                </div>
              </div>
              <p>
                We&apos;re not prescribing actions—we&apos;re supporting planning and prioritization. Growers make the decisions; Catarina provides the clarity.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
              Ready to try it?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Start monitoring today and see how Catarina can help you catch the intervention window every time.
            </p>
            <Link href="/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 inline-block">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
