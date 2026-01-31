# Demo Data Reference

This document describes the data created by the seed script (`pnpm seed` or `POST /api/seed`). Use it to log in, test roles, and verify what each user should see.

## Scenario Overview

- **Co-op:** Yakima Valley Apple Growers  
- **Region:** Yakima Valley, Washington  
- **Crop:** Apple  
- **Pest:** Codling Moth (action threshold: 2 moths/day)  
- **Time span:** ~6 weeks of mid-season monitoring data (220 seed observations + 15 baselines = 235 total across 15 traps)

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
| maria.gonzalez@demo.com | demo1234! | Farmer | Gonzalez Family Orchards only | Admin |
| tom.mitchell@demo.com | demo1234! | Farmer | Mitchell Apple Ranch only | Member |
| sarah.chen@demo.com | demo1234! | Farmer | Sunrise Orchards only | Member |
| bob.williams@demo.com | demo1234! | Farmer | Williams Grove only | Member |
| david.park@demo.com | demo1234! | Farmer | Park's Organic Apples only | Member |
| jennifer.marks@demo.com | demo1234! | Technician | All 5 farms | Pending |

**What each user should see:**

- **admin@elbflow.com** — Dashboard can show any farm; sees all traps and observations in Admin.
- **maria.gonzalez@demo.com** — One farm (Gonzalez Family Orchards), 4 traps, WARNING-level risk.
- **tom.mitchell@demo.com** — One farm (Mitchell Apple Ranch), 3 traps, DANGER-level risk.
- **sarah.chen@demo.com** — One farm (Sunrise Orchards), 3 traps, SAFE-level risk.
- **bob.williams@demo.com** — One farm (Williams Grove), 2 traps, WARNING-level risk.
- **david.park@demo.com** — One farm (Park's Organic Apples), 3 traps, WARNING-level risk.
- **jennifer.marks@demo.com** — All 5 farms; can switch farm (e.g. via farm selector) and see each farm’s traps and observations.

---

## Co-op

| Field | Value |
|-------|--------|
| Name | Yakima Valley Apple Growers |
| Region | Yakima Valley, Washington |

Memberships: Maria = admin, Tom/Sarah/Bob/David = active members, Jennifer = pending.

---

## Farms and Traps

Each farm is in the same co-op and uses the same pest type (Codling Moth). Trap names and risk levels are fixed by the seed to simulate mid-season readings.

| Farm | Location | Traps | Trap names | Mid-season risk |
|------|----------|-------|------------|-----------------|
| Gonzalez Family Orchards | Tieton, WA | 4 | Block A - North, Block A - South, Block B - Honeycrisp, Block C - Gala | WARNING |
| Mitchell Apple Ranch | Naches, WA | 3 | East Orchard, West Orchard, Young Trees | DANGER |
| Sunrise Orchards | Selah, WA | 3 | Main Field, Hillside Plot, Border Trap | SAFE |
| Williams Grove | Zillah, WA | 2 | Primary Trap, Secondary Trap | WARNING |
| Park's Organic Apples | Wapato, WA | 3 | Certified Block 1, Certified Block 2, Perimeter Monitor | WARNING |

**Total:** 5 farms, 15 traps. Each trap has multiple observations over ~6 weeks (about 14–15 readings per trap).

### Observations per trap

Counts below are **seed-created readings only**. Each trap also gets **+1 baseline observation** (count 0) from the Traps `afterChange` hook when the trap is created, so total observations per trap = count below + 1.

| Farm | Trap name | Observations (seed) | Total (incl. baseline) |
|------|-----------|----------------------|------------------------|
| Gonzalez Family Orchards | Block A - North | 15 | 16 |
| Gonzalez Family Orchards | Block A - South | 15 | 16 |
| Gonzalez Family Orchards | Block B - Honeycrisp | 15 | 16 |
| Gonzalez Family Orchards | Block C - Gala | 15 | 16 |
| Mitchell Apple Ranch | East Orchard | 15 | 16 |
| Mitchell Apple Ranch | West Orchard | 15 | 16 |
| Mitchell Apple Ranch | Young Trees | 15 | 16 |
| Sunrise Orchards | Main Field | 14 | 15 |
| Sunrise Orchards | Hillside Plot | 14 | 15 |
| Sunrise Orchards | Border Trap | 14 | 15 |
| Williams Grove | Primary Trap | 14 | 15 |
| Williams Grove | Secondary Trap | 14 | 15 |
| Park's Organic Apples | Certified Block 1 | 15 | 16 |
| Park's Organic Apples | Certified Block 2 | 15 | 16 |
| Park's Organic Apples | Perimeter Monitor | 15 | 16 |

**Total seed observations:** 220. With 15 baselines: **235 observations** in the database after seed.

---

## Pest Type

| Field | Value |
|-------|--------|
| Name | Codling Moth |
| Crop | Apple |
| Rate threshold | 2 moths/day |
| Description | Standard Codling Moth description (action threshold: 2 moths per trap per day for first spray timing). |

---

## Observations (Summary)

- **Count:** 220 seed-created observations across 15 traps; plus 15 baseline observations (one per trap from the Traps hook) = **235 total observations** in the DB after seed. See [Observations per trap](#observations-per-trap) for the exact count per trap.
- **Period:** From 42 days ago up to “today” (relative to seed run date).
- **Patterns:** Counts vary by trap (e.g. Honeycrisp block higher; Mitchell East Orchard high for DANGER; Sunrise low for SAFE). Some observations include notes (e.g. “Applied first spray”, “Mating disruption working well”).
- **Baseline:** Each trap gets one baseline observation (count 0) from the Traps `afterChange` hook when the trap is created; the seed does not create additional baselines.

---

## Quick Test Checklist

- **Superadmin:** Log in as `admin@elbflow.com` → can access Admin and see all collections; dashboard can show any farm.
- **Single-farm farmer:** Log in as `maria.gonzalez@demo.com` → only Gonzalez Family Orchards; 4 traps; WARNING risk; observations visible.
- **DANGER farm:** Log in as `tom.mitchell@demo.com` → Mitchell Apple Ranch; 3 traps; DANGER risk; high counts.
- **SAFE farm:** Log in as `sarah.chen@demo.com` → Sunrise Orchards; 3 traps; SAFE risk; low counts.
- **Technician:** Log in as `jennifer.marks@demo.com` → can see all 5 farms and switch between them; each farm shows its traps and observations.

---

## Source

Seed implementation: `src/lib/demo-data.ts`.  
To change users, farms, traps, or observation patterns, edit that file and re-run the seed on a fresh DB (e.g. after `pnpm payload migrate:fresh`).
