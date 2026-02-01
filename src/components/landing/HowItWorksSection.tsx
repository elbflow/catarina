export function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">
          How It Works
        </h2>
        <p className="text-base sm:text-lg text-gray-600 text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
          Three simple steps from observation to action
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting arrows - hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gray-300 transform -translate-y-1/2 z-0" />
          <div className="hidden md:block absolute top-1/2 left-2/3 right-1/3 h-0.5 bg-gray-300 transform -translate-y-1/2 z-0" />
          
          {/* Step 1 */}
          <div className="relative z-10 card p-8 text-center bg-white">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-green-600 mb-2">STEP 1</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Observe</h3>
            <p className="text-gray-600">
              Record trap catches quickly from the field. Simple, fast, and designed for real-world use.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="relative z-10 card p-8 text-center bg-white">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-blue-600 mb-2">STEP 2</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Understand</h3>
            <p className="text-gray-600">
              See trends, thresholds, and risk zones clearly. Know where you are in the season at a glance.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="relative z-10 card p-8 text-center bg-white">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-amber-600 mb-2">STEP 3</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Act</h3>
            <p className="text-gray-600">
              Know when to prepare and when to intervene. Make confident decisions, not guesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
