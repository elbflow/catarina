export function RiskLegend() {
  return (
    <div className="flex items-center gap-4 justify-center flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-gray-600">Safe</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <span className="text-sm text-gray-600">Warning</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm text-gray-600">Danger</span>
      </div>
    </div>
  )
}
