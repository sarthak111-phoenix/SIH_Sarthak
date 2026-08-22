# Security.md — Security, Rate Limiting & Reliability Rules

Baseline requirements from mvp.md §32: secure authentication, RBAC, factory-level data isolation, encryption in transit, secure sessions, audit logs, backups, file validation, rate limiting, secrets outside source code, AI data isolation, least privilege. This file expands each into concrete, checkable rules.

---

## 1. Core Security Checklist (recurring, not one-time)

Run this checklist on every release, and on a scheduled cadence (weekly automated scan + monthly manual review) — not just at launch:

- [ ] **Authentication** — passwords hashed (bcrypt/argon2), sessions/tokens expire, refresh-token rotation, MFA available for Owner role at minimum.
- [ ] **RBAC** — every endpoint declares required role(s); a test exists proving Worker cannot hit Owner-only endpoints and vice versa.
- [ ] **Factory-level (tenant) isolation** — every query scoped by `factory_id` at the data-access layer; automated test attempts cross-tenant reads and confirms rejection.
- [ ] **Encryption in transit** — HTTPS/TLS enforced everywhere, HSTS enabled, no mixed content.
- [ ] **Encryption at rest** — database and object storage (files/voice/photos) encrypted at rest.
- [ ] **Secure sessions** — HttpOnly + Secure + SameSite cookies (or equivalent for token storage); no tokens in `localStorage` if avoidable.
- [ ] **Audit logs** — auth events, role changes, schedule changes, feasibility overrides, recommendation accept/reject, profitability recalculation all logged with actor, timestamp, factory_id.
- [ ] **Backups** — automated, tested restores on a schedule (not just "backups exist" — periodically verify a restore actually works).
- [ ] **File validation** — every upload (PDF, image, CSV, voice) is type-checked, size-capped, and scanned before processing; never trust file extension alone.
- [ ] **Rate limiting** — see §2 below.
- [ ] **Secrets management** — no secrets in source, `.env` files gitignored, secrets rotated periodically, secrets manager used in production.
- [ ] **AI data isolation** — LLM/Copilot tool calls scoped by `factory_id`; no prompt can retrieve another factory's data (test this with adversarial prompts, not just normal usage).
- [ ] **Least privilege** — service accounts/API keys scoped to only what they need (e.g. the extraction service can't write to profitability tables).
- [ ] **Dependency scanning** — automated vulnerability scan (e.g. `npm audit`/equivalent) on every build; block merge on critical/high findings.

## 2. Rate Limiting Strategy — Segmented by Page/Route Group

Do **not** apply one global rate limit to the whole app — a spike in one area (e.g. AI feasibility calls) shouldn't degrade an unrelated area (e.g. worker job actions). Rate limits are defined per route group, keyed by `factory_id` + `user_id`, with sensible defaults below (tune during Phase 7 load testing — see Phases.md):

| Route Group | Rationale | Suggested Limit Style |
|---|---|---|
| `/auth/*` | Prevent credential stuffing/brute force | Strict, low ceiling, exponential backoff on repeated failures, temporary lockout + alert after N failed attempts |
| `/orders/*` (create/update) | Normal owner/supervisor usage is bursty but bounded | Moderate per-minute limit |
| `/ai/feasibility`, `/ai/schedule` | Compute + LLM-cost heavy | Lower per-minute limit than plain CRUD; queue rather than hard-reject where possible |
| `/ai/copilot`, `/ai/briefing` | LLM-cost heavy, conversational | Per-user conversational limit (e.g. N messages/minute) distinct from feasibility limit |
| `/production/*` (worker actions: start/pause/problem/waste/complete) | Must stay fast and permissive — workers tap frequently and may retry on flaky connections | Higher ceiling, idempotency-key based dedup instead of aggressive throttling |
| `/inventory/*`, `/machines/*`, `/reports/*` (read-heavy dashboard) | Polling/refresh traffic | Moderate limit, favor caching over throttling for read paths |
| `/uploads/*` (PDF/image/voice/CSV) | Resource-intensive processing | Strict per-user limit + file-size cap, queued processing |

**Implementation notes:**
- Use a shared store (Redis) for limit counters so limits hold across horizontally-scaled instances.
- Return a clear, non-leaky rate-limit response (`429` + `Retry-After`) — never expose internal queue depth or infra details.
- Log rate-limit breaches for the flagging system in §3 — a burst against `/ai/feasibility` from one account is itself a signal, not just a nuisance.

## 3. Misuse & Anomaly Flagging

Track and flag (don't silently block outright, except for clear abuse) the following signal types, scoped per factory/tenant:

- **Signup anomalies:** many signups from the same IP/device in a short window; disposable-email domains; factory onboarding started but abandoned repeatedly then retried rapidly.
- **Activity anomalies:** a single account hitting rate limits repeatedly across multiple route groups; login attempts from unusual geographies in a short time span; a Worker-role account attempting Owner-only endpoints (even if blocked by RBAC, the attempt itself is a signal).
- **AI-usage anomalies:** unusually high volume of Copilot/feasibility calls from one account (possible cost-abuse or scraping); prompts that attempt to reference another `factory_id` (possible tenant-isolation probing).
- **Data anomalies:** bulk export/read patterns inconsistent with normal owner/supervisor usage.

**Flow:** anomaly detected → logged to `AuditLogs`/a dedicated `SecurityFlags` table with severity → surfaced to an admin/security review queue (not just silently dropped) → repeated or severe flags trigger temporary throttling or account hold pending review, never an irreversible auto-ban without a human check for a paying factory account.

## 4. Handling Slow Load / High Latency / Near-Crash Conditions

When a page is fetching data or waiting on AI generation (feasibility result, Copilot answer, briefing) and response time exceeds a fast threshold, the frontend must **never show a blank or frozen screen**. Required behavior:

1. **Skeleton loaders, not spinners-only.** Any view backed by a data fetch or LLM generation shows a skeleton placeholder matching the eventual layout (card shapes, table rows, text-line bars) immediately on navigation — before the request even resolves.
2. **Progressive reveal.** As soon as any part of the response is available (e.g. deterministic feasibility numbers arrive before the LLM explanation text does), render that part immediately and keep the still-pending part (e.g. the explanation paragraph) in skeleton state — don't wait for the full combined response.
3. **Timeout + graceful degrade.** If a request exceeds a defined timeout (tune per route group — AI routes get a longer allowance than CRUD routes), show a clear inline message ("Taking longer than usual — still working" / retry action) rather than an indefinite skeleton or a silent failure.
4. **Backpressure signal to the queue.** If the system detects it's approaching overload (queue depth, latency percentile threshold), new AI-heavy requests (feasibility/copilot/briefing) should be queued with a visible position/estimate rather than firing more concurrent LLM calls that risk a crash — this ties directly to the segmented rate limiting in §2.
5. **Cache what's cacheable.** Dashboard tiles, machine status, inventory summaries — anything not strictly real-time — should serve a recent cached value instantly while a fresh fetch happens in the background, rather than blocking the UI on every load.
6. **Never let a stuck AI call block the rest of the page.** The Owner Dashboard's Top-3-Attention cards, factory health tiles, and order list must render from already-available/cached data even if a Copilot or briefing call is still pending elsewhere on the same session.

**Design tie-in:** skeleton loader visual style should follow Design.md's dark theme (a subtle shimmer using `--bg-surface` → `--bg-surface-raised` gradient sweep), not a generic light-gray placeholder that clashes with the dark UI.

## 5. Ownership & Review Cadence

- Security checklist (§1): automated portions run on every CI build; full manual pass monthly.
- Rate-limit thresholds (§2): reviewed after each load test (Phases.md Phase 7) and after any real incident.
- Flagging rules (§3): reviewed whenever a new anomaly pattern is observed in production; log the change in Memory.md's Key Decisions Log.
- This file itself should be updated whenever a security decision is made — don't let decisions live only in chat/PR discussion.
