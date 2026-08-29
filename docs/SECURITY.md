# Security & Tenant Isolation Specification — Phase 0

> **Platform:** Universal Factory Platform  
> **Status:** LOCKED (Phase 0 Complete)  

---

## 1. Multi-Tenant Defense-in-Depth Pipeline

Security and data isolation are enforced using a 5-layer defense-in-depth pipeline:

```text
Layer 1: Authentication (Valid Session JWT / Session Cookie)
               ↓
Layer 2: Factory Membership Verification (User belongs to request factoryId)
               ↓
Layer 3: RBAC Authorization (User role has required permission)
               ↓
Layer 4: Tenant Scope Injection (Service level injects factoryId into queries)
               ↓
Layer 5: Database Query Execution (Prisma query scoped by factoryId)
```

### Absolute Multi-Tenancy Guarantee
Under NO circumstance can an authenticated request for `Factory A`:
- Read `Factory B` records.
- Modify or delete `Factory B` records.
- Access `Factory B` vector embeddings or memory files.
- Infer stats, machine capacities, or supplier scores of `Factory B`.

Automated unit & security tests MUST verify:
`Query Factory A as User A → Factory B returned records = 0`.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Permission Code | Description | Owner / Admin | Supervisor | Worker / Operator | Customer (Read-Only) |
|---|---|:---:|:---:|:---:|:---:|
| `factory:manage` | Edit factory profile & setup | ✅ | ❌ | ❌ | ❌ |
| `order:create` | Submit new orders (Form/Voice/OCR) | ✅ | ✅ | ❌ | ❌ |
| `order:approve` | Approve AI feasibility & commit schedule | ✅ | ❌ | ❌ | ❌ |
| `order:read` | View order status & details | ✅ | ✅ | ✅ | ✅ (Own order) |
| `production:manage` | Reassign jobs & adjust schedules | ✅ | ✅ | ❌ | ❌ |
| `production:execute` | Log job start/pause/problem/waste/done | ✅ | ✅ | ✅ (1-2 taps) | ❌ |
| `inventory:write` | Restock, adjust unusable inventory | ✅ | ✅ | ❌ | ❌ |
| `financials:read` | View job profitability & operational cost | ✅ | ❌ | ❌ | ❌ |
| `copilot:access` | Query Factory Copilot | ✅ | ✅ | ❌ | ❌ |

---

## 3. Input Validation & Zod Enforcer

- Every incoming payload is validated against a strictly typed Zod schema.
- SQL injection prevention is guaranteed by Prisma parameterization.
- File upload validation enforces maximum file size (10MB) and strict MIME type checks (`application/pdf`, `image/jpeg`, `image/png`, `text/csv`).

---

## 4. Audit Logging Specification

All critical state modifications MUST generate an immutable entry in the `AuditLog` table:

```typescript
type AuditLogEntry = {
  id: string;
  factoryId: string;
  userId: string;
  action: 
    | "USER_LOGIN"
    | "ORDER_CREATED"
    | "DRAFT_ORDER_CONFIRMED"
    | "FEASIBILITY_EVALUATED"
    | "FEASIBILITY_APPROVED"
    | "SCHEDULE_MODIFIED"
    | "INVENTORY_ADJUSTED"
    | "MACHINE_DOWNTIME_LOGGED"
    | "PERMISSION_CHANGED";
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
};
```
