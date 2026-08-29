# API Architecture & Contract Specification — Phase 0

> **Platform:** Universal Factory Platform  
> **Status:** LOCKED (Phase 0 Complete)  

---

## 1. REST & Server Action Conventions

All backend interactions use either Next.js Route Handlers (`/app/api/...`) or Server Actions (`/src/services/...`).

### 1.1 Response Envelope
All API responses MUST adopt the standard envelope format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": {
    "timestamp": "2026-08-23T11:44:20Z",
    "requestId": "req_8f92a10b",
    "factoryId": "fact_01h9x3"
  }
}
```

In error scenarios (`success: false`):
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Paper inventory is 500 sheets below required 2,000 sheets.",
    "details": { "materialId": "mat_123", "required": 2000, "usable": 1500 }
  },
  "metadata": {
    "timestamp": "2026-08-23T11:44:20Z",
    "requestId": "req_8f92a10b",
    "factoryId": "fact_01h9x3"
  }
}
```

### 1.2 Mandatory AI Claim Metadata
Every endpoint returning an AI-derived output or natural language explanation MUST append `aiBasis` metadata:

```json
{
  "aiBasis": {
    "dataBasis": ["Machine #4 Capacity Log", "Inventory Stock #Mat-99"],
    "confidence": 0.91,
    "timestamp": "2026-08-23T11:44:20Z",
    "linkedRecordId": "ord_102"
  }
}
```

---

## 2. API Endpoint Inventory

### Auth & Onboarding (`/api/auth`, `/api/onboarding`)
- `POST /api/auth/login` — Session creation with credentials.
- `POST /api/auth/logout` — Terminate session.
- `GET /api/auth/me` — Return authenticated user profile and permissions.
- `POST /api/onboarding/step` — Save progress in 6-step onboarding wizard.

### Orders & Intake (`/api/orders`)
- `GET /api/orders` — List factory orders with filter, sort, and pagination.
- `POST /api/orders/manual` — Submit order via manual form.
- `POST /api/orders/voice` — Process audio stream → LLM field extraction → `OrderDraft`.
- `POST /api/orders/ocr` — Upload PDF/image → OCR & LLM extraction → `OrderDraft`.
- `POST /api/orders/csv` — Upload CSV → schema mapping & duplicate check → preview.
- `POST /api/orders/confirm-draft` — User confirmation of draft order fields.

### Deterministic Engine & Feasibility (`/api/feasibility`)
- `POST /api/feasibility/evaluate` — Trigger 14-factor deterministic feasibility check on order.
- `POST /api/feasibility/approve` — Owner selects Option A/B/C and commits schedule changes.

### Production & Scheduling (`/api/production`)
- `GET /api/production/board` — Get 9-stage kanban view.
- `POST /api/production/stage-update` — Worker/Supervisor update job stage.
- `POST /api/production/what-if` — Simulate urgent order impact without committing.
- `POST /api/production/sync-offline` — Batch endpoint for offline worker action sync (Idempotent).

### Inventory Intelligence (`/api/inventory`)
- `GET /api/inventory/usable` — Usable stock levels across materials.
- `GET /api/inventory/shortage-predictions` — Projected shortage dates & purchase recommendations.
- `POST /api/inventory/adjust` — Restock or adjust damaged stock.

### Machines & Downtime (`/api/machines`)
- `GET /api/machines/status` — Live machine utilization & state.
- `POST /api/machines/downtime` — Log downtime event (Breakdown, Setup, etc.).

### Job Profitability (`/api/profitability`)
- `GET /api/profitability/:orderId` — Full cost breakdown & profit confidence range.

### Supplier Intelligence (`/api/suppliers`)
- `GET /api/suppliers/scores` — Weighted supplier reliability rankings.

### Factory Copilot & Memory (`/api/copilot`, `/api/memory`)
- `POST /api/copilot/chat` — Natural language Copilot interaction calling controlled tools.
- `GET /api/memory/search` — Search factory knowledge base & SOPs.

---

## 3. Rate Limiting Tiers

| Tier | Window | Max Requests | Endpoints |
|---|---|---|---|
| **Authentication** | 1 Minute | 10 | `/api/auth/login` |
| **AI / Copilot** | 1 Minute | 30 | `/api/copilot/chat`, `/api/orders/voice` |
| **OCR / Uploads** | 1 Minute | 15 | `/api/orders/ocr`, `/api/orders/csv` |
| **General API** | 1 Minute | 300 | All standard CRUD & board endpoints |
