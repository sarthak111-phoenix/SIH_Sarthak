# Architecture & Technology Lock Specification — Phase 0

> **Platform:** Universal Factory Platform (AI Factory Intelligence & Operational OS)  
> **Status:** LOCKED (Phase 0 Complete)  
> **Version:** 1.0.0  

---

## 1. System Overview & Core Principles

The **Universal Factory Platform** is a multi-tenant, owner-centric factory intelligence and operational system. It combines deterministic operational decision-making with AI-assisted natural language explanations, multi-channel order intake, live production execution, smart scheduling, inventory intelligence, offline worker execution, and automated briefings.

### Architectural Core Principles

1. **Separation of Calculations and Language (Deterministic Engine Rule):**
   - **Calculations:** Capacity, inventory availability, feasibility scoring, deadline margins, job profitability ranges, supplier scores, and smart schedules are computed **100% deterministically** by pure TypeScript services in `/src/deterministic-engine`.
   - **Language & Orchestration:** LLMs (accessed via `/src/ai`) are strictly limited to intent detection, voice/PDF/CSV field extraction, natural language explanations of pre-computed deterministic results, and Q&A using controlled tools.
   - **Zero Hallucinated Numbers:** LLMs NEVER perform arithmetic, estimate capacities, or invent financial figures.

2. **Strict Multi-Tenancy (Tenant Isolation):**
   - Every operational record belongs to a `factory_id`.
   - Data isolation is enforced at multiple layers (Auth → Factory Scope Middleware → Service Layer → Query Filter).
   - Factory A can NEVER query, mutate, infer, or search Factory B data (including vector/memory stores).

3. **Human-in-the-Loop Confirmation:**
   - AI extraction from PDF, Image, Voice, or CSV creates a draft state with confidence flags (`OrderDraft`). Ambiguous fields MUST be confirmed by a human before committing.
   - Feasibility alternatives (Options A/B/C) and schedule adjustments require explicit owner approval.

4. **Offline First for Workers:**
   - Worker mobile actions (START, PAUSE, PROBLEM, WASTE, COMPLETE) operate offline via local storage queues and sync idempotently upon reconnection.

---

## 2. Locked Technology Stack

| Layer | Selected Technology | Rationale & Usage |
|---|---|---|
| **Framework** | Next.js 15+ (App Router) | Server Actions, Route Handlers, SSR, Streaming, edge/node runtime hybrid. |
| **Language** | TypeScript (Strict Mode) | Full type-safety across database models, server actions, deterministic services, and frontend UI. |
| **Frontend UI** | React 19, Tailwind CSS, shadcn/ui | Modern, high-density dark metallic design system, responsive touch targets for mobile worker flows. |
| **Icons** | Lucide React | Standardized UI icon set. |
| **Database** | PostgreSQL | Relational integrity, ACID compliance for inventory/orders/financials, jsonb support. |
| **ORM** | Prisma ORM | Type-safe query building, migrations, transaction management. |
| **Validation** | Zod | Schema validation at API boundaries, form inputs, server actions, and AI tool outputs. |
| **AI Abstraction Layer** | Provider-agnostic API Client (`/src/ai/provider.ts`) | Decoupled LLM integration (supports Gemini / Claude / OpenAI / local models) with fallback handlers. |
| **Offline Sync** | IndexedDB / LocalStorage + Service Worker PWA | Offline queue with idempotent mutation handlers for worker mobile views. |
| **Testing** | Vitest & Testing Library | 100% coverage target for `/src/deterministic-engine`, tenant isolation security tests, unit & integration tests. |

---

## 3. Directory Structure

```text
/home/buyer/Desktop/SIH_Sarthak/
├── /docs                       # Phase documentation (Architecture, Database, API, Security, Deterministic Engine)
├── /prisma                     # Database schema & migrations
│   ├── schema.prisma
│   └── seed.ts
├── /public                     # Static assets & PWA manifest
├── /src
│   ├── /ai                     # AI Abstraction Layer
│   │   ├── provider.ts         # Multi-provider LLM interface
│   │   ├── /prompts            # System prompts & structured templates
│   │   ├── /tools              # Controlled backend tools callable by AI Copilot
│   │   ├── /schemas            # Zod response schemas for LLM outputs
│   │   ├── /embeddings         # Vector/embedding helpers for Factory Memory
│   │   └── /copilot            # Copilot orchestration engine
│   ├── /app                    # Next.js App Router Pages & API Routes
│   │   ├── (auth)              # Authentication routes (login, onboarding)
│   │   ├── /dashboard          # Owner Dashboard & Health Scan
│   │   ├── /orders             # Order Management & Feasibility UI
│   │   ├── /production         # Live Production Board & Scheduling
│   │   ├── /inventory          # Inventory Intelligence & Shortage Predictions
│   │   ├── /machines           # Machine Dashboard & Downtime Analytics
│   │   ├── /employees          # Workforce Management
│   │   ├── /suppliers          # Supplier Intelligence & Reliability Scoring
│   │   ├── /maintenance        # Machine Maintenance Management
│   │   ├── /profitability      # Job Profitability & Cost Breakdown
│   │   ├── /copilot            # Factory Copilot Interactive Interface
│   │   ├── /factory-memory     # Knowledge Base & SOP Storage
│   │   ├── /notifications       # Aggregated Risk & Notification Center
│   │   ├── /customers          # Customer Order Tracking Portal
│   │   ├── /mobile             # Mobile Worker Optimized Screen (PWA)
│   │   ├── /api                # REST Route Handlers
│   │   └── layout.tsx
│   ├── /components             # UI Components
│   │   ├── /ui                 # Base shadcn primitives (Button, Card, Dialog, etc.)
│   │   ├── /dashboard          # Dashboard tiles, top 3 attention cards, briefings
│   │   ├── /orders             # Intake forms, voice/file dropzones, feasibility options
│   │   ├── /production         # 9-stage kanban board, job assignment cards
│   │   ├── /inventory          # Stock level indicators, reorder dialogs
│   │   ├── /machines           # Utilization gauges, downtime logger
│   │   ├── /mobile             # Large-touch 1-tap worker buttons, offline queue banner
│   │   └── /ai                 # Copilot chat widget, AI briefing dialog
│   ├── /deterministic-engine   # Pure Deterministic Business Logic (NO LLM DEPENDENCIES)
│   │   ├── feasibility.ts      # 14-factor order feasibility evaluation
│   │   ├── capacity.ts         # Machine capacity calculation
│   │   ├── inventory.ts        # Usable stock & projected shortage date logic
│   │   ├── profitability.ts    # Job cost & profit range calculator
│   │   ├── supplier.ts         # Weighted supplier reliability scoring
│   │   ├── scheduling.ts       # Smart scheduling & What-If simulator engine
│   │   └── risk.ts             # Aggregated risk score & grouping
│   ├── /lib                    # Core Infrastructure Utilities
│   │   ├── auth.ts             # Session & Auth helper
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── validation.ts       # Shared Zod validation helpers
│   │   ├── permissions.ts      # RBAC role matrix definitions
│   │   ├── notifications.ts    # Aggregation & grouping engine
│   │   ├── audit.ts            # Audit logging service
│   │   └── offline.ts          # Idempotent offline sync queue handling
│   ├── /middleware             # Server Middlewares
│   │   └── tenant-isolation.ts # Factory scoping & auth token validation
│   ├── /services               # Service Layer (Database & Business Operations)
│   │   ├── orders.ts
│   │   ├── production.ts
│   │   ├── inventory.ts
│   │   ├── machines.ts
│   │   ├── suppliers.ts
│   │   ├── profitability.ts
│   │   ├── maintenance.ts
│   │   ├── scheduling.ts
│   │   └── notifications.ts
│   ├── /types                  # TypeScript Interfaces & Global Types
│   └── /utils                  # Formatting, math, and string utilities
└── /tests                      # Unit, Integration, & Security Test Suites
    ├── /deterministic-engine   # 100% unit tests for calculations
    ├── /security               # Tenant isolation & RBAC tests
    └── /offline                # Sync idempotency tests
```

---

## 4. Coding & Architecture Conventions

### 4.1 Service Layer Pattern
- Controllers / Route Handlers / Server Actions MUST NOT write raw SQL or complex queries inline.
- All database interactions pass through `/src/services/*`.
- Services ALWAYS require explicit `factoryId` parameters to enforce multi-tenancy.

### 4.2 Error Handling & Standard Responses
All API endpoints and Server Actions return a uniform envelope:
```typescript
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    factoryId?: string;
  };
};
```

### 4.3 Input Validation Convention
- Every external input (HTTP body, query parameters, file uploads, server action arguments) is validated against a Zod schema before processing.
- Failed validation returns `HTTP 400 Bad Request` with structured field errors.

---

## 5. Phase 0 Exit Criteria

- [x] Architecture fully documented (`/docs/ARCHITECTURE.md`).
- [x] Database strategy fully documented (`/docs/DATABASE.md`).
- [x] API specifications documented (`/docs/API.md`).
- [x] Security & Tenant Isolation model documented (`/docs/SECURITY.md`).
- [x] Mathematical specifications & Deterministic formulas documented (`/docs/DETERMINISTIC_ENGINE.md`).
- [x] Project environment and repository initialized.
- [x] Build and type-checking verified.
