import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Section Eyebrow */}
        <div className="mb-3">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Get Started
          </span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6 text-white">
          Ready to protect your harvest?
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
          Start monitoring today and never miss the intervention window again.
        </p>
        <Link 
          href="/signup" 
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg sm:text-xl px-10 sm:px-12 py-4 sm:py-5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-block mb-4 sm:mb-5"
        >
          Start Monitoring Today
        </Link>
        <p className="text-sm sm:text-base text-gray-400">
          Free to try. No credit card required.
        </p>
      </div>
    </section>
  )
}
