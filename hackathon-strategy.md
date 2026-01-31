# Catarina — Hackathon Strategy

## 1) Elevator Pitch (Vision)

**Food production is becoming more sustainable, but timing is everything.**

Small and medium growers who want to use biological pest control often fail not because they don’t care, but because they **miss the short intervention window**. When that happens, they are forced to choose between losing most of their crop or falling back to pesticides — losing organic certification, revenue, and trust.

**IPM Scout-to-Action helps growers understand what’s happening in their fields and what’s likely coming next, so they can plan the right action at the right time.** By turning simple field observations and local conditions into clear risk signals and reminders, the product helps farmers coordinate, act earlier, and stay sustainable — without requiring them to become pest-modeling experts.

> *In short: we turn scattered field observations into confident, timely decisions for sustainable farming.*

---

## 2) Assumptions & Challenges (Explicit)

Before building, we acknowledge and deliberately constrain these assumptions:

* **This is a planning & prioritization tool, not a prescription engine.**

  * We surface *risk windows, trends, and reminders*, not guaranteed actions.
* **Agronomy depth is intentionally shallow for the hackathon.**

  * Models are illustrative but realistic; scientific rigor comes later.
* **Primary value is timing clarity, not perfect accuracy.**
* **Co-op / collective effects are a strong narrative, not a proven claim yet.**

  * We frame them as *potential benefits*, not guaranteed outcomes.

---

## 3) Research, Product & Presentation To‑Do List

### A) Research (pre-hackathon + during hackathon)

**Before hackathon (1 evening max)**

* [ ] Confirm 1 demo pest–crop pair narrative (recommended: **Apple – Codling Moth**)
* [ ] Validate “Excel + WhatsApp” as current workflow substitute
* [ ] Gather 5–10 reference screenshots / diagrams from:

  * extension advisories
  * pest monitoring reports
* [ ] Quick sanity-check with real grower (pecan or apple) on:

  * how they track counts
  * what “too late” feels like

**During hackathon (lightweight)**

* [ ] List 3 existing substitutes (spreadsheets, extension emails, trap vendors)
* [ ] Prepare 1 sentence on why they don’t fully solve timing

---

### B) Product (build checklist)

**Must-have (non-negotiable)**

* [ ] Add pest observations (manual input)
* [ ] Single farm dashboard with:

  * trend line
  * risk zone / threshold
  * “approaching danger” warning
* [ ] Deterministic demo data (no live dependencies)

**Nice-to-have (only if stable)**

* [ ] Photo → AI-assisted prefill (count + pest guess)
* [ ] Risk explanation in natural language

**Explicitly cut**

* ❌ Deep pest biology
* ❌ Perfect predictions
* ❌ Full co-op analytics

---

### C) Presentation

* [ ] 2-minute demo script (problem → signal → action)
* [ ] Short explainer page (“Why this matters”)
* [ ] Demo video walkthrough (screen recording)
* [ ] Optional AI voiceover (only if it saves time)

---

## 4) Pest–Crop Scope (for demo & narrative)

**Supported conceptually** (same workflow):

* Codling moth → apples *(recommended demo)*
* Pecan nut casebearer → pecans
* Grape berry moth → grapes
* Spotted-wing drosophila → berries

**Hackathon rule:**

> Demo **one pest + one crop extremely clearly**. Others are future scope.

---

## 5) Hackathon Implementation Roadmap

> **Guiding principle:** every version must be demoable and crash‑free.

### V1 — Absolute Minimum (Day 1 target)

* Single tenant (no auth)
* One farm, one pest
* Manual entry of trap counts
* Simple trend chart
* Static danger threshold + in‑app warning

### V2 — Product Signal

* Polished dashboard UI
* Clear “risk zone” visualization
* Copy explaining *what’s happening* and *why it matters*

### V3 — Active Assistant

* Notifications (in‑app or email only)
* Action reminder (“prepare / monitor closely”)

### V4 — AI Assist (if stable)

* Photo → prefilled pest observation (best visual wow)

### V5 — AI Reasoning (stretch)

* Risk forecasting curve + natural‑language explanation
* Uncertainty wording (“window is wide because…”)

> **Important correction to initial roadmap:**
>
> * ❌ Multi‑tenant auth, maps, WhatsApp integration are **post‑hackathon features**.
> * They add risk without improving judging score.

---

## 6) Success Criteria (for judging)

* Judges immediately understand **why timing matters**
* Demo shows a **clear before/after**: confusion → clarity
* Product feels calm, credible, and useful
* AI feels supportive, not gimmicky

---

## 7) One‑Sentence Close (use in Q&A)

> “We help growers stop missing the narrow windows where sustainable pest control actually works.”
