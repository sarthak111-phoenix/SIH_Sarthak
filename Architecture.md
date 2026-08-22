# Architecture.md — App Flow & System Architecture

> This is a starting proposal derived from mvp.md §27, §25, §26. Tech stack choices marked 🔶 are **open decisions** — confirm before heavy implementation (see Phases.md Phase 0).

---

## 1. High-Level AI Architecture

```text
Frontend
   ↓
Backend API
   ↓
Factory Data Services
   ↓
Deterministic Decision Engine
   ├─ Inventory# Architecture.md — App Flow & System Architecture

> This is a starting proposal derived from mvp.md §27, §25, §26. Tech stack choices marked 🔶 are **open decisions** — confirm before heavy implementation (see Phases.md Phase 0).

---

## 1. High-Level AI Architecture

```text
Frontend
   ↓
Backend API
   ↓
Factory Data Services
   ↓
Deterministic Decision Engine
   ├─ Inventory
   ├─ Capacity
   ├─ Scheduling
   ├─ Cost
   └─ Risk
   ↓
AI Orchestration
   ↓
LLM
   ↓
Structured Explanation / Recommendation
```

**Hard rule:** the LLM never directly modifies critical production records, and never invents a number. All business math (cost, capacity, risk, scheduling) lives in the Deterministic Decision Engine as callable, testable, auditable services/tools. The LLM's job is orchestration, extraction (voice/PDF/CSV → structured fields), explanation, and natural-language Q&A over data the deterministic layer already computed. Critical actions always require explicit user confirmation.

## 2. Request Flow Example — "AI Order Feasibility"

1. Owner submits a new order (form/voice/PDF/CSV).
2. Backend API validates + persists a draft order (factory-scoped).
3. If input was voice/PDF/CSV, an **extraction service** (LLM-backed) parses fields and returns them for **user confirmation** — never auto-commits ambiguous fields.
4. On confirm, Backend API calls the **Deterministic Decision Engine** (Feasibility service) which checks the 14 factors (material, stock, machine capacity/availability, existing orders, deadline, manpower, setup/production time, wastage, finishing capacity, dispatch, cost, profitability) against factory data.
5. Engine returns a structured result: `SAFE | POSSIBLE_WITH_RISK | NOT_RECOMMENDED` + numeric confidence + alternatives array.
6. AI Orchestration layer sends the structured result to the LLM **only to generate a natural-language explanation** — the LLM does not alter the numbers.
7. Frontend renders result with VIEW/ACCEPT actions; owner approval is required to commit any schedule/machine change.
8. All of this is written to `AuditLogs`.

## 3. Frontend ↔ Backend Contract

- Frontend never talks to the LLM or database directly — always through Backend API.
- Every API response that includes an AI-derived claim carries: `data_basis`, `confidence`, `timestamp`, `linked_record_id`.
- Role-based UI: Owner/Supervisor/Worker/Customer see different navigation and screen sets (see PRD.md §2, §5).

## 4. Multi-Tenancy Model

- Every operational table carries `factory_id`. All queries are scoped by the authenticated user's `factory_id` — enforced at the data-access layer, not just in application code (defense in depth).
- No cross-factory reads, including for AI Copilot and Factory Memory retrieval (see Security.md).

## 5. Tech Stack 🔶 (proposed — confirm in Phase 0)

| Layer | Proposed | Notes |
|---|---|---|
| Frontend | React (or React Native/Expo for worker mobile-first flows) | Mobile-first, large touch targets, minimal forms |
| Backend API | Node.js (NestJS/Express) or Python (FastAPI) | Needs strong typing/validation for deterministic services |
| Deterministic Decision Engine | Same backend runtime, isolated service/module layer | Must be independently unit-testable, no LLM calls inside |
| Database | PostgreSQL | Relational integrity for factory/orders/inventory; row-level security for tenant isolation |
| Cache/Queue | Redis | Rate limiting, session store, offline-sync queue, job queue |
| LLM Provider | Anthropic Claude via API | Extraction, explanation, Copilot Q&A only — never raw calculations |
| File/Voice/OCR | Object storage (S3-compatible) + OCR/speech-to-text provider | For PDF/image/voice order intake |
| Auth | JWT/session-based, RBAC middleware | See Rules.md, Security.md |
| Hosting | Cloud VM/PaaS 🔶 | TBD — depends on pilot budget |
| Realtime updates | WebSocket or polling for dashboard/production board | Machine/order status changes |

## 6. Folder & File Structure (proposed)

```text
/backend
  /src
    /modules
      /auth
      /factories
      /users
      /machines
      /materials
      /inventory
      /suppliers
      /products
      /processes
      /customers
      /orders
      /production
      /downtime
      /waste
      /maintenance
      /profitability
      /knowledge          # Factory Memory
      /notifications
      /reports
      /ai
        /feasibility       # deterministic engine + LLM explanation wrapper
        /schedule          # deterministic engine + LLM explanation wrapper
        /copilot           # LLM Q&A orchestration, tool-calling into deterministic services
        /briefing          # daily briefing generator
        /extraction        # voice/PDF/CSV → structured order fields
    /deterministic-engine   # pure business logic, no LLM, fully unit-tested
      /inventory
      /capacity
      /scheduling
      /cost
      /risk
    /middleware
      /rbac.ts
      /tenant-isolation.ts
      /rate-limit.ts
      /audit-log.ts
    /db
      /migrations
      /models
    /jobs                   # offline-sync queue processors, scheduled briefings
    main.ts
  /test
/frontend
  /src
    /screens
      /owner
      /supervisor
      /worker
      /customer
    /components
      /skeleton-loaders     # see Security.md loading/latency section
    /hooks
    /services               # API clients
    /state
  /public
/docs
  PRD.md
  Architecture.md
  Rules.md
  Phases.md
  Design.md
  Memory.md
  Security.md
```

## 7. Database Model (core entities)

`Factory, Users, Roles, Machines, MachineCapabilities, Employees, Materials, Inventory, Suppliers, Products, Processes, Customers, Orders, OrderItems, ProductionJobs, ProductionStages, MachineDowntime, Waste, Rework, QualityChecks, Maintenance, Costs, JobProfitability, FactoryKnowledge, Notifications, AIRecommendations, AuditLogs`

- Operational records include `id`, `factory_id`, `created_at`, `updated_at`.
- Historical records (schedule changes, feasibility results, recommendations) must be auditable — never hard-deleted, use append-only or soft-delete + AuditLogs.

## 8. API Domains

```
/auth  /factories  /users  /machines  /materials  /inventory  /suppliers
/products  /processes  /customers  /orders  /production  /downtime  /waste
/maintenance  /profitability  /knowledge  /ai/feasibility  /ai/schedule
/ai/copilot  /ai/briefing  /notifications  /reports
```

All protected endpoints use role-based authorisation (see Security.md).

## 9. Offline / Connectivity (Worker flows)

- Worker actions (START/PAUSE/PROBLEM/ADD WASTE/COMPLETE) queue locally when offline.
- Sync on reconnect with idempotency keys to prevent duplicate events.
- UI shows sync status per queued action.
   ├─ Capacity
   ├─ Scheduling
   ├─ Cost
   └─ Risk
   ↓
AI Orchestration
   ↓
LLM
   ↓
Structured Explanation / Recommendation
```

**Hard rule:** the LLM never directly modifies critical production records, and never invents a number. All business math (cost, capacity, risk, scheduling) lives in the Deterministic Decision Engine as callable, testable, auditable services/tools. The LLM's job is orchestration, extraction (voice/PDF/CSV → structured fields), explanation, and natural-language Q&A over data the deterministic layer already computed. Critical actions always require explicit user confirmation.

## 2. Request Flow Example — "AI Order Feasibility"

1. Owner submits a new order (form/voice/PDF/CSV).
2. Backend API validates + persists a draft order (factory-scoped).
3. If input was voice/PDF/CSV, an **extraction service** (LLM-backed) parses fields and returns them for **user confirmation** — never auto-commits ambiguous fields.
4. On confirm, Backend API calls the **Deterministic Decision Engine** (Feasibility service) which checks the 14 factors (material, stock, machine capacity/availability, existing orders, deadline, manpower, setup/production time, wastage, finishing capacity, dispatch, cost, profitability) against factory data.
5. Engine returns a structured result: `SAFE | POSSIBLE_WITH_RISK | NOT_RECOMMENDED` + numeric confidence + alternatives array.
6. AI Orchestration layer sends the structured result to the LLM **only to generate a natural-language explanation** — the LLM does not alter the numbers.
7. Frontend renders result with VIEW/ACCEPT actions; owner approval is required to commit any schedule/machine change.
8. All of this is written to `AuditLogs`.

## 3. Frontend ↔ Backend Contract

- Frontend never talks to the LLM or database directly — always through Backend API.
- Every API response that includes an AI-derived claim carries: `data_basis`, `confidence`, `timestamp`, `linked_record_id`.
- Role-based UI: Owner/Supervisor/Worker/Customer see different navigation and screen sets (see PRD.md §2, §5).

## 4. Multi-Tenancy Model

- Every operational table carries `factory_id`. All queries are scoped by the authenticated user's `factory_id` — enforced at the data-access layer, not just in application code (defense in depth).
- No cross-factory reads, including for AI Copilot and Factory Memory retrieval (see Security.md).

## 5. Tech Stack 🔶 (proposed — confirm in Phase 0)

| Layer | Proposed | Notes |
|---|---|---|
| Frontend | React (or React Native/Expo for worker mobile-first flows) | Mobile-first, large touch targets, minimal forms |
| Backend API | Node.js (NestJS/Express) or Python (FastAPI) | Needs strong typing/validation for deterministic services |
| Deterministic Decision Engine | Same backend runtime, isolated service/module layer | Must be independently unit-testable, no LLM calls inside |
| Database | PostgreSQL | Relational integrity for factory/orders/inventory; row-level security for tenant isolation |
| Cache/Queue | Redis | Rate limiting, session store, offline-sync queue, job queue |
| LLM Provider | Anthropic Claude via API | Extraction, explanation, Copilot Q&A only — never raw calculations |
| File/Voice/OCR | Object storage (S3-compatible) + OCR/speech-to-text provider | For PDF/image/voice order intake |
| Auth | JWT/session-based, RBAC middleware | See Rules.md, Security.md |
| Hosting | Cloud VM/PaaS 🔶 | TBD — depends on pilot budget |
| Realtime updates | WebSocket or polling for dashboard/production board | Machine/order status changes |

## 6. Folder & File Structure (proposed)

```text
/backend
  /src
    /modules
      /auth
      /factories
      /users
      /machines
      /materials
      /inventory
      /suppliers
      /products
      /processes
      /customers
      /orders
      /production
      /downtime
      /waste
      /maintenance
      /profitability
      /knowledge          # Factory Memory
      /notifications
      /reports
      /ai
        /feasibility       # deterministic engine + LLM explanation wrapper
        /schedule          # deterministic engine + LLM explanation wrapper
        /copilot           # LLM Q&A orchestration, tool-calling into deterministic services
        /briefing          # daily briefing generator
        /extraction        # voice/PDF/CSV → structured order fields
    /deterministic-engine   # pure business logic, no LLM, fully unit-tested
      /inventory
      /capacity
      /scheduling
      /cost
      /risk
    /middleware
      /rbac.ts
      /tenant-isolation.ts
      /rate-limit.ts
      /audit-log.ts
    /db
      /migrations
      /models
    /jobs                   # offline-sync queue processors, scheduled briefings
    main.ts
  /test
/frontend
  /src
    /screens
      /owner
      /supervisor
      /worker
      /customer
    /components
      /skeleton-loaders     # see Security.md loading/latency section
    /hooks
    /services               # API clients
    /state
  /public
/docs
  PRD.md
  Architecture.md
  Rules.md
  Phases.md
  Design.md
  Memory.md
  Security.md
```

## 7. Database Model (core entities)

`Factory, Users, Roles, Machines, MachineCapabilities, Employees, Materials, Inventory, Suppliers, Products, Processes, Customers, Orders, OrderItems, ProductionJobs, ProductionStages, MachineDowntime, Waste, Rework, QualityChecks, Maintenance, Costs, JobProfitability, FactoryKnowledge, Notifications, AIRecommendations, AuditLogs`

- Operational records include `id`, `factory_id`, `created_at`, `updated_at`.
- Historical records (schedule changes, feasibility results, recommendations) must be auditable — never hard-deleted, use append-only or soft-delete + AuditLogs.

## 8. API Domains

```
/auth  /factories  /users  /machines  /materials  /inventory  /suppliers
/products  /processes  /customers  /orders  /production  /downtime  /waste
/maintenance  /profitability  /knowledge  /ai/feasibility  /ai/schedule
/ai/copilot  /ai/briefing  /notifications  /reports
```

All protected endpoints use role-based authorisation (see Security.md).

## 9. Offline / Connectivity (Worker flows)

- Worker actions (START/PAUSE/PROBLEM/ADD WASTE/COMPLETE) queue locally when offline.
- Sync on reconnect with idempotency keys to prevent duplicate events.
- UI shows sync status per queued action.
