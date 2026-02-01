export function HeroMockPreview() {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-200 max-w-sm w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">🐞</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Catarina</div>
            <div className="text-xs text-gray-500">Apple Orchard</div>
          </div>
        </div>
        <div className="px-2 py-1 bg-green-50 rounded text-xs font-medium text-green-700">
          Safe
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">3-day average rate</div>
        <div className="h-24 bg-gray-50 rounded-lg p-3 relative">
          {/* Simple line chart with gradient */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Gradient definition: green → amber → red */}
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" /> {/* Green - Safe */}
                <stop offset="50%" stopColor="#f59e0b" /> {/* Amber - Warning */}
                <stop offset="100%" stopColor="#ef4444" /> {/* Red - Danger */}
              </linearGradient>
            </defs>
            <polyline
              points="0,80 15,60 30,70 45,50 60,60 75,40 90,50 100,45"
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points with gradient colors */}
            {[
              { x: 0, y: 80, color: '#10b981' }, // Green
              { x: 15, y: 60, color: '#10b981' }, // Green
              { x: 30, y: 70, color: '#10b981' }, // Green
              { x: 45, y: 50, color: '#f59e0b' }, // Amber
              { x: 60, y: 60, color: '#f59e0b' }, // Amber
              { x: 75, y: 40, color: '#ef4444' }, // Red
              { x: 90, y: 50, color: '#ef4444' }, // Red
              { x: 100, y: 45, color: '#ef4444' }, // Red
            ].map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="2"
                fill={point.color}
              />
            ))}
          </svg>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>0.3 /day</span>
          <span className="text-green-600 font-medium">Below threshold</span>
        </div>
      </div>

      {/* Risk Zones Legend */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Safe</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">Warning</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">Danger</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors">
        + Add Observation
      </button>
    </div>
  )
}
