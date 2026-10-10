# Prototype - Kira-n-Calvin Memory Game

**Status:** Research artifact. **Non-authoritative.**

---

This folder contains a clickable prototype produced by the **Designer + Prototyper** role (Claude Design) during the Project Kickoff Prototype Ceremony.

## What this is

A working demonstration that the design works under realistic conditions. The prototype simulates the product's primary workflows, demonstrates every screen in `design-spec.md` scope, and exists as evidence the design is buildable.

The prototype is a single self-contained page: `Memory Game.dc.html` (Claude Design "Design Component" format, run by the bundled `support.js` runtime). It is **not** written in Angular, and nothing in it is intended to be ported line-for-line. When the folder is copied into the repository, both files should sit together under `prototype/`.

## Prototype Inventory

### Screens or routes included

The prototype has no routes. All screens are phases or overlays of one page.

| Screen / route | Design IDs | Notes |
| -------------- | ---------- | ----- |
| Splash (birthday variant) | DS-001, DS-020 | Shown before the cutoff. "Saturday, October 10" eyebrow, "Happy Birthday Kira!", "Tap to start". Auto-advances after ~3 s; tap, Enter or Space skips. |
| Splash (generic variant) | DS-001, DS-020 | Shown after the cutoff. K-n-C text logo placeholder and "Kira-n-Calvin Memory Game". Force it with the `cutoffMode = after` control. |
| Game shell: header + table | DS-002, DS-003, DS-004, DS-005, DS-006, DS-007 | Always present after the splash. |
| Options popup | DS-010, DS-011, DS-019 | Opens over the board after the splash and on New Game. |
| Board in play | DS-007, DS-008, DS-009 | Responsive grid of face-down cards, flips, empty slots after matches. |
| Pair reveal overlay (match) | DS-012, DS-013 | "Match!" title; auto-dismisses after the match pause. |
| Pair reveal overlay (mismatch) | DS-012, DS-014 | "Not a match" title and "Tap a card to continue" hint. |
| Show All state | DS-015 | Every remaining card face up for ~3 s. |
| End screen | DS-016, DS-017 | Single-player and two-player variants, confetti, Restart and New Game. |
| "Start over?" confirm | DS-018 | Only when a game is in progress. |
| Website greeting page (R1) | — | **Not prototyped.** See Explicitly out-of-scope behavior. |

### States demonstrated

- **Empty:**
  - Options popup with no themes checked: Go disabled, summary reads "Pick at least one theme", and no cards are dealt behind the popup.
  - Board area empty behind the popup when `boardBehindPopup = empty`.
  - Empty grid slots after a matched pair disappears. The slot keeps its space, has no border or placeholder, and the other cards do not move.
- **Loading:** None. The prototype has no asynchronous data. Web fonts load from Google Fonts; text shows in the system fallback until they arrive (`display=swap`).
- **Error:** None designed. Failures to read or write device storage are ignored silently and the game continues with defaults. No error UI exists.
- **Disabled:**
  - Go (no theme checked), at 40% opacity.
  - Show All (outside a game, while one card is flipped, during a reveal, during Show All, or while input is locked), at 45% opacity.
  - Restart (before the first game, and while the options popup is open), at 45% opacity.
  - Card input is locked during the flip-to-reveal delay, during a reveal and during Show All. Locked cards carry no visual change.
- **Hover / focus / active:**
  - Hover: no custom hover styles. Pointer cursor on interactive elements; default cursor on match reveal cards.
  - Focus: browser-default focus ring. Cards add a 3 px outline offset. No custom focus styling, which is a known gap (see design-spec §2).
  - Active: the active player's header block is highlighted in two-player (tinted background and border in that child's color). Toggle buttons expose `aria-pressed` (Sound).

### Simulated integrations

| Integration | Simulation approach | Files |
| ----------- | ------------------- | ----- |
| Birthday cutoff clock (R3) | Data record `{ local: '2026-10-11T00:00', tz: 'America/Denver', player: 'Kira' }`, compared with the device clock using `Intl.DateTimeFormat` time-zone offsets. A prototype control can force before or after. | `Memory Game.dc.html` (`isBeforeCutoff`) |
| Card art (R27) | Labeled placeholder face per theme: themed background color, child name chip, a dashed "illustration" slot, the activity name and variant cue shapes. **No likeness art.** | `Memory Game.dc.html` (`face`) |
| K-n-C logo (R30) | Text "K-n-C" in a circle, on card backs, in the header and on the generic splash. | `Memory Game.dc.html` (template) |
| Sounds (R31) | Short synthesized Web Audio tones for flip, match and win. These are placeholders for designed sounds. | `Memory Game.dc.html` (`beep`, `sFlip`, `sMatch`, `sWin`) |
| Device storage (R36) | `localStorage` keys `knc-memory-opts` (last options, saved on Go) and `knc-memory-best` (best single-player attempts keyed by card count). | `Memory Game.dc.html` (`constructor`, `go`, `finish`) |
| Hosting on kira-n-calvin.com (R34) | Not simulated. Runs as a standalone page. | — |

### Prototype-only controls

These are exposed in the Claude Design Tweaks panel. They are not product features and must not ship.

- `cutoffMode`: `auto` / `before` / `after`. Forces either side of the birthday cutoff.
- `initialThemes`: `all` / `none`. Which themes are checked the first time the popup opens. This answers an open question in product.md. Once options have been saved on the device, the saved options win.
- `boardBehindPopup`: `dealt` / `empty`. Whether face-down cards are shown behind the popup. This answers an open question in product.md.
- `matchPauseMs`: 600–3000 ms, default 1500. How long a match stays revealed.
- `secondaryCue`: on/off, default on. When the difference type is color, the second variant also gets a dot pattern (R29).

### Known limitations

- Card faces are placeholders. R27 (likeness illustrations) is not met.
- The logo is a text placeholder (allowed by R30 until the logo exists).
- Sounds are placeholder tones.
- The "orientation" difference type mirrors only the layout cues (name chip side, corner flag side, stripe direction). It cannot mirror real art because none exists yet.
- The "color" difference is a fixed hue shift of +55°. It has not been tested with color-blind users or simulators.
- No custom focus styles. Focus is not moved into or trapped in the options popup, the reveal or the confirm dialog, and Escape does nothing.
- Enter and Space dismiss a mismatch through a page-level key handler as well as on the focused card. The two paths can both fire on one key press, which is harmless in the prototype (see architecture-notes OBS-012).
- "Game in progress" (R25) means at least one attempt has been made. A game where only one card has been flipped and no attempt has been counted is treated as not in progress, so Restart and New Game skip the confirm.
- Best score is keyed only by card count. It ignores theme, variant and fill settings and the player.
- Face-down cards behind the popup are a count preview made from the draft options, not the deck that will be dealt.
- The two-player header always lists Kira, then Calvin, whoever goes first. The first player is shown only by the active highlight.
- Contrast has not been measured. Some pairings are suspected to fall below AA (see design-spec §2.2).
- Confetti loops until the end screen closes.
- Only tested in a desktop Chromium preview with a resizable pane. Not tested on real phones or tablets, or in Safari or Firefox.

### Explicitly out-of-scope behavior

- The website greeting page (R1) and hosting and linking from kira-n-calvin.com (R34).
- Final SVG likeness art (R27) and the final K-n-C logo.
- Separating personal content from the engine (R35). The prototype keeps theme data in the same file as the game logic.
- Anything product.md lists as a Non-Goal: public edition, accounts, leaderboards, online play, tutorial or how-to-play, more than two players, birthday messages after the splash.

### Architecturally relevant files

| File | Why it matters |
| ---- | -------------- |
| `prototype/Memory Game.dc.html` | The whole prototype. Logic class sections to read: `buildDeck` / `countFor` (deck rules R9–R11), `pick` / `resolveMatch` / `dismiss` / `doShowAll` (turn state machine R15–R18, R26), `fit` (responsive grid R13–R14), `face` (variant presentation R28–R29), `isBeforeCutoff` (R3), `startGame` (player assignment R4, re-rolls), `finish` (end and best score R21, R36). |
| `prototype/support.js` | Claude Design runtime only. **Not relevant to production**; do not inspect for patterns. |

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
