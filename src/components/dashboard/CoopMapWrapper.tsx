'use client'

import dynamic from 'next/dynamic'
import type { CoopMapFarm } from './CoopMap'

// Dynamic import for map (no SSR - Leaflet requires window)
const CoopMap = dynamic(
  () => import('@/components/dashboard/CoopMap').then((mod) => mod.CoopMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-xl h-[400px] flex items-center justify-center text-gray-500 animate-pulse">
        Loading map...
      </div>
    ),
  }
)

interface CoopMapWrapperProps {
  farms: CoopMapFarm[]
}

export function CoopMapWrapper({ farms }: CoopMapWrapperProps) {
  return <CoopMap farms={farms} />
}
