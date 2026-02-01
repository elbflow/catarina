'use client'

import type { RiskLevel } from '@/lib/risk-calculator'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

export interface CoopMapFarm {
  id: number
  name: string
  lat: number | null
  lng: number | null
  averageRate: number
  riskLevel: RiskLevel
}

interface CoopMapProps {
  farms: CoopMapFarm[]
}

// Risk level colors matching RiskZone component
const riskColors: Record<RiskLevel, string> = {
  safe: '#22c55e',    // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444',  // red-500
}

// Create custom div icons for markers
function createMarkerIcon(riskLevel: RiskLevel): L.DivIcon {
  const color = riskColors[riskLevel]
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

// Component to fit bounds to all markers
function FitBounds({ farms }: { farms: CoopMapFarm[] }) {
  const map = useMap()

  useEffect(() => {
    const validFarms = farms.filter((f) => f.lat !== null && f.lng !== null)
    if (validFarms.length === 0) return

    const bounds = L.latLngBounds(
      validFarms.map((f) => [f.lat!, f.lng!] as [number, number])
    )
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [farms, map])

  return null
}

// Risk badge component for popup
function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    safe: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  }
  const labels: Record<RiskLevel, string> = {
    safe: 'Safe',
    warning: 'Warning',
    danger: 'Danger',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
      {labels[level]}
    </span>
  )
}

export function CoopMap({ farms }: CoopMapProps) {
  // Filter to farms with valid coordinates
  const mappableFarms = farms.filter((f) => f.lat !== null && f.lng !== null)

  if (mappableFarms.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl h-[400px] flex items-center justify-center text-gray-500">
        No farms with location data available
      </div>
    )
  }

  // Calculate center from first farm (FitBounds will adjust)
  const defaultCenter: [number, number] = [mappableFarms[0].lat!, mappableFarms[0].lng!]

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds farms={mappableFarms} />
        {mappableFarms.map((farm) => (
          <Marker
            key={farm.id}
            position={[farm.lat!, farm.lng!]}
            icon={createMarkerIcon(farm.riskLevel)}
          >
            <Popup>
              <div className="min-w-[160px]">
                <div className="font-semibold text-gray-900 mb-1">{farm.name}</div>
                <div className="text-sm text-gray-600 mb-2">
                  Rate: {farm.averageRate.toFixed(1)} moths/day
                </div>
                <RiskBadge level={farm.riskLevel} />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
