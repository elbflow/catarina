# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Catarina is an IPM (Integrated Pest Management) Scout-to-Action application that helps growers track pest observations and identify when intervention is needed. The application converts trap counts into risk signals with threshold-based warnings.

**Tech Stack:** Next.js 15 (App Router) + Payload CMS 3.x + PostgreSQL (Vercel Postgres/Neon) + Tailwind CSS + Recharts

## Commands

```bash
# Development
pnpm dev              # Start development server (http://localhost:3000)
pnpm devsafe          # Clear .next cache and start dev server

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests (integration + e2e)
pnpm test:int         # Run integration tests only (Vitest)
pnpm test:e2e         # Run e2e tests only (Playwright)

# Code Quality
pnpm lint             # Run ESLint
tsc --noEmit          # Validate TypeScript without emitting

# Payload CMS
pnpm generate:types      # Regenerate TypeScript types after schema changes
pnpm generate:importmap  # Regenerate component import map after adding components
```

### Test File Patterns
- Integration tests: `tests/int/**/*.int.spec.ts`
- E2E tests: `tests/e2e/**/*.spec.ts`

### Seed Demo Data
Demo users and data are **not** created by migrations. After `payload migrate:fresh` (or a fresh DB), run the seed so logins work:

1. Start the dev server: `pnpm dev`
2. In another terminal: `pnpm seed` — or visit `http://localhost:3000/api/seed` or run:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

Demo accounts: admin@elbflow.com / catarina2026! (superadmin); all others use password demo1234!. Full reference (users, farms, traps, risk levels): [docs/demo-data.md](docs/demo-data.md). Implementation: `src/lib/demo-data.ts`.

## Architecture

### Route Groups
- `src/app/(frontend)/` - Public-facing routes (dashboard, observation form)
- `src/app/(payload)/` - Payload admin panel (`/admin`)

### Data Flow
1. **Server Components** use Payload Local API (`src/lib/payload-client.ts`) for direct database access
2. **Client Components** use REST API (`src/lib/api-client.ts`) for form submissions to `/api/[...slug]`
3. GraphQL available at `/api/graphql`

### Key Files
- `src/payload.config.ts` - Payload CMS configuration
- `src/collections/` - Data schema definitions (Farms, PestTypes, PestObservations, Users, Media)
- `src/lib/payload-client.ts` - Server-side API functions
- `src/lib/api-client.ts` - Client-side REST API client
- `src/lib/risk-calculator.ts` - Risk level calculation logic (Safe/Warning/Danger based on threshold proximity)

### Collections Schema
- **Farms**: name, crop (apple/pecan/grape/berry), location
- **PestTypes**: name, crop, threshold (action trigger level), description
- **PestObservations**: date, count, farm (relationship), pestType (relationship), notes, photo

## Payload CMS Critical Patterns

### Local API Access Control
```typescript
// ❌ WRONG: Access control bypassed
await payload.find({ collection: 'posts', user: someUser })

// ✅ CORRECT: Enforces user permissions
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })
```

### Transaction Safety in Hooks
Always pass `req` to nested operations in hooks to maintain atomicity:
```typescript
hooks: {
  afterChange: [async ({ doc, req }) => {
    await req.payload.create({
      collection: 'audit-log',
      data: { docId: doc.id },
      req,  // REQUIRED for same transaction
    })
  }]
}
```

### After Schema Changes
1. Run `pnpm generate:types` to regenerate `src/payload-types.ts`
2. Run `pnpm generate:importmap` if adding custom components

## Environment Variables

Required in `.env`:
```
PAYLOAD_SECRET=your-secret-key
POSTGRES_URL=postgresql://user:password@localhost:5432/catarina
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
```

## Current Limitations (V1)
- Single tenant (no authentication)
- Dashboard assumes one farm and one pest type
- Manual observation entry only

## Additional Documentation
- `/rules/` directory contains detailed Payload CMS development guides
- `AGENTS.md` contains comprehensive Payload CMS patterns and security-critical information
