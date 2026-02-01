# Catarina — Remaining Tickets

> Last updated: February 1, 2026

This document tracks the remaining work items for the hackathon. Items are prioritized by impact and execution order.

---

## Table of Contents

### Completed
- [Completed Items](#completed-)

### Priority 1: Core Features for Demo
1. [Co-op Map with Heatmap Visualization](#1-co-op-map-with-heatmap-visualization)
2. [Demo Script & Video](#3-demo-script--video)

### Priority 2: High-Impact Enhancements
4. [AI Photo → Observation Autofill](#4-ai-photo--observation-autofill)
5. [Email Notifications](#5-email-notifications)

### Priority 3: Nice-to-Have Polish
6. [Dashboard View Toggle (My Farm ↔ Co-op View)](#6-dashboard-view-toggle-my-farm--co-op-view)
7. [Basic Risk Explanation Tooltip](#7-basic-risk-explanation-tooltip)
8. [Natural Language Risk Narrative (Stretch)](#8-natural-language-risk-narrative-stretch)

### Reference
- [Execution Order](#execution-order)
- [Notes](#notes)

---

## Completed ✅

- [x] **Contextual "what to do" messaging in RiskZone** — Action-oriented guidance based on risk level
- [x] **Landing Page** — Public homepage with hero, value prop, CTA
- [x] **About Us Page** — Mission, background, why timing matters
- [x] **Core Dashboard** — Trend chart, risk zones, trap selector, observation list
- [x] **Authentication** — Login, signup, route protection, demo accounts
- [x] **Observation Entry** — Manual form with date, count, trap, notes
- [x] **Demo Data Seed** — 5 farms, 15 traps, 235 observations, 7 users
- [x] **Observation Detail Page (View/Edit/Delete)** — Detail page at `/observations/[id]` with inline edit mode, delete confirmation, breadcrumbs, and clickable list rows

---

## Priority 1: Core Features for Demo

### 1. Co-op Map with Heatmap Visualization
**Goal:** Show geographic distribution of pest pressure across co-op farms

**Tasks:**
- [ ] Add `location` field to Farm collection (lat/lng coordinates)
- [ ] Update seed data with realistic farm positions in **Canatlán, Durango, Mexico**
- [ ] Create map component showing all co-op farms
- [ ] Add heatmap overlay based on risk levels (green/amber/red)
- [ ] Integrate map into dashboard (possibly as part of "Co-op View")

**Technical Notes:**
- Consider using Leaflet or Mapbox for mapping
- Location field: `{ type: 'point' }` or separate `lat`/`lng` number fields
- Heatmap colors should match existing risk zone colors

**Files to modify:**
- `src/collections/Farms.ts` — Add location field
- `src/lib/demo-data.ts` — Add Canatlán coordinates
- New component: `src/components/dashboard/CoopMap.tsx`

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: Co-op Map with Heatmap Visualization

## Context
You are working on Catarina, an IPM (Integrated Pest Management) app that helps growers track pest observations. We need to add a map visualization showing all farms in a co-op with their current risk levels displayed as a heatmap.

The farms should be located in **Canatlán, Durango, Mexico** (a real pecan/apple growing region).

## Your Mission
Implement the map feature, but first align with me on the approach by asking clarifying questions.

## Before You Start, Please Ask Me About:

### Data Model
- How should we store location data? (Payload `point` field vs separate `lat`/`lng` fields?)
- Should location be required or optional for farms?
- Do we need location for individual traps, or just farms?

### Map Library & Rendering
- Any preference for mapping library? (Leaflet, Mapbox, Google Maps, react-simple-maps?)
- Should this be a static map or interactive (pan/zoom)?
- What should happen when a user clicks on a farm marker?

### Heatmap Visualization
- How should we visualize risk? (Colored markers? Actual heatmap gradient? Circles with radius?)
- Should we show exact risk level or just the color category (Safe/Warning/Danger)?
- Do we need a legend explaining the colors?

### Integration & Placement
- Where should this map live? (New "Co-op View" tab? Separate page? Always visible on dashboard?)
- Should it replace something or be additional content?
- Who should see this map? (All users? Only co-op members? Only technicians?)

### Seed Data
- How many farms should we seed for Canatlán?
- Should the current Yakima Valley demo data be replaced or kept alongside?
- Any specific farm names or characteristics for the Mexican context?

## Reference Files
- `src/collections/Farms.ts` — Current farm schema
- `src/lib/demo-data.ts` — Current seed data
- `docs/demo-data.md` — Demo data documentation
- `src/app/(frontend)/(protected)/page.tsx` — Dashboard page

Please ask me these questions so we can align on the implementation approach before coding.
```

</details>

---

### 2. Demo Script & Video
**Goal:** 2-minute demo that clearly shows problem → signal → action

**Tasks:**
- [ ] Write demo script in `/docs/demo-script.md`
- [ ] Record screen walkthrough
- [ ] Add optional AI voiceover (if it saves time)

**Script Structure:**
1. **Problem** (30s): "Small growers miss the intervention window..."
2. **Solution** (60s): Walk through app as struggling farmer
3. **Impact** (30s): "From confusion to confident, timely action"

**Demo Flow:**
1. Show landing page (the "why")
2. Login as Tom (DANGER farm) — show urgency
3. Login as Sarah (SAFE farm) — show calm monitoring
4. Add an observation — show how simple it is
5. Show co-op map (if complete) — collective awareness

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: Demo Script & Video

## Context
You are helping prepare a hackathon presentation for Catarina, an IPM (Integrated Pest Management) app. We need a compelling 2-minute demo that shows judges the value of our product.

**Key Message**: "We help growers stop missing the narrow windows where sustainable pest control actually works."

## Your Mission
Help create the demo script and plan the video recording, but first align with me on the narrative and approach.

## Before You Start, Please Ask Me About:

### Narrative & Story
- Should we tell the story from a specific persona's perspective? (e.g., "Meet Maria, a third-generation apple grower...")
- How much should we emphasize the problem vs. the solution?
- Should we include any statistics or data points about crop loss / timing windows?

### Demo Flow
- Which demo accounts should we showcase? (Tom = DANGER, Sarah = SAFE, Maria = WARNING)
- In what order should we show the screens?
- Should we show the admin panel at all, or stick to the farmer-facing app?

### Features to Highlight
- What are the 3-4 most important features to show?
- Should we demonstrate adding an observation live, or just show existing data?
- If the co-op map isn't ready, what should we show instead for "collective awareness"?

### Tone & Style
- Should the script be conversational or more formal/professional?
- Any specific phrases or taglines we must include?
- Should we mention the hackathon context or present as if it's a real product?

### Video Production
- Will you record the screen, or should I provide detailed screen-by-screen instructions?
- Should we use AI voiceover, or will you record audio yourself?
- Any preferred video length? (Strictly 2 min? Can it be 2:30?)

### Script Format
- Should I write a word-for-word script, or bullet points with talking points?
- Should I include timestamps for each section?
- Should I include notes about what's on screen at each moment?

## Reference Files
- `hackathon-strategy.md` — Vision, pitch, success criteria
- `docs/demo-data.md` — Demo accounts and their risk levels
- `docs/glossary.md` — Preferred terminology

Please answer these questions so I can write a script that matches your vision.
```

</details>

---

## Priority 2: High-Impact Enhancements

### 4. AI Photo → Observation Autofill
**Goal:** Upload trap photo → AI counts moths → pre-fills observation form

**Tasks:**
- [ ] Add photo upload to observation form (field exists in schema)
- [ ] Integrate vision model (GPT-4V, Claude Vision, or similar)
- [ ] Parse AI response to extract count + pest identification
- [ ] Pre-fill form fields with AI suggestions
- [ ] Allow user to confirm or adjust before saving

**UX Notes:**
- Show "Analyzing..." loading state
- Display AI confidence: "Detected: ~12 moths (high confidence)"
- Always let user override AI suggestion

**Files to modify:**
- `src/components/forms/ObservationForm.tsx` — Add photo upload
- New: `src/lib/ai-analysis.ts` — Vision API integration
- Update: `src/lib/api-client.ts` — Handle media upload

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: AI Photo → Observation Autofill

## Context
You are working on Catarina, an IPM app for pest observation tracking. We want to add a feature where users can upload a photo of their trap, and AI will analyze it to count moths and pre-fill the observation form.

This is a key differentiator for the hackathon — it shows AI adding real value to the workflow.

## Your Mission
Implement the AI photo analysis feature, but first align with me on the approach.

## Before You Start, Please Ask Me About:

### Photo Upload UX
- Should the photo upload be prominent (main action) or secondary to manual entry?
- Should we show a camera button for mobile users to take a photo directly?
- What file types and size limits should we support?

### AI Model & Integration
- Which vision API should we use? (OpenAI GPT-4V, Claude Vision, Google Vision, other?)
- Do we have API keys set up for any of these?
- Should analysis happen client-side (API call from browser) or server-side?

### AI Prompt & Response
- What exactly should we ask the AI to identify? (Just count? Pest species? Trap condition?)
- How should we handle uncertainty? (Show confidence level? Range estimate?)
- What if the AI can't identify anything or the image is unclear?

### Form Integration
- Should the AI result auto-fill the count field, or just suggest it?
- Should users see the AI's reasoning or just the number?
- What happens if the user changes the AI-suggested value?

### Photo Storage
- Should we save the photo with the observation? (Schema already has `photo` field)
- Should photos be uploaded to Payload Media or a separate service?
- Any privacy considerations for farm photos?

### Error Handling
- What if the AI API is slow or unavailable?
- Should there be a timeout? What's the fallback?
- How do we handle API rate limits or costs?

## Reference Files
- `src/components/forms/ObservationForm.tsx` — Current form (needs photo upload)
- `src/collections/PestObservations.ts` — Has `photo` field defined
- `src/collections/Media.ts` — Media upload collection
- `src/lib/api-client.ts` — API patterns

Please ask me these questions so we can design an AI feature that's impressive but reliable.
```

</details>

---

### 5. Email Notifications
**Goal:** Alert users when risk level changes or action is needed

**Tasks:**
- [ ] Set up email provider (Resend, SendGrid, or Payload email adapter)
- [ ] Create email templates (risk alert, weekly summary)
- [ ] Add notification preferences to user settings
- [ ] Trigger emails on risk level transitions (Safe→Warning, Warning→Danger)
- [ ] Add "unsubscribe" link

**Email Types:**
1. **Risk Alert**: "⚠️ Your farm has entered WARNING level. Prepare biological controls."
2. **Weekly Summary**: "This week: 3 observations, average rate 1.2/day, status: SAFE"

**Files to modify:**
- `src/payload.config.ts` — Add email adapter
- New: `src/lib/email-templates.ts`
- New: `src/hooks/send-risk-alert.ts` — Hook to trigger emails
- Update: `src/collections/Users.ts` — Add notification preferences

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: Email Notifications

## Context
You are working on Catarina, an IPM app for pest observation tracking. We want to add email notifications to alert users when their risk level changes or when action is needed.

## Your Mission
Implement email notifications, but first align with me on the scope and approach.

## Before You Start, Please Ask Me About:

### Email Provider
- Do we have a preferred email service? (Resend, SendGrid, AWS SES, Postmark?)
- Are there any existing API keys or accounts set up?
- Should emails work in development (real sends) or just log to console?

### Notification Types
- Which emails are must-have for the demo?
  - Risk level change alerts?
  - Weekly/daily summaries?
  - Welcome email on signup?
  - Observation reminders ("You haven't checked your trap in 5 days")?
- Should we start with just one type and expand later?

### Trigger Logic
- When exactly should risk alerts fire? (Every observation? Only on level change?)
- How do we prevent spam? (Max 1 email per day? Per risk change only?)
- Should alerts be per-farm or per-user?

### Email Content & Design
- Should emails be plain text or HTML with styling?
- Should they match the app's visual design?
- What should the "from" address be?

### User Preferences
- Should users be able to opt out of emails?
- Where should notification preferences live? (User profile? Settings page?)
- Should email notifications be on or off by default?

### Technical Implementation
- Should emails be sent synchronously (in hooks) or via a queue?
- How do we handle email failures?
- Do we need to track email delivery/opens?

## Reference Files
- `src/payload.config.ts` — Payload configuration
- `src/collections/Users.ts` — User schema
- `src/collections/PestObservations.ts` — Observation hooks
- `src/lib/risk-calculator.ts` — Risk calculation logic

Please ask me these questions so we can scope this appropriately for the hackathon.
```

</details>

---

## Priority 3: Nice-to-Have Polish

### 6. Dashboard View Toggle (My Farm ↔ Co-op View)
**Goal:** Switch between individual farm view and aggregated co-op view

**Tasks:**
- [ ] Add toggle UI (tabs or button group)
- [ ] "My Farm" — Current behavior
- [ ] "Co-op View" — Aggregated trend chart for all farms
- [ ] Show farm-by-farm risk comparison

**Notes:** May be partially addressed by the Co-op Map feature (#1)

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: Dashboard View Toggle (My Farm ↔ Co-op View)

## Context
You are working on Catarina, an IPM app. Currently the dashboard shows a single farm's data. We want to add a toggle to switch between "My Farm" view and a "Co-op View" showing aggregated data.

Note: This may overlap with Ticket #1 (Co-op Map). Let's discuss how they relate.

## Before You Start, Please Ask Me About:

### Relationship to Co-op Map
- Is this toggle separate from the map feature, or should the map BE the co-op view?
- Should "Co-op View" show both a map AND an aggregated chart?

### Toggle UI
- Tabs? Toggle button? Dropdown?
- Where should it be positioned? (Top of dashboard? In header?)

### Co-op View Content
- What data should be aggregated? (All observations? Per-farm summaries?)
- Should we show individual farm risk levels as a list/table?
- Should the trend chart show all farms overlaid, or a single aggregate line?

### Access Control
- Who sees the co-op view? (All co-op members? Only admins?)
- Should technicians see all co-ops they're connected to?

## Reference Files
- `src/app/(frontend)/(protected)/page.tsx` — Dashboard page
- `src/lib/payload-client.ts` — Data fetching functions

Please ask me these questions so we can decide if this is separate from or part of the map feature.
```

</details>

---

### 7. Basic Risk Explanation Tooltip
**Goal:** Help users understand how risk is calculated

**Tasks:**
- [ ] Add (?) icon next to risk zone
- [ ] Tooltip explains: "Rate calculated from last 3 days of observations. Threshold of 2/day indicates treatment timing."

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: Risk Explanation Tooltip

## Context
You are working on Catarina, an IPM app. The RiskZone component shows risk levels but doesn't explain how they're calculated. We want to add a simple tooltip.

## Before You Start, Please Ask Me About:

### Content
- What exactly should the tooltip say?
- Should it explain the math or just the concept?
- Should it link to more detailed documentation?

### Placement & Style
- Where should the (?) icon appear? (Next to title? Next to rate?)
- Hover tooltip or click to expand?
- Should it match existing tooltip styles in the app?

## Reference Files
- `src/components/dashboard/RiskZone.tsx` — Component to modify
- `src/lib/risk-calculator.ts` — Calculation logic to explain

This is a quick task — please confirm approach before implementing.
```

</details>

---

### 8. Natural Language Risk Narrative (Stretch)
**Goal:** AI-generated insight about timing

**Example:** "Based on current trends, you have approximately 3-5 days before the action window closes."

<details>
<summary><strong>Agent Prompt</strong></summary>

```
# Task: Natural Language Risk Narrative

## Context
You are working on Catarina, an IPM app. We want to add an AI-generated insight that explains the current risk situation in plain language.

## Before You Start, Please Ask Me About:

### Scope
- Should this be a real AI call, or can we use templated messages based on risk level?
- If AI, should it analyze the full observation history or just recent data?

### Content
- What tone? (Calm and informative? Urgent when danger?)
- Should it include specific timeframes? ("3-5 days")
- Should it suggest actions?

### Placement
- Where should this narrative appear? (Below RiskZone? In a separate card?)
- Always visible or expandable?

### Fallback
- What if AI is unavailable or slow?
- Should there be a non-AI fallback?

This is a stretch goal — let's discuss if it's worth the complexity.
```

</details>

---

## Execution Order

| # | Ticket | Est. Time | Priority | Impact |
|---|--------|-----------|----------|--------|
| 1 | Co-op Map + Heatmap | 3-4 hrs | P1 | High — visual wow factor |
| 2 | Demo Script + Video | 1 hr | P1 | Critical — presentation |
| 3 | AI Photo Autofill | 2-3 hrs | P2 | High — AI differentiation |
| 4 | Email Notifications | 2-3 hrs | P2 | Medium — engagement |
| 5 | Dashboard View Toggle | 1-2 hrs | P3 | Medium |
| 6 | Risk Explanation Tooltip | 15 min | P3 | Low |
| 7 | NL Risk Narrative | 1-2 hrs | P3 | Low |

---

## Notes

- **KISS Principle**: Focus on P1 items first. P2/P3 only if time permits.
- **Demo Focus**: Everything should support a clear 2-minute demo narrative.
- **No Scope Creep**: Multi-tenant auth, WhatsApp integration, deep pest biology are POST-hackathon.
