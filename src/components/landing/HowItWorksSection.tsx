export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Decorative blur blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Eyebrow */}
        <div className="text-center mb-3">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Simple Process
          </span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-5 sm:mb-6 text-white">
          How It Works
        </h2>
        <p className="text-lg sm:text-xl text-gray-300 text-center mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
          Three simple steps from observation to action
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connecting arrows - hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-amber-400 transform -translate-y-1/2 z-0 opacity-50" />
          <div className="hidden md:block absolute top-1/2 left-2/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-400 via-amber-400 to-amber-400 transform -translate-y-1/2 z-0 opacity-50" />
          
          {/* Step 1 */}
          <div className="relative z-10 bg-slate-700/50 backdrop-blur-sm p-8 text-center rounded-xl border border-slate-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center shadow-md border border-green-500/30">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-green-400 mb-2 uppercase tracking-wide">STEP 1</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Observe</h3>
            <p className="text-gray-300 leading-relaxed">
              Record trap catches quickly from the field. Simple, fast, and designed for real-world use.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="relative z-10 bg-slate-700/50 backdrop-blur-sm p-8 text-center rounded-xl border border-slate-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center shadow-md border border-blue-500/30">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">STEP 2</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Understand</h3>
            <p className="text-gray-300 leading-relaxed">
              See trends, thresholds, and risk zones clearly. Know where you are in the season at a glance.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="relative z-10 bg-slate-700/50 backdrop-blur-sm p-8 text-center rounded-xl border border-slate-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center shadow-md border border-amber-500/30">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wide">STEP 3</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Act</h3>
            <p className="text-gray-300 leading-relaxed">
              Know when to prepare and when to intervene. Make confident decisions, not guesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
