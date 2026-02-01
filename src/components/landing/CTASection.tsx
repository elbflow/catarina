import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
          Ready to protect your harvest?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Start monitoring today and never miss the intervention window again.
        </p>
        <Link href="/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 inline-block mb-3 sm:mb-4">
          Start Monitoring Today
        </Link>
        <p className="text-sm text-gray-500">
          Free to try. No credit card required.
        </p>
      </div>
    </section>
  )
}
