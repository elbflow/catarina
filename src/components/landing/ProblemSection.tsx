export function ProblemSection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-gray-900">
          The timing challenge growers face
        </h2>
        <p className="text-base sm:text-lg text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
          Timing is everything in pest control. Miss the window, and the consequences are real.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-8 border-2 border-red-100 bg-red-50/30">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Miss the window, lose the crop</h3>
            <p className="text-gray-600">
              When pest activity spikes, you have a narrow window to act. Miss it, and larvae enter the fruit—making control nearly impossible.
            </p>
          </div>
          
          <div className="card p-8 border-2 border-amber-100 bg-amber-50/30">
            <div className="text-4xl mb-4">💔</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Or fall back to pesticides</h3>
            <p className="text-gray-600">
              When biological control fails, growers face a tough choice: lose the crop or use pesticides—risking organic certification, revenue, and trust.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700 font-medium">
            Growers who want to use biological pest control often fail—not because they don&apos;t care, but because they <span className="text-red-600 font-semibold">miss the short intervention window</span>.
          </p>
        </div>
      </div>
    </section>
  )
}
