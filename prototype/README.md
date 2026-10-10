# Prototype - Kira-n-Calvin Memory Game

**Status:** Research artifact. **Non-authoritative.**
**Revision:** 2 (2026-10-10), updated for Product Owner review findings B1, B2, C1–C6.

---

This folder contains a clickable prototype produced by the **Designer + Prototyper** role (Claude Design) during the Project Kickoff Prototype Ceremony.

## What this is

A working demonstration that the design works under realistic conditions. The prototype simulates the product's primary workflows, demonstrates every screen in `design-spec.md` scope, and exists as evidence the design is buildable.

The prototype is a single self-contained page, `Memory Game.dc.html` (Claude Design "Design Component" format, run by the bundled `support.js` runtime). It is **not** Angular and is not intended to be ported line-for-line. Keep both files together under `prototype/`.

## Prototype Inventory

### Screens or routes included

No routes; all screens are phases or overlays of one page.

| Screen / route | Design IDs | Notes |
| -------------- | ---------- | ----- |
| Splash (birthday) | DS-001, DS-020 | "Happy Birthday Kira!", "Tap to start". Auto-advance ~3 s; tap, Enter or Space skips. Date eyebrow removed in rev. 2. |
| Splash (generic) | DS-001, DS-020 | K-n-C text logo and "Kira-n-Calvin Memory Game". Force with `cutoffMode = after`. |
| Game shell: header + table | DS-002–DS-007 | Present after the splash. |
| Options popup — first open | DS-010, DS-011, DS-019, DS-007 (preview) | No Close button. Face-down preview behind it. All ten themes checked unless saved options exist. |
| Options popup — from a game | DS-010, DS-025, DS-026, DS-004 | Opened by New Game during play or from the end screen. Close (×) and Escape return to the game unchanged; live board behind; timer paused. |
| Board in play | DS-007, DS-008, DS-009 | Responsive grid, flips, empty slots. |
| Pair reveal (match / mismatch) | DS-012, DS-013, DS-014 | |
| Show All | DS-015 | |
| End screen | DS-016, DS-017, DS-024 | Single / winner / tie; best-score note keyed by card count + variants + player. |
| "Start over?" confirm | DS-018 | Restart during a game in progress; Go from a popup opened over a game in progress. Secondary button reads "Keep playing" (Restart, returns to the game) or "Back to options" (Go, returns to the popup with the draft intact). |
| Website greeting page (R1) | — | Not prototyped. |

### States demonstrated

- **Empty:** popup with no themes (Go disabled, "Pick at least one theme", no preview cards); empty slots after matches; a completed game's empty table behind the popup.
- **Loading:** none (no async data). Web fonts swap in from the system fallback.
- **Error:** none designed. Storage read/write failures are ignored silently.
- **Disabled:** Go (no theme); Show All (outside between-turn play); Restart (no game yet, popup open, input locked); New Game (popup open, input locked). Card input locked during flip-to-reveal, reveal and Show All (no visual change).
- **Hover / focus / active:** no hover styles. Keyboard focus ring (3 px, 3 px offset; navy, cream on the reveal). Active player block in two-player. `aria-pressed` on Sound.
- **Paused (new):** timer frozen while the popup is open over an active single-player game.
- **Reduced motion (new):** with the OS setting on, transitions/animations are effectively instant and confetti is hidden.

### Simulated integrations

| Integration | Simulation approach | Files |
| ----------- | ------------------- | ----- |
| Birthday cutoff (R3) | Record `{ local: '2026-10-11T00:00', tz: 'America/Denver', player: 'Kira' }` compared with the device clock via `Intl.DateTimeFormat` offsets. | `Memory Game.dc.html` (`isBeforeCutoff`) |
| Card art (R27) | Labeled placeholder faces; no likeness art. | `Memory Game.dc.html` (`face`) |
| K-n-C logo (R30) | Text "K-n-C" in a circle. | template |
| Sounds (R31) | Synthesized Web Audio tones. | `beep`, `sFlip`, `sMatch`, `sWin` |
| Device storage (R36) | `localStorage`: `knc-memory-opts` (saved on Go), `knc-memory-best` (key `"{cardCount}|{variants\|plain}|{player}"`). | `constructor`, `doGo`, `finish`, `bestKey` |
| Hosting (R34) | Not simulated. | — |

### Prototype-only controls

Claude Design Tweaks panel; not product features.

- `cutoffMode`: `auto` / `before` / `after`.
- `matchPauseMs`: 600–3000 ms, default 1500.
- Removed in rev. 2 because the Product Owner decided them: `initialThemes`, `boardBehindPopup`, `secondaryCue`.

### Known limitations

- Card faces and logo are placeholders; R27 not met.
- Sounds are placeholder tones.
- "Orientation" mirrors layout cues only (no art to mirror).
- Color-difference legibility not tested with color-blind users or simulators.
- Contrast was computed from tokens (design-spec §2.2), not measured on rendered screenshots or real displays.
- Focus management is implemented for the prototype's overlays; screen-reader announcements were not tested with an actual screen reader.
- Stepper end buttons clamp silently rather than disabling.
- Best score is not shown in two-player.
- Face-down preview behind the first-open popup is a count, not the deal.
- Confetti loops while the end screen is shown.
- Tested only in a desktop Chromium preview; not on real phones/tablets, Safari or Firefox.

### Explicitly out-of-scope behavior

- Greeting page (R1); hosting and linking (R34).
- Final SVG likeness art (R27) and final logo.
- Separation of personal content from the engine (R35).
- product.md Non-Goals: public edition, accounts, leaderboards, online play, tutorial, more than two players, birthday messages after the splash.

### Architecturally relevant files

| File | Why it matters |
| ---- | -------------- |
| `prototype/Memory Game.dc.html` | Whole prototype. Logic sections: `buildDeck` / `countFor` (R9–R11); `pick` / `resolveMatch` / `dismiss` / `doShowAll` (R15–R18, R26); `doNew` / `closeOptions` / `go` / `doGo` / `inProgress` (R24, R25, R37); `fit` (R13–R14); `face` (R28–R29); `isBeforeCutoff` (R3); `startGame` (R4, re-rolls); `finish` / `bestKey` (R21, R36); `syncFocus` / `trapTab` / `onKey` (R33, R37). |
| `prototype/support.js` | Claude Design runtime only. **Not relevant to production.** |

## What this is NOT

- **Not production code.** Do not import from this folder into `src/`.
- **Not architecturally canonical.** Patterns here are research output. The authoritative architecture lives in `mod-w/architecture.md`, authored by the Tech Lead.
- **Not a Reference Implementation by default.** A Reference Implementation status is granted only when the Tech Lead explicitly disposes of a specific prototype component in a `step-xx.md` section "Reference Implementation" block.

## How this folder is used downstream

1. The Tech Lead (Codex) inspects this folder during Architecture Definition as one of the kickoff inputs.
2. The Tech Lead must inspect the complete prototype inventory, run or view every in-scope flow, read all files listed as architecturally relevant, and sample supporting files as needed.
3. The Tech Lead may reference specific files here in `step-xx.md` as a Reference Implementation with one of three dispositions: `Adopt as-is`, `Adopt with modifications`, or `Reject`.
4. The Development Team reads dispositions in `step-xx.md` and proceeds accordingly. The Dev Team reads prototype files only when the approved Step names them as relevant.

## Lifecycle

- **Created:** During the Prototype Ceremony.
- **Frozen:** At the Architecture Handoff. Once `architecture.md` is approved, this folder is read-only except for explicitly approved backfill notes.
- **Retained:** For the life of the project, as historical context.

---

MOD-W v5.0.1
