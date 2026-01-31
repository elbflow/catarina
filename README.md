# Catarina - IPM Scout-to-Action

**Food production is becoming more sustainable, but timing is everything.**

IPM Scout-to-Action helps growers understand what's happening in their fields and what's likely coming next, so they can plan the right action at the right time. By turning simple field observations and local conditions into clear risk signals and reminders, the product helps farmers coordinate, act earlier, and stay sustainable.

## Features

- **Pest Observation Tracking** - Manual entry of trap counts with date, farm, and pest type
- **Dashboard Visualization** - Trend charts showing pest counts over time with threshold indicators
- **Risk Zone Indicators** - Visual risk levels (Safe/Warning/Danger) based on threshold proximity
- **Warning System** - Alerts when pest counts approach or exceed action thresholds
- **Recent Observations** - Quick view of latest trap counts

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **CMS/Backend:** Payload CMS 3.x
- **Database:** PostgreSQL (Vercel Postgres/Neon)
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Quick Start

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- PostgreSQL database (local or cloud)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PAYLOAD_SECRET=your-secret-key-here
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
   POSTGRES_URL=postgresql://user:password@localhost:5432/catarina
   NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

5. **Seed demo data:**
   - Option 1: Via API endpoint (POST to `/api/seed`)
   - Option 2: Via admin panel (create farm, pest type, and observations manually)

### Seeding Demo Data

**Important:** Demo users and data are **not** created by `payload migrate:fresh`. After resetting the DB with `pnpm payload migrate:fresh`, you must run the seed or the demo logins will not work.

With the dev server running (`pnpm dev`):

```bash
pnpm seed
# or: curl -X POST http://localhost:3000/api/seed
# or visit http://localhost:3000/api/seed in the browser
```

This creates demo users, co-op, farms, pest types, traps, and observations.

**Demo data reference:** See [docs/demo-data.md](docs/demo-data.md) for login credentials, which user sees which farm, trap names, and mid-season risk levels.

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes
│   │   ├── page.tsx         # Dashboard (home page)
│   │   └── layout.tsx       # Root layout
│   ├── observations/        # Observation routes
│   │   └── new/page.tsx     # Add observation form
│   └── api/
│       └── seed/route.ts    # Demo data seeder endpoint
├── collections/             # Payload collections
│   ├── Farms.ts
│   ├── PestTypes.ts
│   ├── PestObservations.ts
│   ├── Users.ts
│   └── Media.ts
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── TrendChart.tsx
│   │   ├── RiskZone.tsx
│   │   ├── WarningBanner.tsx
│   │   └── ObservationCard.tsx
│   └── forms/
│       └── ObservationForm.tsx
├── lib/
│   ├── payload-client.ts    # Payload API client
│   ├── risk-calculator.ts   # Risk calculation logic
│   └── demo-data.ts         # Demo data seeder
└── payload.config.ts        # Payload configuration
```

## Collections

### Farms
- `name` - Farm name
- `crop` - Crop type (Apple, Pecan, Grape, Berry)
- `location` - Optional location

### PestTypes
- `name` - Pest name (e.g., "Codling Moth")
- `crop` - Associated crop type
- `threshold` - Action threshold count
- `description` - Optional description

### PestObservations
- `date` - Observation date
- `count` - Trap count
- `farm` - Relationship to Farm
- `pestType` - Relationship to PestType
- `notes` - Optional notes
- `photo` - Optional photo upload (for future AI feature)

## Development

### Generate Types

After modifying collections, regenerate TypeScript types:

```bash
pnpm generate:types
```

### Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Deployment to Vercel

1. **Connect to Vercel:**
   - Push your code to GitHub
   - Import project in Vercel dashboard

2. **Set up services:**
   - Connect **Neon Database** (PostgreSQL)
   - Connect **Vercel Blob Storage** (for media uploads)

3. **Configure environment variables:**
   - `PAYLOAD_SECRET` - Strong random string
   - `PAYLOAD_PUBLIC_SERVER_URL` - Your Vercel app URL
   - `POSTGRES_URL` - Auto-populated from Neon
   - `NEXT_PUBLIC_PAYLOAD_URL` - Your Vercel app URL

4. **Deploy:**
   - Vercel will automatically build and deploy

5. **Seed data:**
   - After deployment, visit `/api/seed` or use the admin panel

## Roadmap

### V1 - Absolute Minimum (Current)
- ✅ Single tenant (no auth)
- ✅ One farm, one pest
- ✅ Manual entry of trap counts
- ✅ Simple trend chart
- ✅ Static danger threshold + in-app warning

### V2 - Product Signal (Next)
- Polished dashboard UI
- Clear "risk zone" visualization
- Copy explaining what's happening and why it matters

### V3 - Active Assistant
- Notifications (in-app or email)
- Action reminders

### V4 - AI Assist
- Photo → AI-assisted prefill (count + pest guess)

### V5 - AI Reasoning (Stretch)
- Risk forecasting curve
- Natural language explanation

## License

MIT
