# Co-op Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a geographic map to the Co-op View showing all farms with risk-level colored markers.

**Architecture:** Leaflet map component dynamically imported (SSR disabled), fed by a new server function that fetches co-op farms with calculated risk levels. Map appears between Risk Zone and Trend Chart when in Co-op View.

**Tech Stack:** Leaflet + react-leaflet, OpenStreetMap tiles, Tailwind CSS for marker styling.

---

## Task 1: Add lat/lng Fields to Farms Collection

**Files:**
- Modify: `src/collections/Farms.ts:66-99`

**Step 1: Add lat field after location field**

In `src/collections/Farms.ts`, add after the existing `location` field (around line 99):

```typescript
{
  name: 'lat',
  type: 'number',
  label: 'Latitude',
  admin: {
    description: 'GPS latitude coordinate (e.g., 24.0530)',
    step: 0.0001,
  },
},
{
  name: 'lng',
  type: 'number',
  label: 'Longitude',
  admin: {
    description: 'GPS longitude coordinate (e.g., -104.7785)',
    step: 0.0001,
  },
},
```

**Step 2: Regenerate types**

Run: `pnpm generate:types`
Expected: Success, `src/payload-types.ts` updated with `lat?: number | null` and `lng?: number | null` on Farm type.

**Step 3: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/collections/Farms.ts src/payload-types.ts
git commit -m "$(cat <<'EOF'
feat(farms): add lat/lng coordinate fields

Optional number fields for GPS coordinates to support map visualization.
EOF
)"
```

---

## Task 2: Update Seed Data with Canatlán Coordinates

**Files:**
- Modify: `src/lib/demo-data.ts:221-302`

**Step 1: Update co-op name and region**

Find (around line 223-229):
```typescript
const coop = await payload.create({
  collection: 'coops',
  data: {
    name: 'Yakima Valley Apple Growers',
    region: 'Yakima Valley, Washington',
  },
})
```

Replace with:
```typescript
const coop = await payload.create({
  collection: 'coops',
  data: {
    name: 'Canatlán Growers Co-op',
    region: 'Canatlán, Durango, Mexico',
  },
})
```

**Step 2: Update farm names and add coordinates**

Replace the 5 farm creations (around lines 248-301) with:

```typescript
// Farm 1 - North Orchard
const northOrchardFarm = await payload.create({
  collection: 'farms',
  data: {
    name: 'North Orchard',
    pestType: codlingMoth.id,
    coop: coop.id,
    location: 'Canatlán, Durango',
    lat: 24.0820,
    lng: -104.7650,
  },
})

// Farm 2 - Valley Farm
const valleyFarm = await payload.create({
  collection: 'farms',
  data: {
    name: 'Valley Farm',
    pestType: codlingMoth.id,
    coop: coop.id,
    location: 'Canatlán, Durango',
    lat: 24.0530,
    lng: -104.7785,
  },
})

// Farm 3 - South Grove
const southGroveFarm = await payload.create({
  collection: 'farms',
  data: {
    name: 'South Grove',
    pestType: codlingMoth.id,
    coop: coop.id,
    location: 'Canatlán, Durango',
    lat: 24.0180,
    lng: -104.7890,
  },
})

// Farm 4 - East Orchard
const eastOrchardFarm = await payload.create({
  collection: 'farms',
  data: {
    name: 'East Orchard',
    pestType: codlingMoth.id,
    coop: coop.id,
    location: 'Canatlán, Durango',
    lat: 24.0450,
    lng: -104.7350,
  },
})

// Farm 5 - West Fields
const westFieldsFarm = await payload.create({
  collection: 'farms',
  data: {
    name: 'West Fields',
    pestType: codlingMoth.id,
    coop: coop.id,
    location: 'Canatlán, Durango',
    lat: 24.0600,
    lng: -104.8200,
  },
})
```

**Step 3: Update variable references throughout the file**

Update all references to the old farm variable names:
- `gonzalezFarm` → `northOrchardFarm`
- `mitchellFarm` → `valleyFarm`
- `sunriseFarm` → `southGroveFarm`
- `williamsFarm` → `eastOrchardFarm`
- `parkFarm` → `westFieldsFarm`

Also update trap variable names:
- `gonzalezTraps` → `northOrchardTraps`
- `mitchellTraps` → `valleyFarmTraps`
- `sunriseTraps` → `southGroveTraps`
- `williamsTraps` → `eastOrchardTraps`
- `parkTraps` → `westFieldsTraps`

**Step 4: Update the summary output at the end**

Find the summary console.log (around line 842) and update farm names in the table.

**Step 5: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/lib/demo-data.ts
git commit -m "$(cat <<'EOF'
feat(seed): relocate demo to Canatlán, Durango, Mexico

- Rename co-op to Canatlán Growers Co-op
- Update farm names to generic/neutral style
- Add GPS coordinates for all 5 farms
EOF
)"
```

---

## Task 3: Install Leaflet Dependencies

**Step 1: Install packages**

Run: `pnpm add leaflet react-leaflet`
Expected: Packages added to dependencies

**Step 2: Install type definitions**

Run: `pnpm add -D @types/leaflet`
Expected: Package added to devDependencies

**Step 3: Verify installation**

Run: `pnpm list leaflet react-leaflet @types/leaflet`
Expected: All three packages listed

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
chore: add leaflet and react-leaflet dependencies
EOF
)"
```

---

## Task 4: Add getCoopFarmsWithRisk Server Function

**Files:**
- Modify: `src/lib/payload-client.ts`

**Step 1: Add the type definition**

Add after the existing imports (around line 9):

```typescript
import { calculateAverageRateForLastNDays, calculateRateRisk, type RiskLevel } from './risk-calculator'
```

Note: `calculateAverageRateForLastNDays` is already imported, just add `calculateRateRisk` and `RiskLevel`.

**Step 2: Add the interface for the return type**

Add after the existing interfaces (around line 22):

```typescript
export interface FarmWithRisk {
  id: number
  name: string
  lat: number | null
  lng: number | null
  averageRate: number
  riskLevel: RiskLevel
}
```

**Step 3: Add the function**

Add after `getCoopFarms` function (around line 458):

```typescript
/**
 * Get all farms in a co-op with their calculated risk levels.
 * SECURITY: Verifies user is an active co-op member before returning data.
 */
export async function getCoopFarmsWithRisk(
  coopId: string | number,
  user: User | null,
): Promise<FarmWithRisk[]> {
  // Verify user has permission to access this co-op's data
  const hasAccess = await isUserCoopMember(coopId, user)
  if (!hasAccess) {
    return []
  }

  const payload = await getPayload({ config })

  // Get all farms in the co-op
  const farms = await payload.find({
    collection: 'farms',
    where: { coop: { equals: coopId } },
    depth: 0,
    overrideAccess: true,
  })

  if (farms.docs.length === 0) {
    return []
  }

  const results: FarmWithRisk[] = []

  for (const farm of farms.docs) {
    // Get all traps for this farm
    const traps = await payload.find({
      collection: 'traps',
      where: {
        and: [
          { farm: { equals: farm.id } },
          { isActive: { equals: true } },
        ],
      },
      depth: 0,
      overrideAccess: true,
    })

    let farmAverageRate = 0

    if (traps.docs.length > 0) {
      const trapRates: number[] = []

      for (const trap of traps.docs) {
        // Get observations for this trap
        const observations = await payload.find({
          collection: 'pest-observations',
          where: { trap: { equals: trap.id } },
          depth: 0,
          sort: '-date',
          limit: 100,
          overrideAccess: true,
        })

        if (observations.docs.length > 0) {
          // Calculate rates for this trap's observations
          const obsWithRates = observations.docs.map((obs, index, arr) => {
            if (index === arr.length - 1 || obs.isBaseline) {
              return { ...obs, rate: null, daysSincePrevious: null }
            }
            const prevObs = arr[index + 1] // arr is sorted descending
            const currentDate = new Date(obs.date)
            const prevDate = new Date(prevObs.date)
            const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            const daysSincePrevious = Math.max(daysDiff, 0.5)
            const rate = obs.count / daysSincePrevious
            return { ...obs, rate, daysSincePrevious }
          })

          const trapRate = calculateAverageRateForLastNDays(obsWithRates, 3)
          trapRates.push(trapRate)
        }
      }

      if (trapRates.length > 0) {
        farmAverageRate = trapRates.reduce((sum, r) => sum + r, 0) / trapRates.length
      }
    }

    const risk = calculateRateRisk(farmAverageRate)

    results.push({
      id: farm.id,
      name: farm.name,
      lat: farm.lat ?? null,
      lng: farm.lng ?? null,
      averageRate: farmAverageRate,
      riskLevel: risk.level,
    })
  }

  return results
}
```

**Step 4: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/lib/payload-client.ts
git commit -m "$(cat <<'EOF'
feat(api): add getCoopFarmsWithRisk function

Returns all farms in a co-op with their calculated 3-day average
rate and risk level for map visualization.
EOF
)"
```

---

## Task 5: Create CoopMap Component

**Files:**
- Create: `src/components/dashboard/CoopMap.tsx`

**Step 1: Create the component file**

Create `src/components/dashboard/CoopMap.tsx`:

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/dashboard/CoopMap.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add CoopMap component

Leaflet-based map showing farm locations with risk-colored markers.
Includes popup with farm name, rate, and risk badge.
EOF
)"
```

---

## Task 6: Integrate Map into Dashboard

**Files:**
- Modify: `src/app/(frontend)/(protected)/dashboard/page.tsx`

**Step 1: Add dynamic import at the top of the file**

Add after the existing imports (around line 24):

```typescript
import dynamic from 'next/dynamic'
import { getCoopFarmsWithRisk } from '@/lib/payload-client'

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
```

**Step 2: Fetch co-op farms with risk when in co-op view**

Add after the `coop` variable is set (around line 96), before the trap rates data:

```typescript
// Get farm risk data for map (only in co-op view)
let coopFarmsWithRisk: Awaited<ReturnType<typeof getCoopFarmsWithRisk>> = []
if (selectedView === 'coop' && coopId !== null) {
  coopFarmsWithRisk = await getCoopFarmsWithRisk(coopId, user)
}
```

**Step 3: Add map section in the JSX**

Find the Risk Zone section (around line 219-225) and add the map section after it:

```typescript
{/* Risk Zone */}
<div className="mb-8">
  <RiskZone
    averageRate={averageRate}
    isCoopView={selectedView === 'coop'}
    coopName={coop?.name}
  />
</div>

{/* Co-op Map (only in co-op view) */}
{selectedView === 'coop' && coopFarmsWithRisk.length > 0 && (
  <div className="card mb-8">
    <h2 className="text-lg font-semibold mb-4">
      Farm Locations
      <span className="ml-2 text-sm font-normal text-gray-500">
        ({coopFarmsWithRisk.length} farms)
      </span>
    </h2>
    <CoopMap farms={coopFarmsWithRisk} />
  </div>
)}

{/* Trend Chart */}
```

**Step 4: Verify TypeScript compiles**

Run: `tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/app/(frontend)/(protected)/dashboard/page.tsx
git commit -m "$(cat <<'EOF'
feat(dashboard): integrate co-op map in co-op view

Map appears between Risk Zone and Trend Chart when viewing co-op data.
Shows all farms with risk-colored markers.
EOF
)"
```

---

## Task 7: Manual Testing

**Step 1: Start dev server**

Run: `pnpm dev`
Expected: Server starts without errors

**Step 2: Reseed the database**

In another terminal, run: `pnpm seed`
Expected: Seed completes with new Canatlán data

**Step 3: Log in and test**

1. Open http://localhost:3000
2. Log in as `maria.gonzalez@demo.com` / `demo1234!`
3. Verify dashboard loads in "My Farm" view
4. Click "Co-Op" toggle
5. Verify map appears with 5 colored markers
6. Click a marker - verify popup shows farm name, rate, and risk badge
7. Verify map can be zoomed and panned

**Step 4: Test with different risk levels**

Log in as different users to see farms with different risk levels:
- `sarah.chen@demo.com` - Should show safe (green) risk level
- `tom.mitchell@demo.com` - Should show danger (red) risk level

**Step 5: Verify build passes**

Run: `pnpm build`
Expected: Build completes without errors

**Step 6: Run existing tests**

Run: `pnpm test:int`
Expected: All existing tests pass

---

## Task 8: Final Commit

**Step 1: Verify all changes**

Run: `git status`
Expected: All changes committed, working tree clean

**Step 2: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

**Step 3: Final verification**

Run: `pnpm build && pnpm start`
Test the production build at http://localhost:3000

---

## Summary

This plan implements the co-op map feature in 7 implementation tasks:

1. **Add lat/lng fields** - Schema change to Farms collection
2. **Update seed data** - Relocate to Canatlán with coordinates
3. **Install dependencies** - Add Leaflet packages
4. **Server function** - `getCoopFarmsWithRisk()` for data fetching
5. **Map component** - `CoopMap.tsx` with Leaflet
6. **Dashboard integration** - Wire up map in co-op view
7. **Manual testing** - Verify everything works

Each task has clear steps with exact code and verification commands.
