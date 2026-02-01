import { RiskLegend } from './RiskLegend'

export function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Eyebrow */}
        <div className="text-center mb-3">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            The Challenge
          </span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-5 sm:mb-6 text-gray-900">
          The timing challenge growers face
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 text-center mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed">
          Timing is everything in pest control. Miss the window, and the consequences are real.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          <div className="card p-8 border-2 border-red-100 bg-red-50/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Miss the window, lose the crop</h3>
            <p className="text-gray-600 leading-relaxed">
              When pest activity spikes, you have a narrow window to act. Miss it, and larvae enter the fruit—making control nearly impossible.
            </p>
          </div>
          
          <div className="card p-8 border-2 border-amber-100 bg-amber-50/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="text-4xl mb-4">💔</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Or fall back to pesticides</h3>
            <p className="text-gray-600 leading-relaxed">
              When biological control fails, growers face a tough choice: lose the crop or use pesticides—risking organic certification, revenue, and trust.
            </p>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed max-w-3xl mx-auto">
            Growers who want to use biological pest control often fail—not because they don&apos;t care, but because they <span className="text-red-600 font-semibold">miss the short intervention window</span>.
          </p>
        </div>
        
        {/* Risk Legend */}
        <div className="pt-6 border-t border-gray-200">
          <RiskLegend />
        </div>
      </div>
    </section>
  )
}
