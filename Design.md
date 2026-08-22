# Design.md — Visual Design System

> Status: direction set, exact tool/animation stack still open 🔶 (Figma prototyping vs. Stitch-generated flows). This file should be updated once that's decided — keep Memory.md pointed at this file while it's in flux.

---

## 1. Theme Direction

**Base theme: Dark.** Explicitly not a white/light UI (per product owner). Two acceptable directions — pick one and commit, don't mix both across the app:

### Option A — "Dark Metallic" (shine/reflective)
- Near-black base with brushed-metal gradients on cards/panels (subtle diagonal light sheen on hover/scroll).
- Accent metal tones: gunmetal, graphite, chrome-silver highlight.
- Best for: conveying "industrial precision" — fits a **factory/manufacturing** product well.

### Option B — "Dark Palette" (flat, mood-based dark theme)
- Near-black/charcoal base with a restrained accent-color palette (no shine/gradient effects).
- Best for: cleaner data-density (dashboards, tables) — lower visual noise for an owner scanning risk cards fast (30-second success principle, PRD.md).

**Recommendation:** given the product is dashboard-and-decision-heavy (Owner Dashboard, Feasibility, Copilot — lots of cards, numbers, statuses), lean toward **Option B as the base**, with **Option A's metallic sheen reserved for accents** — e.g. the primary CTA buttons, the AI-recommendation card border, key metric numbers, the Copilot panel. This keeps day-to-day scanning fast while giving the "premium industrial" feel in the moments that matter.

## 2. Color Palette (proposed — dark base)

| Token | Use | Value (proposed) |
|---|---|---|
| `--bg-base` | App background | `#0B0D10` (near-black, slightly cool) |
| `--bg-surface` | Cards/panels | `#14171B` |
| `--bg-surface-raised` | Modals, top navigation | `#1B1F24` |
| `--border-subtle` | Card borders, dividers | `#2A2F36` |
| `--metallic-accent` | CTA / highlight border (Option A moments) | Gradient `#8A8F98 → #C9CDD3 → #8A8F98` |
| `--text-primary` | Body/headers | `#E7E9EC` |
| `--text-muted` | Secondary text | `#9AA1AB` |
| `--status-safe` | SAFE / on-track | `#3DDC84` (green) |
| `--status-risk` | POSSIBLE WITH RISK / at-risk | `#F5A623` (amber) |
| `--status-critical` | NOT RECOMMENDED / critical/delayed | `#EF4444` (red) |
| `--status-idle` | Machine idle/maintenance | `#5B8DEF` (blue, neutral-informational) |
| `--accent-primary` | Primary actions, links | `#5B8DEF` or metallic accent, pick one — don't use both as "primary" |

**Rule:** status colors (safe/risk/critical/idle) are the one place color-coding must stay perfectly consistent across every screen — owner and worker both rely on it for fast scanning.

## 3. Typography

- **Primary typeface:** a clean geometric/grotesque sans (e.g. Inter, Manrope, or IBM Plex Sans) — good numeral legibility for stats/tables, renders well in Hindi/Hinglish contexts (per PRD.md UI/UX requirement) if paired with a font that has solid Devanagari fallback support.
- **Scale:** modest, dashboard-appropriate — avoid oversized display type; the interface is data-dense, not marketing-page-dense.
  - Display/greeting header ("Good Morning, [Owner Name]"): 24–28px
  - Section headers: 18–20px
  - Card titles/metrics: 14–16px, numbers can go bolder weight for scannability
  - Body/labels: 13–14px
  - Worker-facing screens: bump base size up (worker UI needs larger tap targets and text — PRD.md "1-2 taps, simple language").
- **Weight usage:** reserve bold/heavy weights for numbers and status labels, not for long text — keeps the "shine" reserved for what matters, consistent with the metallic-accent philosophy.

## 4. Motion, Scrolling & Animation 🔶

Not yet finalized which prototyping tool (Figma vs. Stitch-generated flow) will define this — treat the following as **constraints**, not a locked spec:

- Motion should be **functional, not decorative** — e.g. skeleton-loader shimmer while data/AI results load (see Security.md), smooth status-transition color fades (green→amber→red) rather than jarring instant swaps, subtle metallic-sheen hover/scroll-parallax on Option-A accent surfaces only.
- Avoid animation that delays an owner's ability to read the Top-3-Attention cards — the 30-second success principle overrides any scroll/reveal flourish.
- Worker screens: minimize animation — favor instant, obvious feedback (tap → immediate visual confirmation) over transitions, since workers need speed over aesthetics.
- Once Figma/Stitch direction is picked, document final interaction specs (easing curves, durations, breakpoints) here and remove this 🔶.

## 5. Layout Principles
- Mobile-first, responsive (per PRD.md §3.17/UI/UX). Owner dashboard should degrade gracefully to mobile without losing the Top-3-Attention cards' priority position.
- Large touch targets and few forms, especially on Worker screens.
- Icons + text (not icon-only) throughout — plus voice and QR entry points where specified in PRD.md.
- Every AI-derived claim shown on-screen carries a visible confidence/data-basis indicator, styled consistently (small muted label under the claim) — this is a design requirement, not just a data one (ties to Rules.md AI boundaries).
