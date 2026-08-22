# Rules.md — Engineering & AI Rules

These rules bind every contributor (human or AI) working in this repo. When Rules.md conflicts with a shortcut that seems convenient, Rules.md wins.

---

## 1. What to Use

- **Deterministic engine for all business math.** Inventory, capacity, scheduling, cost, profit, deadlines, utilisation calculations live only in `/deterministic-engine`, are pure functions where possible, and are unit-tested.
- **Structured tool-calling for the LLM.** The LLM reaches business data only through defined tool/service interfaces (typed inputs/outputs). No free-text-to-SQL, no LLM writing raw queries against production tables.
- **Confirmation step for all AI-extracted input.** Voice/PDF/CSV/OCR extraction always returns a draft for the user to confirm before it becomes a real order/record.
- **Factory-scoped queries everywhere.** Every data access includes `factory_id` scoping, enforced at the data-access layer (not just controller-level checks).
- **Idempotency keys** for worker actions and any endpoint that can be retried (mobile/offline sync).
- **Typed schemas/validation** on every API boundary (request and response).
- **Confidence + data-basis metadata** on every AI-derived output shown to a user (feasibility results, recommendations, Copilot answers, briefings).
- **Audit logging** for: schedule changes, feasibility overrides, recommendation accept/reject, profitability recalculations, auth events, role changes.
- **Environment variables / secrets manager** for all credentials and API keys.
- **Skeleton loaders** for any view that fetches data or waits on AI generation (see Design.md, Security.md).

## 2. What to Avoid

### Libraries / Patterns
- ❌ No ORMs or query builders that bypass tenant-scoping middleware.
- ❌ No client-side-only validation for critical fields (deadlines, quantities, prices) — always re-validate server-side.
- ❌ No unpinned/unaudited npm packages for anything touching auth, payments, or file parsing (PDF/OCR) — pin versions, review before adding.
- ❌ No global mutable state for multi-tenant data (e.g. no in-memory caches keyed without `factory_id`).
- ❌ No storing files (order PDFs, photos, voice notes) directly in the database — use object storage with signed URLs.
- ❌ No `localStorage`/`sessionStorage` reliance for anything that must survive across devices — Worker offline queue uses a proper local queue mechanism, not raw browser storage as source of truth.

### Error Handling
- ❌ Never swallow errors silently — no empty `catch {}` blocks.
- ❌ Never expose raw stack traces, DB errors, or internal identifiers to the frontend/user. Return sanitized error codes + user-safe messages; log full detail server-side.
- ✅ Every external call (LLM, OCR, voice, third-party API) has a timeout + retry-with-backoff + a defined fallback (e.g. "extraction failed — please use the form").
- ✅ Deterministic engine failures (e.g. missing material data) must produce an explicit "insufficient data" result — never a silent default or fabricated number.

### Boundaries for AI (LLM usage)
- ❌ **The LLM must never invent numbers.** Cost, capacity, risk %, dates, quantities always come from the deterministic engine. The LLM explains/paraphrases them.
- ❌ **The LLM must never directly write to critical production records** (orders, schedules, inventory, profitability). It can propose a change; a human or a deterministic-engine-validated action commits it.
- ❌ **The LLM must never claim predictive maintenance/failure without sufficient recorded data** — say "insufficient data" instead.
- ❌ **The LLM must not fabricate pattern/trend claims** (wastage, downtime) without a disclosed sample size and comparison period.
- ❌ **Factory Copilot must never answer from another factory's data** — tool calls are always scoped by the authenticated `factory_id`.
- ❌ **The LLM must not fake certainty.** If data is incomplete, show a range or say so explicitly — never round to false precision.
- ✅ Every Copilot/briefing/recommendation answer includes: answer, reason, data used, timestamp, confidence/uncertainty, recommended action, and a linked record reference.
- ✅ Critical actions (schedule changes, order commitments, overtime approval) always require explicit human confirmation before taking effect.

## 3. Code Quality Baseline
- Consistent formatting/linting enforced in CI (not just editor config).
- No feature merges without at least a basic test for: the deterministic calculation it touches, and the tenant-isolation check on its endpoint.
- New AI-facing endpoints must document their tool schema (inputs/outputs) in-repo.

## 4. When Rules Are Unclear
If a new situation isn't covered here, default to the most conservative option:
- Prefer explicit confirmation over silent automation.
- Prefer showing a range/"insufficient data" over a confident-looking guess.
- Prefer failing loudly (logged, safe error) over failing silently.
- Update this file once a new rule is agreed, so the next contributor (including an AI) doesn't relitigate it. Record the update in Memory.md.
