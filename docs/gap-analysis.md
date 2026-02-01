# Catarina IPM Scout-to-Action: Gap Analysis Report

**Date:** January 31, 2026  
**Branch Analyzed:** `main`

---

## Executive Summary

The codebase has **solid V1 and partial V2 implementation**. The core MVP functionality is in place: users can log in, create farms, add observations, and view a dashboard with trend charts and risk zone indicators. However, there are gaps in polish, missing hackathon presentation deliverables, and debug code that needs cleanup.

---

## Current State: What's Already Built

### V1 — Absolute Minimum ✅ COMPLETE

| Feature | Status | Implementation |
|---------|--------|----------------|
| Single tenant (no auth) | ✅ **Exceeded** | Full auth system (login/signup/logout) |
| One farm, one pest | ✅ Complete | Multi-farm/trap support via `multiTenantPlugin` |
| Manual entry of trap counts | ✅ Complete | `src/components/forms/ObservationForm.tsx` |
| Simple trend chart | ✅ Complete | `src/components/dashboard/TrendChart.tsx` (Recharts) |
| Static danger threshold + warning | ✅ Complete | `src/components/dashboard/RiskZone.tsx` |
| Deterministic demo data | ✅ Complete | `src/lib/demo-data.ts` with seed endpoint |

### V2 — Product Signal 🔄 PARTIALLY COMPLETE

| Feature | Status | Implementation |
|---------|--------|----------------|
| Polished dashboard UI | ✅ Complete | Clean card-based layout in `(protected)/page.tsx` |
| Clear "risk zone" visualization | ✅ Complete | Progress bar with Safe/Warning/Danger states |
| Copy explaining what's happening | ⚠️ Partial | Info box exists but could be more compelling |

### V3 — Active Assistant ❌ NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| In-app notifications | ❌ Missing | No notification system |
| Action reminders | ❌ Missing | No contextual action guidance |

### V4 — AI Assist ❌ NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Photo → AI-assisted prefill | ❌ Missing | Photo upload field exists but no AI integration |

### V5 — AI Reasoning ❌ NOT STARTED (Stretch Goal)

| Feature | Status | Notes |
|---------|--------|-------|
| Risk forecasting curve | ❌ Missing | Would require predictive modeling |
| Natural-language explanation | ❌ Missing | Would require LLM integration |

---

## Critical Issues Found

### 1. Debug Logging in Production Code 🔴

**File:** `src/components/onboarding/OnboardingForm.tsx`

Contains debug fetch calls to `localhost:7242` that must be removed before demo:

```typescript
// Lines 49-51, 57-59, 62-64, 68-70
fetch('http://127.0.0.1:7242/ingest/...').catch(()=>{});
```

**Action:** Remove all `#region agent log` blocks.

### 2. Stale E2E Tests 🔴

**File:** `tests/e2e/frontend.e2e.spec.ts`

Test expects Payload default content instead of actual app:

```typescript
await expect(page).toHaveTitle(/Payload Blank Template/)
await expect(heading).toHaveText('Welcome to your new project.')
```

**Action:** Update to test actual login/dashboard flow.

### 3. Unused Component 🟡

**File:** `src/components/dashboard/WarningBanner.tsx`

This component exists but is not used anywhere (replaced by `RiskZone`).

**Action:** Remove or integrate into dashboard.

### 4. Missing Presentation Assets 🔴

Required by hackathon strategy but not present:

- [ ] 2-minute demo script
- [ ] Short explainer page ("Why this matters")
- [ ] Demo video walkthrough
- [ ] Optional AI voiceover

---

## Itemized Implementation Plan

Following the **KISS principle**, ordered by priority (essentials first, extras last).

### Phase 1: Code Cleanup & Stability (Essential)

| # | Task | Effort | File(s) |
|---|------|--------|---------|
| 1.1 | Remove debug logging from OnboardingForm | 5 min | `src/components/onboarding/OnboardingForm.tsx` |
| 1.2 | Update or remove stale E2E test | 10 min | `tests/e2e/frontend.e2e.spec.ts` |
| 1.3 | Remove unused WarningBanner component | 5 min | `src/components/dashboard/WarningBanner.tsx` |

### Phase 2: V2 Polish (Important for Demo)

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 2.1 | Enhance dashboard info copy | 15 min | Explain "why timing matters" more compellingly |
| 2.2 | Add "Why This Matters" explainer page | 30 min | Route: `/about` or `/why` |
| 2.3 | Tighten demo data narrative | 15 min | Focus on Codling Moth + Apple story |

### Phase 3: V3 Active Assistant (If Time Permits)

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 3.1 | Add in-app notification banner | 45 min | Show when rate exceeds threshold |
| 3.2 | Add action reminder text | 30 min | "Prepare to intervene" / "Monitor closely" |

### Phase 4: V4 AI Assist (Wow Factor - If Stable)

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 4.1 | Integrate OpenAI Vision API | 2-3 hours | Photo → insect count estimation |
| 4.2 | Add AI prefill UI | 1 hour | Smooth UX in observation form |

### Phase 5: Presentation Deliverables (Required)

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 5.1 | Write 2-minute demo script | 30 min | Problem → Signal → Action structure |
| 5.2 | Record demo video walkthrough | 45 min | Screen recording with narration |
| 5.3 | (Optional) Add AI voiceover | 30 min | Only if it saves time |

### Phase 6: Nice-to-Have Extras (Only if All Above Done)

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 6.1 | V5 Risk forecasting curve | 2-3 hours | Predictive visualization |
| 6.2 | Natural-language risk explanation | 1-2 hours | LLM-generated insights |
| 6.3 | Email notifications | 2-3 hours | Via Resend/SendGrid |

---

## Recommended Execution Order

### Day 1 Morning (Must Complete)

1. **Phase 1:** Code cleanup (20 min total)
2. **Phase 2:** V2 polish (1 hour total)
3. **Phase 5.1:** Write demo script (30 min)

### Day 1 Afternoon (High Value)

4. **Phase 3:** Active assistant features (1.5 hours)
5. **Phase 5.2:** Record demo video (45 min)

### Day 2 (If Stable & Time Available)

6. **Phase 4:** AI photo assist (3-4 hours)
7. **Phase 6:** Extras

---

## Architecture Reference

### Key Files

| Purpose | File |
|---------|------|
| Main dashboard | `src/app/(frontend)/(protected)/page.tsx` |
| Observation form | `src/components/forms/ObservationForm.tsx` |
| Risk calculation | `src/lib/risk-calculator.ts` |
| Trend chart | `src/components/dashboard/TrendChart.tsx` |
| Risk zone display | `src/components/dashboard/RiskZone.tsx` |
| Demo data seeding | `src/lib/demo-data.ts` |
| Payload config | `src/payload.config.ts` |

### Collections

| Collection | Purpose |
|------------|---------|
| `users` | Authentication with farmer/technician roles |
| `farms` | Tenant entities (multi-tenant via plugin) |
| `traps` | Individual traps within farms |
| `pest-types` | Pest definitions with thresholds |
| `pest-observations` | Count entries per trap |
| `coops` | Cooperative organizations |
| `coop-memberships` | User-to-coop relationships |

### Demo Accounts

```
Superadmin:     admin@elbflow.com / catarina2026!
Farmer 1:       farmer1@demo.com / demo1234!
Farmer 2:       farmer2@demo.com / demo1234!
Technician:     tech@demo.com / demo1234!
```

---

## Success Criteria (from Hackathon Strategy)

- [ ] Judges immediately understand **why timing matters**
- [ ] Demo shows a **clear before/after**: confusion → clarity
- [ ] Product feels calm, credible, and useful
- [ ] AI feels supportive, not gimmicky

---

## One-Sentence Close

> "We help growers stop missing the narrow windows where sustainable pest control actually works."
