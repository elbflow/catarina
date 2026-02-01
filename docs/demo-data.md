# Demo Data Reference

This document describes the data created by the seed script (`pnpm seed` or `POST /api/seed`). Use it to log in, test roles, and verify what each user should see.

## Scenario Overview

- **Co-op:** Canatlán Growers Co-op
- **Region:** Canatlán, Durango, Mexico
- **Crop:** Apple
- **Pest:** Codling Moth (action threshold: 2 moths/day)
- **Time span:** ~6 weeks of mid-season monitoring data (~210 seed observations + 15 baselines = ~225 total across 15 traps)

The seed creates **one co-op**, **one pest type**, **5 farms**, **15 traps**, and **7 users** (1 superadmin, 5 farmers, 1 technician).

---

## How to Access

1. **Seed the database** (with dev server running: `pnpm dev`):
   ```bash
   pnpm seed
   ```
   Or: `curl -X POST http://localhost:3000/api/seed`

2. **Log in** at the frontend: http://localhost:3000 (use Login) or Admin: http://localhost:3000/admin

3. **Passwords:**
   - **Superadmin:** `catarina2026!`
   - **All other demo accounts:** `demo1234!`

---

## Demo Accounts

| Email | Password | Role | Farm access | Co-op membership |
|-------|----------|------|-------------|-------------------|
| admin@elbflow.com | catarina2026! | Superadmin | All farms (no tenant filter) | — |
| maria.gonzalez@demo.com | demo1234! | Farmer | North Orchard only | Admin |
| tom.mitchell@demo.com | demo1234! | Farmer | Valley Farm only | Member |
| sarah.chen@demo.com | demo1234! | Farmer | South Grove only | Member |
| bob.williams@demo.com | demo1234! | Farmer | East Orchard only | Member |
| david.park@demo.com | demo1234! | Farmer | West Fields only | Member |
| jennifer.marks@demo.com | demo1234! | Technician | All 5 farms | Pending |

**What each user should see:**

- **admin@elbflow.com** — Dashboard can show any farm; sees all traps and observations in Admin.
- **maria.gonzalez@demo.com** — One farm (North Orchard), 4 traps, WARNING-level risk.
- **tom.mitchell@demo.com** — One farm (Valley Farm), 3 traps, DANGER-level risk.
- **sarah.chen@demo.com** — One farm (South Grove), 3 traps, SAFE-level risk.
- **bob.williams@demo.com** — One farm (East Orchard), 2 traps, WARNING-level risk.
- **david.park@demo.com** — One farm (West Fields), 3 traps, WARNING-level risk.
- **jennifer.marks@demo.com** — All 5 farms; can switch farm (e.g. via farm selector) and see each farm's traps and observations.

---

## Co-op

| Field | Value |
|-------|--------|
| Name | Canatlán Growers Co-op |
| Region | Canatlán, Durango, Mexico |

Memberships: Maria = admin, Tom/Sarah/Bob/David = active members, Jennifer = pending.

---

## Farms and Traps

Each farm is in the same co-op and uses the same pest type (Codling Moth). Trap names and risk levels are fixed by the seed to simulate mid-season readings.

| Farm | Location | Lat/Lng | Traps | Trap names | Mid-season risk |
|------|----------|---------|-------|------------|-----------------|
| North Orchard | Canatlán, Durango | 24.0820, -104.7650 | 4 | Block A - North, Block A - South, Block B - Honeycrisp, Block C - Gala | WARNING |
| Valley Farm | Canatlán, Durango | 24.0530, -104.7785 | 3 | East Section, West Section, Young Trees | DANGER |
| South Grove | Canatlán, Durango | 24.0180, -104.7890 | 3 | Main Field, Hillside Plot, Border Trap | SAFE |
| East Orchard | Canatlán, Durango | 24.0450, -104.7350 | 2 | Primary Trap, Secondary Trap | WARNING |
| West Fields | Canatlán, Durango | 24.0600, -104.8200 | 3 | Certified Block 1, Certified Block 2, Perimeter Monitor | WARNING |

**Total:** 5 farms, 15 traps. Each trap has multiple observations over ~6 weeks (about 14–15 readings per trap).

### Observations per trap

Counts below are **seed-created readings only**. Each trap also gets **+1 baseline observation** (count 0) from the Traps `afterChange` hook when the trap is created, so total observations per trap = count below + 1.

| Farm | Trap name | Observations (seed) | Total (incl. baseline) |
|------|-----------|----------------------|------------------------|
| North Orchard | Block A - North | 15 | 16 |
| North Orchard | Block A - South | 15 | 16 |
| North Orchard | Block B - Honeycrisp | 15 | 16 |
| North Orchard | Block C - Gala | 15 | 16 |
| Valley Farm | East Section | 15 | 16 |
| Valley Farm | West Section | 15 | 16 |
| Valley Farm | Young Trees | 15 | 16 |
| South Grove | Main Field | 14 | 15 |
| South Grove | Hillside Plot | 14 | 15 |
| South Grove | Border Trap | 14 | 15 |
| East Orchard | Primary Trap | 14 | 15 |
| East Orchard | Secondary Trap | 14 | 15 |
| West Fields | Certified Block 1 | 15 | 16 |
| West Fields | Certified Block 2 | 15 | 16 |
| West Fields | Perimeter Monitor | 15 | 16 |

**Total seed observations:** ~210. With 15 baselines: **~225 observations** in the database after seed.

---

## Pest Type

| Field | Value |
|-------|--------|
| Name | Codling Moth |
| Crop | Apple |
| Rate threshold | 2 moths/day |
| Description | The codling moth (Cydia pomonella) is the most significant pest of apple crops worldwide. Adult moths are about 1/2 inch long with gray-brown wings featuring a copper-colored patch at the wing tips. Larvae bore into fruit, causing "wormy" apples. Action threshold: 2 moths per trap per day indicates first spray timing. |

---

## Observations (Summary)

- **Count:** ~210 seed-created observations across 15 traps; plus 15 baseline observations (one per trap from the Traps hook) = **~225 total observations** in the DB after seed.
- **Period:** From 42 days ago up to "today" (relative to seed run date).
- **Patterns:** Counts vary by trap:
  - **North Orchard (Block B - Honeycrisp)** — Higher activity (variety attracts more moths)
  - **Valley Farm (East Section)** — Very high activity, DANGER zone, counts 9-12
  - **South Grove** — Low, stable activity, SAFE zone, excellent pest management
  - **East Orchard** — Moderate, increasing trend, WARNING zone
  - **West Fields** — Mixed results, organic management challenges
- **Notes:** Some observations include notes (e.g. "Applied first spray", "Mating disruption working well", "Biocontrol showing results").
- **Baseline:** Each trap gets one baseline observation (count 0) from the Traps `afterChange` hook when the trap is created.

---

## Quick Test Checklist

- **Superadmin:** Log in as `admin@elbflow.com` → can access Admin and see all collections; dashboard can show any farm.
- **Single-farm farmer:** Log in as `maria.gonzalez@demo.com` → only North Orchard; 4 traps; WARNING risk; observations visible.
- **DANGER farm:** Log in as `tom.mitchell@demo.com` → Valley Farm; 3 traps; DANGER risk; high counts.
- **SAFE farm:** Log in as `sarah.chen@demo.com` → South Grove; 3 traps; SAFE risk; low counts.
- **Technician:** Log in as `jennifer.marks@demo.com` → can see all 5 farms and switch between them; each farm shows its traps and observations.

---

## Source

Seed implementation: `src/lib/demo-data.ts`.
To change users, farms, traps, or observation patterns, edit that file and re-run the seed on a fresh DB (e.g. after `pnpm payload migrate:fresh`).
