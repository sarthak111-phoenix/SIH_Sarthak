# Phases.md — Project Phases

Scope discipline: don't start a phase's work until the prior phase's acceptance points are met. Update Memory.md at the end of every phase (and whenever work pauses).

---

## Phase 0 — Foundations & Decisions (pre-implementation)
Before real feature work, lock down (per mvp.md §39):
- Exact tech stack (confirm/replace 🔶 items in Architecture.md)
- Hosting, database, LLM provider
- AI tool schemas (feasibility, schedule, copilot, briefing, extraction)
- Authentication approach
- File storage, voice/OCR provider, QR strategy
- Offline sync approach
- Scheduling algorithm, cost model, risk formula (deterministic engine design)
- Multi-tenant architecture details, API versioning
- Deployment, testing, monitoring approach
- Data retention & privacy policy
- Pilot requirements / demo success metrics

**Exit criteria:** Architecture.md's 🔶 items are resolved; Rules.md and Security.md reflect final choices.

## Phase 1 — Core Skeleton
- Repo scaffolding per Architecture.md folder structure.
- Auth (login, RBAC roles: Owner/Supervisor/Worker/Customer).
- Factory-level data isolation (tenant middleware) — tested first, since everything depends on it.
- Factory Onboarding wizard (Profile, Machines, Materials, Products/Processes, Employees, Suppliers).
- Base DB schema + migrations for core entities (see Architecture.md §7).

**Exit criteria:** A demo factory can be fully onboarded in under 15 minutes; RBAC + tenant isolation covered by tests.

## Phase 2 — Order Intake & Owner Dashboard
- New Order flow: form input first, then voice/PDF/CSV extraction with mandatory confirmation step.
- Owner Dashboard: Factory Health tiles, "Top 3 Things That Need Attention" cards, today's production summary.
- Order Management list + Order Details screen with filters.
- Notifications (CRITICAL/IMPORTANT/INFORMATIONAL) with grouping.

**Exit criteria:** New order created in under 2 minutes; ambiguous extracted fields always prompt confirmation.

## Phase 3 — Deterministic Decision Engine + AI Feasibility
- Build inventory, capacity, scheduling, cost, risk modules as independently testable services.
- AI Order Feasibility Engine: 14-factor check → SAFE / POSSIBLE WITH RISK / NOT RECOMMENDED + alternatives.
- LLM explanation layer wired on top (explains only, never computes).
- AI Feasibility Result screen with VIEW/ACCEPT actions and owner-approval gating.

**Exit criteria:** Feasibility result always includes explanation + alternatives + confidence; no numbers are LLM-generated (verified in tests/review).

## Phase 4 — Production Scheduling & Live Tracking
- Smart Production Scheduling (priority, machine, start/completion, setup, operator suggestions).
- What-If Simulator ("Add Urgent Order").
- Production Board + stage pipeline (Received → ... → Dispatch).
- Worker Home, Worker Job Action screen, Worker Problem/Waste Report — 1–2 tap actions, QR/voice-ready.
- Offline queueing + sync for worker events (idempotent).

**Exit criteria:** Owner approval required for schedule changes; worker common action completes in 1–2 taps; offline events sync without duplication.

## Phase 5 — Inventory, Machines, Downtime/Waste, Profitability
- Inventory Intelligence screen (usable stock, predicted shortage, recommended purchase).
- Machine Dashboard + Machine Details (utilisation, downtime, setup, maintenance).
- Downtime/Waste capture with categorisation and planned-vs-actual reporting.
- Job Profitability screen (cost breakdown, margin %, confidence/range when incomplete).

**Exit criteria:** Shortage predictions show shortage date + recommended purchase; profitability shows a range when data is incomplete rather than a fabricated number.

## Phase 6 — Factory Memory, Copilot, Daily Briefing, Reports
- Factory Memory (searchable knowledge base: text, voice, photos, tips).
- Factory Copilot (Q&A with answer/reason/data/timestamp/confidence/action/linked record).
- Daily AI Briefing (morning + evening).
- Basic Reports screen.

**Exit criteria:** Copilot only accesses its own factory's data, cites records, and admits insufficient data when relevant.

## Phase 7 — Security Hardening & Demo Prep
- Full pass against Security.md checklist (rate limiting per route group, RBAC audit, encryption, audit logs, backups, file validation).
- Skeleton-loader pass on all data/AI-generation-dependent views.
- Run the full Demo Scenario end-to-end (mvp.md §31: urgent 20,000-brochure order).
- Load-test critical endpoints (order creation, feasibility, dashboard).

**Exit criteria:** Demo Scenario runs cleanly; Security.md checklist fully green; success metrics instrumented (see PRD.md §8).

## Phase 8 — Post-MVP Roadmap (not built now, tracked only)
- **Phase 8a:** Multiple printing factories, deeper multi-tenancy, integrations, advanced supplier analytics.
- **Phase 8b:** Expand beyond printing — packaging, garments, furniture, food, electronics, auto components.
- **Phase 8c:** IoT and machine telemetry.
- **Phase 8d:** Predictive maintenance and computer-vision QC.
- **Phase 8e:** Multi-factory optimisation, supplier forecasting, procurement optimisation.

---

## How to Use This File With Memory.md
At the end of each work session or phase milestone, the AI/agent working on the repo should:
1. Update `Memory.md` with what was completed and what file/module is currently in progress.
2. Note here (as a checklist edit, not prose duplication) which phase is active.
