# Architecture Notes - Kira-n-Calvin Memory Game

**Date:** 2026-10-10 (revision 2: OBS-007, OBS-011, OBS-012 updated; OBS-016, OBS-017 added after Product Owner review)
**Author:** Designer + Prototyper (Claude Design)
**Status:** Advisory - input to Tech Lead Architecture Definition. **Not authoritative.**

---

> This document records observations from the Prototype Ceremony for the Tech Lead's consideration during Architecture Definition.
>
> It is **advisory**, not constraint. Confidence describes the prototyper's certainty in an observation; it is not architectural authority. The Tech Lead may accept, modify, or reject any possible implication. Material divergences should be recorded in `architecture.md` section "Decisions That Diverge From Prototype" with rationale.

**Context for every observation:** the prototype is one page, `prototype/Memory Game.dc.html`, built in the Claude Design component format (a class-based logic object with a declarative template). It is not Angular. All observations were made in a desktop Chromium preview with a resizable pane. No real phone or tablet, no Safari or Firefox, and no profiling tools were used. No performance numbers were measured.

---

## Observation Format

Use one subsection per significant observation. Include concrete evidence where available; state "none observed" when a category has no findings.

---

## 1. Streaming / Performance observations

### OBS-001 - 40-card flips stayed smooth by eye; not measured

| Field | Notes |
| ----- | ----- |
| Observation | 40 cards with 3D flip transitions (CSS `transform: rotateY`, `preserve-3d`, `backface-visibility: hidden`) and Show All flipping every card at once showed no visible stutter. |
| Evidence | Visual only. No FPS, frame-time or memory figures were taken. |
| Prototype location | `prototype/Memory Game.dc.html`, card markup in the template; `doShowAll` |
| Reproduction conditions | Desktop Chromium preview; options: all 10 themes, variants on (40 cards); press Show All. |
| Confidence | Low (desktop only, unmeasured) |
| Possible architectural implication | CSS transforms on the card element may be enough for R32. Profiling on a low-end phone or tablet with 40 cards may be worth doing before committing. |

### OBS-002 - Confetti uses 70 looping DOM elements

| Field | Notes |
| ----- | ----- |
| Observation | The end-screen confetti is 70 absolutely positioned elements animated with an infinite CSS keyframe. It loops until the end screen closes. |
| Evidence | Visual only; unmeasured. |
| Prototype location | `prototype/Memory Game.dc.html`, `makeConfetti` |
| Reproduction conditions | Finish any game. |
| Confidence | Low |
| Possible architectural implication | A finite run or a canvas-based effect may be kinder to battery on mobile. A `prefers-reduced-motion` path is required by design-spec §2. |

### OBS-003 - Grid fit calculation is cheap at this scale

| Field | Notes |
| ----- | ----- |
| Observation | The responsive layout tries every column count from 1 to n (n ≤ 40) on each resize and keeps the largest card width that fits the measured table. |
| Evidence | At most 40 iterations of simple arithmetic per resize. No visible lag while dragging the pane width. |
| Prototype location | `prototype/Memory Game.dc.html`, `fit`, `measure`, ResizeObserver set up in `componentDidMount` |
| Reproduction conditions | Drag the preview width from about 360 px to 1400 px with 40 cards dealt. |
| Confidence | High |
| Possible architectural implication | A measured-container approach (observing the table element rather than the viewport) met R13–R14 including rotation. A pure CSS grid (`auto-fill`) cannot by itself maximize card size against both width and height, so some measurement is likely needed. |

---

## 2. Component composition patterns that worked

### OBS-004 - One card face composition scales from grid to reveal using container units

| Field | Notes |
| ----- | ----- |
| Observation | The card is a size container. All inner sizes (radius, padding, chip, name text, badge) are in `cqw`, so the same composition renders at 52 px in the grid and about 340 px in the reveal with no extra rules. |
| Evidence | The reveal and grid cards look proportionally identical at every size tried. |
| Prototype location | `prototype/Memory Game.dc.html`, card face markup (duplicated in grid and reveal) |
| Reproduction conditions | Any reveal, at narrow and wide viewports. |
| Confidence | High |
| Possible architectural implication | A single card-face presentation used in both the grid and the reveal is feasible. The prototype duplicates the markup; a shared presentation unit would avoid drift. Container query support on the target browsers should be confirmed. |

### OBS-005 - Face presentation is derived from four inputs

| Field | Notes |
| ----- | ----- |
| Observation | Everything visible on a face comes from (theme, variant, difference type for that theme in this game, whether variants are on). The secondary-cue setting adds one more input. |
| Evidence | `face(card)` returns all presentational values from those inputs alone; cards store no styling. |
| Prototype location | `prototype/Memory Game.dc.html`, `face` |
| Reproduction conditions | Variants on; restart several times and observe difference types change. |
| Confidence | High |
| Possible architectural implication | Keeping card records free of presentation, and deriving the face from these inputs, may make it easier to swap personal art for public-edition art (R35). |

### OBS-006 - Personal content is not separated in the prototype

| Field | Notes |
| ----- | ----- |
| Observation | The theme list (names, owner child, hue), the child colors and the cutoff record are inline data in the same file as the game logic. |
| Evidence | `themes`, `kidColor`, `cutoff` fields on the logic class. |
| Prototype location | `prototype/Memory Game.dc.html`, top of the logic class |
| Reproduction conditions | n/a (static reading) |
| Confidence | High |
| Possible architectural implication | R35 is not demonstrated. The data was already shaped as plain records, which suggests it could be moved into a separate content package without changing the engine. |

---

## 3. State management patterns that worked

### OBS-007 - A single phase value plus overlay flags was enough

| Field | Notes |
| ----- | ----- |
| Observation | Game flow is one `phase` value (`splash`, `options`, `play`, `end`) plus independent overlay state (`reveal`, `confirm`, `peek`), an input `locked` flag and, since rev. 2, a `returnTo` value (`play`, `end` or none) recording what the options popup was opened over. |
| Evidence | Every screen in the inventory is reachable and mutually consistent with this shape; no impossible combinations were seen during play. |
| Prototype location | `prototype/Memory Game.dc.html`, constructor `state`, `renderVals` |
| Reproduction conditions | Full flows: splash → options → play → end → Restart / New Game, plus confirm mid-game. |
| Confidence | High |
| Possible architectural implication | The flow fits a small explicit state machine. Making reveal/peek/locked part of a turn sub-state might make R18 easier to verify. R37 suggests the options popup behaves more like an overlay on a game than a phase that replaces it (see OBS-016). |

### OBS-008 - Card record and matching by face equality

| Field | Notes |
| ----- | ----- |
| Observation | Each card is `{ theme, variant, status: down \| up \| gone }`, held in an ordered list. A match is `theme` and `variant` both equal. The list index is the grid position and never takes part in matching. |
| Evidence | Repeated pairs (fill the grid with one theme at 40) match any two copies. |
| Prototype location | `prototype/Memory Game.dc.html`, `buildDeck`, `pick` |
| Reproduction conditions | One theme, fill the grid at 40, variants on and off. |
| Confidence | High |
| Possible architectural implication | Supports R12 directly. Keeping list order stable while only status changes also gave R14 and R16 (no reflow, empty slots stay put) for free. |

### OBS-009 - Deck rules reduce to a "pairs list" step then a "double and shuffle" step

| Field | Notes |
| ----- | ----- |
| Observation | Deck building first produces a list of pairs (by the R9, R10 or R11 rule), then makes two cards per pair and shuffles. Card count is always even and equals the chosen value. |
| Evidence | The popup summary count matches the dealt count across the combinations tried. Not exhaustively tested. |
| Prototype location | `prototype/Memory Game.dc.html`, `countFor`, `buildDeck` |
| Reproduction conditions | Mixed theme counts × variants × fill sizes. |
| Confidence | Medium (the R11 round-robin remainder uses a shuffled slice of the supply, one reading of "leftover pairs go to randomly chosen themes"; the exhaustive check required by product.md has not been done) |
| Possible architectural implication | The pairs-list step is a pure function that is easy to unit-test exhaustively against the product.md acceptance criterion. Whether the remainder is picked per theme or per pair when variants are on is a product interpretation to confirm. |

### OBS-010 - Timed sequences are independent timeouts

| Field | Notes |
| ----- | ----- |
| Observation | Flip → reveal (420 ms), match pause (1500 ms), last match → end (550 ms), Show All (3000 ms) and splash (3000 ms) are separate timeouts, all cleared on Restart and New Game. |
| Evidence | Restarting during a match pause or Show All did not leave a stale action. |
| Prototype location | `prototype/Memory Game.dc.html`, `later`, `startGame`, `doNew` |
| Reproduction conditions | Press Restart, then Start over, during a match reveal and during Show All. |
| Confidence | Medium (works in normal use; race cases beyond these were not tried) |
| Possible architectural implication | Tying timed transitions to the game instance, so they are cancelled with it, avoids stale callbacks. A fake clock in tests would make R16, R26 and R2 timings verifiable. |

### OBS-011 - Device persistence is two small records

| Field | Notes |
| ----- | ----- |
| Observation | Last options (saved when Go starts a game) and best single-player attempts are stored as JSON in `localStorage`. Rev. 2 best key: `"{cardCount}|{variants|plain}|{player}"` (PO decision C6). Read and write failures are ignored. |
| Evidence | Reload restores options; the end screen shows the stored best. |
| Prototype location | `prototype/Memory Game.dc.html`, constructor, `go`, `finish` |
| Reproduction conditions | Press Go, reload; finish two single-player games on the same board size. |
| Confidence | High |
| Possible architectural implication | R36 needs no backend. A versioned storage shape may help if the key changes again. Saved options take precedence over the first-open default (all ten themes). |

### OBS-012 - Two key paths could fire on one Enter/Space press (resolved in rev. 2)

| Field | Notes |
| ----- | ----- |
| Observation | A page-level key handler dismisses a mismatch on Enter or Space, and the focused reveal card's native button click also dismisses. Both can run on one key press. |
| Evidence | Rev. 1: the second call found the same state and was harmless. Rev. 2: the page-level handler now ignores key events whose target is a button, so only the native activation runs. |
| Prototype location | `prototype/Memory Game.dc.html`, `onKey` in `componentDidMount`, `dismiss` |
| Reproduction conditions | Tab to a reveal card during a mismatch and press Enter. |
| Confidence | High (rev. 2 behavior) |
| Possible architectural implication | One owner for keyboard intent (R33) together with focus management for dialogs would avoid double handling. |

---

## 4. Integration shapes surfaced during prototyping

### OBS-013 - Cutoff check uses a time-zone-aware comparison on the device clock

| Field | Notes |
| ----- | ----- |
| Observation | The cutoff is the record `{ local: '2026-10-11T00:00', tz: 'America/Denver', player: 'Kira' }`. The UTC instant is derived from the zone's offset using `Intl.DateTimeFormat(...).formatToParts`, then compared with `Date.now()`. |
| Evidence | With the device on 2026-10-10 the birthday branch shows; forcing `after` shows the generic branch. The automatic path was not tested across the real boundary or on a device set to another zone. |
| Prototype location | `prototype/Memory Game.dc.html`, `isBeforeCutoff`, `cutoff` |
| Reproduction conditions | Default `cutoffMode = auto` on 2026-10-10; `before` / `after` overrides. |
| Confidence | Medium |
| Possible architectural implication | R3 can be met with platform time-zone data and no time library. An injectable "now" would make the product.md acceptance check on both sides of the cutoff testable. The device-clock risk in product.md remains. |

### OBS-014 - Audio needs a user gesture first

| Field | Notes |
| ----- | ----- |
| Observation | Sounds are Web Audio oscillators. The audio context is created on the first sound, which is always triggered by a tap (card flip), so browser autoplay rules were satisfied. |
| Evidence | Sounds played in the Chromium preview. Not tested on iOS Safari, where silent-switch and autoplay behavior differ. |
| Prototype location | `prototype/Memory Game.dc.html`, `beep` |
| Reproduction conditions | Sound on; flip a card. |
| Confidence | Medium |
| Possible architectural implication | Final sound files (R31) will still need to start from the first user gesture. Mobile Safari behavior should be checked. |

### OBS-015 - No external integrations; hosting not exercised

| Field | Notes |
| ----- | ----- |
| Observation | The prototype calls no services. It loads web fonts from Google Fonts. It was not run under a subfolder of kira-n-calvin.com. |
| Evidence | n/a |
| Prototype location | `prototype/Memory Game.dc.html`, font links |
| Reproduction conditions | n/a |
| Confidence | High |
| Possible architectural implication | Subfolder base-path handling (R34) is untested. Self-hosting fonts may be preferable for a static family site (privacy, offline). |

### OBS-016 - Options popup as an overlay over a preserved game (R37)

| Field | Notes |
| ----- | ----- |
| Observation | Opening New Game keeps the whole game record (cards, stats, turn, flipped card, start time) untouched and edits a separate draft. Close restores the previous phase; Go replaces the game only after "Start over?" when a game is in progress. Timer pause is a recorded pause instant; on Close the start instant is shifted by the paused duration. |
| Evidence | Mid-game New Game → Close returns with the same face-up card, scores, active player and timer value; from the end screen, Close returns to the same end screen with confetti. |
| Prototype location | `prototype/Memory Game.dc.html`, `doNew`, `closeOptions`, `go`, `doGo`, `inProgress`, timer text in `renderVals` |
| Reproduction conditions | Single-player, flip one card, New Game, change options, Close (× or Escape). Repeat from the end screen. Repeat with Go to see the confirm. |
| Confidence | High |
| Possible architectural implication | Keeping "draft options" separate from "current game options" and treating the popup as non-destructive appears to satisfy R37 with little machinery. New Game and Restart were disabled while input is locked so no timed transition is pending under the popup; an implementation that allows opening the popup mid-transition would need to pause or complete those transitions. |

### OBS-017 - Overlay focus stack

| Field | Notes |
| ----- | ----- |
| Observation | A small stack records, for each overlay that opens (splash, reveal, end, options, confirm), the element that had focus. Focus moves to the overlay's first control; Tab cycles within the topmost overlay; on close, focus returns to the recorded element if it still exists and is enabled, otherwise to the overlay now on top. |
| Evidence | Keyboard: header New Game → popup (focus on ×) → Escape → focus back on New Game. End-screen New Game → Close → focus back on the end-screen button. Go → "Start over?" → Escape → focus back on Go. |
| Prototype location | `prototype/Memory Game.dc.html`, `openLayers`, `syncFocus`, `focusInto`, `trapTab`, `onKey` |
| Reproduction conditions | Keyboard only, desktop Chromium. Not tested with a screen reader. |
| Confidence | Medium |
| Possible architectural implication | Overlays stack (confirm over options over end), so a shared focus-return mechanism may be simpler than per-dialog handling. Platform dialog primitives with built-in focus containment could be evaluated. |

---

## 5. Failed approaches

None observed. The prototype was built in one pass; no approaches were tried and abandoned.

---

## 6. Open questions for the Tech Lead

- Where personal content (themes, art, child colors, cutoff record) lives relative to the engine, to meet R35 and allow a public edition.
- How the SVG card art (R27) is packaged and loaded for up to 20 distinct faces × 4 difference types, including how orientation, accessory and pattern differences are applied to real art.
- Whether the responsive grid uses a measured container (as in the prototype) or another approach, and how the minimum card size and scroll fallback are enforced.
- How timed transitions are owned and cancelled, and whether a controllable clock is used for tests (R2, R3, R16, R26).
- How "now" for the cutoff is provided, so both sides of 2026-10-11 00:00 America/Denver can be tested.
- Which repository and subfolder serve the game, and the base path (R34; also an open product question).
- Whether timed transitions (match pause, Show All) may be pending when the options popup opens, or whether opening is blocked as in the prototype (OBS-016).
- Browser support targets (container queries, `Intl` time zones, Web Audio, 3D transforms), especially iOS Safari on older tablets.
- Exhaustive verification approach for the deck rules (R9–R11) against the product.md acceptance criterion.

---

MOD-W v5.0.1
