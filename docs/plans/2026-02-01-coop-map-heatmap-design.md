# Co-op Map with Heatmap Visualization

## Overview

Add a geographic map visualization to the dashboard showing all farms in a co-op with their current risk levels displayed as colored markers.

## Decisions Made

| Decision | Choice |
|----------|--------|
| Coordinate storage | Separate `lat`/`lng` number fields |
| Map library | Leaflet with react-leaflet |
| Visualization | Colored circle markers (green/amber/red) |
| Interaction | Popup with summary info |
| Placement | New section in Co-op View only |
| Seed data location | Canatlán, Durango, Mexico |
| Farm names | Generic/neutral names |

## Data Model

Add two optional number fields to the Farms collection:

```typescript
// src/collections/Farms.ts
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

Fields are optional so existing farms without coordinates still work. The current text `location` field remains for display purposes.

## Map Component

**Component:** `src/components/dashboard/CoopMap.tsx`

**Props:**
```typescript
interface CoopMapProps {
  farms: Array<{
    id: number
    name: string
    lat: number | null
    lng: number | null
    averageRate: number
    riskLevel: 'safe' | 'warning' | 'danger'
  }>
  center?: [number, number]
  zoom?: number
}
```

**Behavior:**
- Filters out farms without coordinates
- Renders a marker for each farm with color based on risk level
- Colors match existing design: green (#22c55e), amber (#f59e0b), red (#ef4444)
- Map auto-centers and zooms to fit all visible farms
- Uses OpenStreetMap tiles (free, no API key)

**Marker Popup:**
- Farm name (bold)
- Current rate: "2.4 moths/day"
- Risk badge: colored pill showing "Safe" / "Warning" / "Danger"
- "View Farm" link to switch to that farm's dashboard

**Sizing:** Full width, ~400px height, rounded corners matching card styling.

## Dashboard Integration

Map appears only in Co-op View, between Risk Zone and Trend Chart:

```
┌─────────────────────────────────────┐
│  View: [My Farm] [Co-Op]            │
├─────────────────────────────────────┤
│  Risk Zone (Co-op average)          │
├─────────────────────────────────────┤
│  Co-op Map                          │  ← New section
├─────────────────────────────────────┤
│  Rate Trend Chart                   │
├─────────────────────────────────────┤
│  Recent Observations                │
└─────────────────────────────────────┘
```

**Data Flow:**
1. Fetch all farms in the co-op
2. Calculate each farm's average rate using existing `calculateAverageRateForLastNDays`
3. Determine risk level for each farm
4. Pass to `<CoopMap />` component

**New Function:** `getCoopFarmsWithRisk(coopId, user)` in `payload-client.ts`

## Seed Data

**Location:** Canatlán, Durango, Mexico (real agricultural municipality at ~24.05°N, 104.78°W)

| Farm Name | Lat | Lng | Notes |
|-----------|-----|-----|-------|
| North Orchard | 24.0820 | -104.7650 | ~5km north |
| Valley Farm | 24.0530 | -104.7785 | Town center |
| South Grove | 24.0180 | -104.7890 | ~4km south |
| East Orchard | 24.0450 | -104.7350 | ~5km east |
| West Fields | 24.0600 | -104.8200 | ~4km west |

**Co-op:** Rename to "Canatlán Growers Co-op" with region "Canatlán, Durango, Mexico"

**Users:** Keep existing demo names (Maria Gonzalez, Tom Mitchell, etc.)

**Pest Type:** Keep Codling Moth (real pest for apples/pecans in this region)

## Dependencies

```bash
pnpm add leaflet react-leaflet
pnpm add -D @types/leaflet
```

**Leaflet CSS:** Import `leaflet/dist/leaflet.css` in map component

**SSR:** Dynamic import with `ssr: false`:
```typescript
const CoopMap = dynamic(
  () => import('@/components/dashboard/CoopMap').then(mod => mod.CoopMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)
```

**Marker Icons:** Use `L.divIcon` with CSS-styled circles instead of default image markers to avoid webpack issues and enable custom colors.

## Files to Modify

- `src/collections/Farms.ts` — Add lat/lng fields
- `src/lib/demo-data.ts` — Update coordinates and co-op name
- `src/components/dashboard/CoopMap.tsx` — New component
- `src/app/(frontend)/(protected)/dashboard/page.tsx` — Integrate map
- `src/lib/payload-client.ts` — Add `getCoopFarmsWithRisk()` function
