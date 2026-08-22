# Memory.md — Working Memory Log

**Purpose:** this file is the project's persistent memory across sessions. Any AI (or human) picking up work after a break, a long queue, or a context reset reads this file FIRST, before touching code. It exists to prevent hallucinated progress — never assume something is done; check here.

**Rule for whoever is working on this repo:** update this file at the end of every work session, and whenever you pause mid-task — not just at milestones. If you stop without updating this file, the next session will not know what you did.

---

## How to Update This File

1. Keep **"Currently In Progress"** accurate at all times — one entry, updated live, not just at the end.
2. Move finished items from "In Progress" to "Completed" the moment they're actually done (tested/working), not when you merely start them.
3. Log blockers/open questions as they arise — don't let them live only in chat history.
4. Never delete history from "Completed" — this is a log, not a scratchpad. If the log gets long, summarize older entries in batches rather than deleting them.
5. Reference the relevant phase from `Phases.md` for every entry so progress maps back to the plan.

---

## Project Status Snapshot

- **Current Phase:** Phase 0 — Foundations & Decisions *(not yet started — repo just scaffolded with docs)*
- **Last updated:** *(update this line every time you edit this file)*

---

## ✅ Completed

*(nothing yet — this is a fresh repo. Log entries here as: `[date] – [what] – [phase] – [who/which agent]`)*

- 2026-08-22 — Initial project docs created (PRD.md, Architecture.md, Rules.md, Phases.md, Design.md, Memory.md, Security.md) from mvp.md source spec.

## 🔧 Currently In Progress

*(nothing yet — next step is Phase 0 tech-stack/hosting/DB/LLM-provider decisions per Phases.md)*

- File: —
- Task: —
- Status: —

## ⏸️ Blocked / Open Questions

- 🔶 Exact tech stack not finalized (Architecture.md §5) — needs decision before Phase 1 scaffolding.
- 🔶 Design.md motion/animation spec depends on choice of Figma vs. Stitch-based prototyping — not yet decided.
- 🔶 Design.md theme: "Dark Metallic" vs. "Dark Palette" — recommendation given, needs final sign-off.
- 🔶 Hosting provider, LLM provider details, voice/OCR provider — all listed in Phases.md Phase 0, none chosen yet.

## 📌 Key Decisions Log

*(record decisions once made, so they aren't re-litigated by a future session)*

- *(none yet)*

---

## Instructions for the Next AI Session

1. Read this file fully before doing anything else.
2. Check "Currently In Progress" — if something is listed, verify its actual state in the codebase before continuing (don't trust the note blindly if it looks stale).
3. Cross-check "Completed" against the actual repo/code — if this log and the code disagree, trust the code, then fix this log.
4. Pick up work according to the active phase in `Phases.md`.
5. Update this file before ending the session, even if the task isn't finished — partial progress notes are still required.
