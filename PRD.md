
# PRD.md — Product Requirements Document

## AI Factory Intelligence & Decision Support System

---

## 1. What to Build

An **owner-centric decision-intelligence layer** for Indian printing factories/MSMEs — not a full ERP replacement.

**Core loop:** `OBSERVE → UNDERSTAND → PREDICT → RECOMMEND → ACT → LEARN`

The product must continuously answer:
1. What is happening?
2. What is going wrong?
3. What is likely to go wrong?
4. Why?
5. What should I do next?

**USP:** *"You run the factory. The software runs the complexity."*

**Success principle:** the owner identifies the factory's most important issues within 30 seconds of opening the dashboard.

### Product Principles (non-negotiable)
1. Owner first, not ERP first.
2. Minimum input, maximum insight.
3. Every alert leads to an action.
4. AI explains; deterministic services calculate.
5. Human approval required for critical decisions.
6. Never fake certainty — show ranges/confidence instead.
7. Simple enough for a minimally trained worker.
8. Every recommendation must be traceable to data.
9. Build one excellent printing workflow before expanding to other industries.
10. Add no feature unless it reduces complexity or improves a measurable decision.

### Non-Goals for MVP
Do **not** attempt: full accounting/ERP replacement, machine control, guaranteed predictive maintenance, computer-vision QC, autonomous scheduling, WhatsApp integration, advanced procurement automation, multi-factory optimisation, advanced IoT telemetry.

---

## 2. Targeted Users

| Role | Access | Primary Actions |
|---|---|---|
| **Owner/Admin** | Full visibility | Order creation, AI recommendation approval, profitability, risks, reports, Copilot |
| **Supervisor** | Operational | Production updates, job assignment, machine problems, quantities, worker/machine monitoring, completion |
| **Worker/Operator** | Restricted (1–2 taps) | START JOB / PAUSE / REPORT PROBLEM / ADD WASTE / COMPLETE JOB — QR + voice preferred |
| **Customer (optional)** | Read-only status | Order stage tracking: Received → Design Approved → Material Ready → Printing → Cutting → Finishing → QC → Packing → Dispatched |

**Initial industry:** Indian printing factories/MSMEs. Later phases expand to packaging, garments, furniture, food, electronics, auto components (see Phases.md).

---

## 3. Features

### 3.1 Factory Onboarding (6-step wizard)
Factory Profile → Machines → Materials → Products/Processes → Employees → Suppliers.
`Usable Stock = Current Stock − Reserved Stock − Damaged/Unusable Stock`

### 3.2 Minimal Daily Input
Primary input = **New Order** (customer, product, quantity, deadline, specs, instructions, optional file/priority/price).
Input methods: Form, Voice, PDF/Image, Excel/CSV, (Future: WhatsApp).
AI extracts fields from voice/PDF and **must ask for confirmation** before creating the order.

### 3.3 Owner Dashboard
- Header greeting + Factory Health tiles (orders on track/at risk/critical, machines running/down, inventory ready %, shortages, today's dispatches).
- **Top 3 Things That Need Attention** — each card: Problem, Why, Impact, Recommendation, Confidence, Data/time basis, with VIEW/ACCEPT actions.
- Today's production summary, efficiency, order/machine status breakdown, due-today/tomorrow list.

### 3.4 Order Management
Filterable list (All/New/In Production/At Risk/Delayed/Completed/Dispatched). Order card shows ID, customer, product, quantity, deadline, stage, progress %, risk, expected completion, AI reason.

### 3.5 AI Order Feasibility Engine (primary differentiator)
Evaluates 14 factors (material, stock, machine capacity/availability, existing orders, deadline, manpower, setup/production time, expected wastage, finishing capacity, dispatch constraints, cost, profitability) and returns **SAFE / POSSIBLE WITH RISK / NOT RECOMMENDED** with alternatives, confidence, and completion estimate.
**Critical rule: calculations must be deterministic/auditable — the LLM explains, it never invents numbers.**

### 3.6 Smart Production Scheduling
Suggests job priority, machine, start/completion, setup, operator. Includes a **What-If Simulator** ("Add Urgent Order") that simulates impact and recommends the least damaging schedule. Owner approval required for changes.

### 3.7 Live Production Tracking
Stage pipeline: Received → Design Approved → Material Ready → Printing → Cutting → Finishing → QC → Packing → Dispatch.
Worker actions: START / PAUSE / PROBLEM / ADD WASTE / COMPLETE.

### 3.8 Inventory Intelligence
Current/reserved/usable/damaged/minimum stock, expected consumption, incoming stock, predicted shortage with recommended purchase and shortage date.

### 3.9 Machine Dashboard
Status, current job, utilisation, actual vs expected output, downtime, setup time, maintenance — insights use a defined baseline and comparison period.

### 3.10 Downtime & Bottlenecks
Categorised (Breakdown/Setup/Material Waiting/Operator Unavailable/Quality/Rework/Maintenance/Other). Daily planned-vs-actual report with attributed losses, based only on recorded events.

### 3.11 Wastage & Rework
Tracks planned/produced/rejected/waste/rework + reason. Pattern detection only shown when sample size is sufficient (with sample size and comparison period disclosed).

### 3.12 Job Profitability
Revenue, estimated cost (material, labour, machine time, electricity, setup, waste, rework, transport, other), contribution, margin %, data completeness/confidence. Shows a **range** instead of fake precision when data is incomplete.

### 3.13 Supplier Intelligence
Price, on-time %, rejection %, lead time, delays, materials — recommendations based on total operational value, not lowest price alone.

### 3.14 Maintenance (MVP)
Schedule, operating hours, last/next maintenance, issue history. No predictive-failure claims without sufficient data (IoT/anomaly detection is later phase).

### 3.15 Factory Memory
Searchable knowledge base: text, voice notes, photos, machine tips, process instructions, troubleshooting. AI must distinguish factory-specific knowledge from generic knowledge.

### 3.16 Daily AI Briefing
- **Morning:** factory status, top risks, recommendations, dispatches, shortages, machine risks, at-risk orders.
- **Evening:** production vs plan, completed/delayed orders, downtime, waste, rework, inventory issues, production value estimate, major problems, tomorrow's risks.

### 3.17 Notifications
Three levels: CRITICAL / IMPORTANT / INFORMATIONAL. Related events are grouped into one actionable recommendation to avoid spam.

### 3.18 Factory Copilot
Answers questions like "Which orders are at risk?", "Can I accept this order?", "Which machine is underperforming?" etc. Every important answer includes: answer, reason, data used, timestamp, confidence/uncertainty, recommended action, linked record. Must say so if data is insufficient.

### 3.19 AI Design Split
- **GenAI (language layer):** order entry from natural language, PDF/image/voice extraction, knowledge search, summaries, risk explanations, Q&A, recommendation explanations.
- **Deterministic (calculation layer):** inventory, capacity, scheduling constraints, cost, profit, deadlines, utilisation. The LLM must call structured tools/services for these — never compute them itself.

---

## 4. MVP Scope (build only)
1. Authentication
2. Factory onboarding
3. Owner dashboard
4. Machine setup
5. Inventory setup
6. Product/process setup
7. Order creation
8. AI feasibility
9. Production scheduling
10. Live order tracking
11. Basic machine status
12. Basic waste/downtime
13. Daily AI briefing
14. Factory Copilot
15. Basic reports

## 5. MVP Screens (21)
Login, Factory Onboarding, Owner Dashboard, Orders, New Order, Order Details, AI Feasibility Result, Production Planning, Production Board, Inventory, Machines, Machine Details, Downtime/Waste, Profitability, Factory Copilot, Factory Memory, Daily Reports, Settings, Worker Home, Worker Job Action Screen, Worker Problem/Waste Report.

## 6. Demo Scenario (primary MVP demo)
Printing factory with 5 existing orders, 4 machines, several materials. Urgent order: 20,000 brochures, deadline 25 Aug. AI evaluates all constraints → **POSSIBLE WITH RISK** → Options: (A) Machine 4 → 25 Aug, (B) Overtime → 25 Aug higher cost, (C) Normal → 27 Aug. Owner picks A → system updates schedule, machine allocation, completion estimate, risk, dashboard, alerts.

## 7. Acceptance Criteria
- Factory setup in under 15 minutes for a demo factory.
- New order created in under 2 minutes.
- Ambiguous AI-extracted fields always require confirmation.
- Feasibility evaluates material/capacity/schedule/deadline and returns explanation + alternatives.
- Dashboard immediately surfaces top risks.
- Worker's common action takes 1–2 taps.
- Copilot only accesses authorised factory data, cites records/timestamps, and admits insufficient data.
- Critical schedule changes require owner approval.
- Factory data is isolated by tenant.

## 8. Success Metrics
Daily planning time, time collecting production updates, late-order rate, feasibility decision time, inventory accuracy, material shortage incidents, downtime, utilisation, waste, rework, owner active usage, worker action completion, recommendation acceptance, recommendation accuracy, false-alert rate.
