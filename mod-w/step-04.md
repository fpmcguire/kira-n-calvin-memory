# STEP-04 - Play Loop, Board, Reveal and End Flow

**Status:** Approved by Moderator for Development Team implementation
**Development Team interface:** Claude Code
**Step type:** Implementation

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Tech Lead STEP-04 prep for Development Team implementation.

> **2026-10-12 supersession note:** STEP-04 is a historical implementation record. Its difference metadata, secondary color cue and DOM-only face-hook decisions describe the placeholder implementation and are not authority for new variant work. STEP-06 replaces them with the approved slot treatment, alternate-only diamond medallion and visible-face-only slot/treatment/cue hooks while preserving STEP-04's play loop, `{ themeId, variantId }` matching, board/reveal reuse and focus behavior.

> **Moderator approval, 2026-10-12:** Approved this supersession note as part of Tech Lead commit `5719e9c`. Historical STEP-04 acceptance remains unchanged.

---

## Goal

Build the playable memory-game loop on top of the STEP-03 domain engine: responsive live board, interactive cards, flip/reveal/match/mismatch behavior, scoring, running single-player timer, Show All, end screen, Restart/New Game confirm behavior, and the STEP-02 accessibility/e2e carry-forwards.

This Step intentionally expands the original roadmap STEP-04 row by pulling in scoring, end screen, Restart and New Game confirm flow from the adjacent STEP-05 scope. Reason: these behaviors are tightly coupled to the play loop, input-locking, focus stack, timer and "game in progress" definition. Persistence, final sounds and final art remain out of scope.

---

## Related Requirements

- R12 - Cards match by face identity only; repeated pairs share one face identity.
- R13 - The grid is responsive, follows available table area and orientation, preserves 3:4 portrait cards, has a minimum size and left-aligns incomplete rows.
- R14 - Resize/rotation re-wraps the grid without changing card order.
- R15 - Every completed two-card turn shows a large side-by-side reveal.
- R16 - Matches disappear after a short pause; empty slots remain and the same player goes again.
- R17 - Mismatches stay revealed until dismissed, then cards turn down and two-player turn passes.
- R18 - Input is locked while a reveal is showing.
- R19 - Header attempts and matched pairs update per player; active player is highlighted in two-player.
- R20 - Single-player shows a running timer.
- R21 - Game ends when the table is empty and shows result, time/attempts or winner, and celebration with no birthday message.
- R22 - End screen offers Restart and New Game.
- R23 - Restart keeps options and deals a fresh game with scores/timer reset and no popup.
- R24 - New Game opens the options popup with current settings filled in.
- R25 - Restart and Go from an options popup ask "Start over?" only when a game is in progress.
- R26 - Show All flips remaining cards for about 3 seconds, costs one attempt, does not change turn and keeps timer running.
- R27 - Card faces are SVG illustrations of the children doing activities; this Step uses placeholder/available face rendering only.
- R29 - Color variants must have a secondary cue.
- R30 - Every card has the same K-n-C back.
- R31 - Sound toggle remains present; final sounds are out of scope.
- R32 - Flip, reveal and disappear animations; respect reduced motion.
- R33 - Large tap targets, keyboard selection and keyboard dismiss behavior.

## Related Design IDs _(if design-spec.md exists)_

| Design ID | Design element | Design intent to preserve | Product requirement |
| --------- | -------------- | ------------------------- | ------------------- |
| DS-002 | Game shell | Full-viewport shell with header above table; only the table scrolls as fallback. | R13, R19, R20 |
| DS-007 | Board / Table | Preview vs. live board distinction, live board preserved behind options, empty slots and scrolling fallback. | R13, R14, R16, R37 |
| DS-008 | Card | Face-down/up/peeked/gone states, same back, keyboard focus and hidden empty slots. | R12, R16, R30, R33 |
| DS-009 | Card face variant cues | Preserve STEP-03 difference metadata and secondary cue for color differences in the rendered placeholder face. | R28, R29 |
| DS-012 | Pair reveal overlay | Large side-by-side cards every turn, match/mismatch states, focus enters reveal and Tab stays inside. | R15, R17, R18, R33 |
| DS-013 | Turn flow | Flip, count attempt on second card, reveal, match/mismatch resolution and same-player/pass-turn behavior. | R15-R18, R19 |
| DS-014 | Match/mismatch states | Matched cards disappear with slots retained; mismatches dismiss by revealed card tap or keyboard. | R16, R17, R33 |
| DS-015 | Show All | Between-turn timed peek, attempt cost, no turn change, input locked. | R26 |
| DS-016 | End screen | Single-player and two-player result variants, Restart and New Game actions, no birthday message. | R21, R22 |
| DS-017 | Confetti | Celebration shown on end screen and hidden under reduced motion. | R21, R32 |
| DS-018 | Start Over Confirm | Context-specific confirm for Restart and Go from options over a game in progress. | R25 |
| DS-020 | Players and cutoff | Restart re-rolls post-cutoff players together with deck/differences; header order remains Kira, Calvin. | R4, R23 |
| DS-022 | Transitions | Card flip, disappear, reveal/dialog open and active-player highlight motion. | R32 |
| DS-023 | Keyboard navigation | Header actions and cards in grid order; overlays trap focus; Enter/Space select and dismiss. | R33 |
| DS-025 | Options popup over game | New Game opens non-destructive popup over current live/completed game; Close returns unchanged. | R24, R37 |
| DS-026 | Overlay focus stack | Focus management for stacked reveal/options/confirm/end overlays. | R33, R37 |

---

## Assigned Dev Team Interface

> Moderator decision. Default is Claude Code.

- [x] Claude Code (default)
- [ ] Claude Design (visual / chart / interaction-heavy Step)

**Hard rule:** if Claude Design is assigned here, it MUST NOT have authored this `step-xx.md`. Codex writes the spec; Claude Design implements against it. Plan vs. implement model contrast is preserved.

---

## Scope

- Replace the STEP-02 preview-only board after Go with a live board backed by the STEP-03 deck.
- Add production card presentation for the current placeholder face/back system, including down, up, peeked and gone states.
- Implement responsive board fitting for 4-40 cards using measured table dimensions or an equivalently testable approach. Preserve card order across resize and leave incomplete rows left-aligned.
- Implement card selection, two-card turn resolution, face-identity matching, input-locking and reveal timing.
- Implement reveal overlay focus, keyboard behavior and dismissal rules for match and mismatch.
- Update header attempts, pairs, active player highlight, timer, Show All, Restart and New Game enablement from real game state.
- Implement Show All between turns with timed peek, one-attempt cost, input lock and no turn change.
- Implement scoring and end-state calculation for single-player and two-player, including fewest-turn tie-break.
- Implement end screen with Restart and New Game actions and reduced-motion-aware celebration. Persistence/best-score text may remain placeholder or absent until STEP-05/STEP-06 unless already present.
- Implement Restart for completed and in-progress games, including "Start over?" only when R25 says it is needed.
- Preserve the non-destructive New Game popup behavior from STEP-02/STEP-03, now over real live/completed boards.
- Implement Go-from-options "Start over?" confirmation when the popup was opened over a game in progress.
- Fix deferred STEP-02 D1: post-Go shell must pass axe without `scrollable-region-focusable`.
- Fix deferred STEP-02 D2: header content must be inside an appropriate landmark and pass the widened axe check.
- Fix deferred STEP-02 D4: widen Playwright axe helper so moderate, minor and best-practice findings are reported unless explicitly documented.
- Add the clock-pinned browser e2e coverage carried forward from STEP-03 N7 / roadmap notes for both sides of `2026-10-11T00:00 America/Denver`.
- Respect `prefers-reduced-motion` for flip, reveal, disappear and confetti motion.

---

## Out of Scope

- Final SVG likeness art for R27; placeholder or current static face rendering is acceptable if content boundaries remain intact.
- Final K-n-C logo asset; the text placeholder remains acceptable.
- Final flip/match/win sound files. The sound toggle may remain visual/placeholder, but any sound introduced must have a visual equivalent and respect the toggle.
- Device persistence for last options and best scores unless already implemented; durable storage remains STEP-05/STEP-06 scope.
- Final production hosting/base-path release work.
- D3 fill-slider target-size follow-up from STEP-02; STEP-06 still owns it.
- Screen-reader smoke test and real-device matrix evidence; STEP-06 owns final broad accessibility/device evidence.
- Editing prototype files, `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md` or `mod-w/sign-off.md`.

---

## Inputs

- `mod-w/product.md` (R12-R27, R29-R33, R37)
- `mod-w/design-spec.md` (DS-002, DS-007-DS-018, DS-020, DS-022, DS-023, DS-025, DS-026)
- `mod-w/architecture.md` (`src/app/game/`, `src/app/domain/`, state model, overlays, testing expectations)
- `mod-w/architecture-notes.md` (OBS-001, OBS-003, OBS-004, OBS-007, OBS-008, OBS-010, OBS-012, OBS-016, OBS-017)
- `mod-w/roadmap.md` (STEP-04 row and carry-forward notes)
- `mod-w/sign-off.md` (STEP-02 D1, D2, D4; STEP-03 N7)
- `prototype/README.md`
- `prototype/Memory Game.dc.html`
- Existing STEP-03 domain/content/game-state code

---

## Expected File Changes

- `src/app/game/game-state.ts` and `src/app/game/game-state.spec.ts`
- `src/app/game/game/**`
- `src/app/game/game-header/**`
- `src/app/game/preview-board/**` or replacement board component folders
- New focused components under `src/app/game/` as needed, for example `board/`, `card/`, `card-face/`, `pair-reveal/`, `end-screen/`, `confirm-dialog/`
- `src/app/game/overlay-focus.ts` if focus stacking needs extension
- `src/app/domain/**` only for small scoring/progress helpers that stay pure and are covered by unit tests
- `src/app/content/**` only for typed face/back placeholder metadata needed by rendering
- `e2e/**` for widened axe helper, post-Go axe checks, clock-pinned cutoff checks and play-loop browser coverage

---

## Reference Implementation

> If a candidate implementation exists in `prototype/`, the Tech Lead dispositions it here. Otherwise, state "None - implement from scratch."
>
> `Adopt as-is` preserves the approved behavior and relevant structure without redesign. It still requires normal production adaptation, including framework integration, type safety, accessibility, error handling, security, tests, performance, repository conventions, and architecture compliance. It never bypasses architecture, review, QA, or production-quality requirements.

**Location:** `prototype/Memory Game.dc.html`

**Disposition:**

- [ ] Adopt as-is - preserve approved behavior and relevant structure; adapt normally for production
- [x] Adopt with modifications - see "Required Changes" below
- [ ] Reject - Dev Team implements from scratch per acceptance checks
- [ ] None - no Reference Implementation exists for this Step

### Required Changes (if "Adopt with modifications")

- Preserve the prototype's user-visible board/reveal/end/confirm behavior, but implement it as Angular components and signal-backed state, not as a port of the prototype class/runtime.
- Preserve face-identity matching, card-order stability, empty-slot behavior, Show All semantics, input-locking and overlay focus stack semantics.
- Preserve the measured-container board-fit idea if it remains the simplest reliable implementation, but make it production-safe with `ResizeObserver` cleanup, deterministic tests and no viewport-only assumptions.
- Use the existing STEP-03 domain engine for deck, match and player/cutoff behavior; do not reimplement domain rules inside presentation components.
- Replace prototype inline content and styling helpers with typed content interfaces and production components.
- Timed transitions must be owned by the live game instance and cleared on Restart/New Game/navigation to avoid stale callbacks.
- Prefer native button behavior for cards and reveal cards. Page-level keyboard handlers must not double-handle Enter/Space from focused buttons.
- Confetti must respect reduced motion and must not create unbounded work; a finite animation or cheap DOM effect is acceptable.
- Do not implement prototype-only controls such as `cutoffMode` or `matchPauseMs` as product UI.

### Prototype Assumption Disposition _(required if Claude Design implements from its own prototype)_

| Assumption type | Details |
| ---------------- | ------- |
| Accepted prototype assumptions | Board fitting can be computed from table dimensions; cards keep list order while state changes; reveal and confirm behave as stacked overlays; New Game is non-destructive until Go; game-in-progress means touched by card flip or Show All. |
| Modified prototype assumptions | End/best-score storage behavior is split: end result belongs here, durable best-score persistence can wait. Placeholder face rendering must follow production content boundaries. Timers and focus handling must be testable Angular services/helpers rather than class-local runtime code. |
| Rejected prototype assumptions | Prototype runtime, inline personal content, prototype-only tweak controls, looping confetti as an unchecked default, and duplicated card-face markup. |
| Mandatory divergence from prototype | Production must use standalone Angular components without explicit `standalone: true`, signals for state, separate component files/folders, no `any`, no `ngClass`/`ngStyle`, and all implemented states must pass the widened axe checks. |

The implementing Claude Code session must treat this Step and authoritative architecture as controlling, even when they conflict with the prototype.

---

## Acceptance Checks

- [ ] AC1: Go deals a live board from the STEP-03 deck; the board renders exactly the dealt card count, uses a shared K-n-C back for all down cards, and does not expose face identity from the back.
- [ ] AC2: Responsive board layout supports 4, 20 and 40 cards at phone and tablet portrait/landscape viewports; cards keep 3:4 ratio, respect the minimum size, incomplete rows are left-aligned, and vertical table scrolling is available only as fallback.
- [ ] AC3: Resizing or rotating re-wraps the board without changing card order, card IDs, face-up/down/gone state, active player, attempts, timer or score.
- [ ] AC4: Card buttons are keyboard reachable in grid order, skipped when gone, at least 44 px target where rendered, and selectable with Enter/Space as well as pointer/touch.
- [ ] AC5: Selecting the first card flips only that card, marks the game in progress and leaves Restart/New Game behavior consistent with R25.
- [ ] AC6: Selecting the second card increments the active player's attempts exactly once, locks input, and opens the reveal after the flip delay.
- [ ] AC7: Every two-card turn opens the pair reveal with two large side-by-side card faces, focus on the first reveal card, trapped Tab, and cream focus ring.
- [ ] AC8: Match flow: matching cards are announced/rendered as "Match!", auto-dismiss after the pause, become gone with invisible empty slots, do not move other cards, increment the active player's pair count, and keep the same active player.
- [ ] AC9: Mismatch flow: non-matching cards show "Not a match" and "Tap a card to continue"; scrim tap does nothing; reveal-card tap, Enter or Space dismisses once, turns both cards face down and passes turn in two-player.
- [ ] AC10: Input is locked during reveal, match pause and Show All; cards, Show All, Restart and New Game cannot create overlapping transitions.
- [ ] AC11: Show All is enabled only between turns, flips all remaining non-gone cards for about 3 seconds, adds one attempt to the current player, keeps the same turn, keeps the timer running, and restores prior down/up state correctly.
- [ ] AC12: Header values update from real state: attempts, pairs, active-player highlight and single-player running timer. Two-player shows no timer.
- [ ] AC13: The game ends when all cards are gone. The end screen shows no birthday message and displays single-player attempts/time or two-player winner/tie using pairs matched and fewest-turn tie-break.
- [ ] AC14: End screen actions work: Restart immediately deals a fresh game with the same options and reset scores/timer; New Game opens the options popup over the completed game; Close/Escape returns to the same end screen.
- [ ] AC15: Restart during a game in progress shows "Start over?" with "Keep playing" secondary action; confirming restarts with same options. Restart before any card flip/Show All and from a completed game does not ask.
- [ ] AC16: Go from an options popup opened over a game in progress shows "Start over?" with "Back to options" secondary action; confirming deals with draft options; cancelling preserves the draft and live game behind the popup.
- [ ] AC17: New Game never asks "Start over?"; it opens the options popup with current settings while preserving live board, scores, turn, face-up card, timer value and focus-return behavior.
- [ ] AC18: Restart after the cutoff re-rolls deck, difference types and player assignment using the STEP-03 rules; before cutoff it preserves Kira-first behavior.
- [ ] AC19: Reduced motion removes or shortens card flip, reveal, disappear and confetti motion while preserving state changes and timing semantics required for play.
- [ ] AC20: D1 is fixed: post-Go/play state passes axe, including at a narrow viewport with a scrollable table and focusable cards.
- [ ] AC21: D2 is fixed: the game header content is inside an appropriate landmark and the widened axe check reports no undocumented `region` or landmark findings.
- [ ] AC22: D4 is fixed: Playwright axe helper reports serious, critical, moderate, minor and best-practice findings unless a documented exception is explicitly allowed.
- [ ] AC23: Clock-pinned e2e covers both sides of `2026-10-11T00:00 America/Denver`, proving birthday/generic splash and Kira/random player behavior in the browser independent of the real date.
- [ ] AC24: Existing STEP-02/STEP-03 unit, build and e2e smoke coverage still passes: `npm test -- --watch=false`, `npm run build`, and `npm run test:e2e`.
- [ ] AC25: No prototype files, `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md`, `mod-w/sign-off.md` or unrelated implementation areas are edited.

---

## Test Expectations

- Unit tests cover game-state transitions for first flip, second flip, match, mismatch, Show All, end, Restart, New Game, Go confirm and clock/player behavior.
- Component tests cover rendered card states, header values, overlay focus entry/trap/return and reduced-motion branches where practical.
- Browser e2e covers a short complete single-player game, a two-player mismatch turn pass, Show All attempt cost, Restart confirm and Go confirm.
- Layout e2e covers 4, 20 and 40 cards at representative phone/tablet portrait and landscape viewports, including card aspect ratio and order preservation across viewport changes.
- Axe e2e runs with the widened helper on greeting, splash, first-open options, reopened options, post-Go play, reveal, confirm and end screen states.
- Clock-pinned e2e must use Playwright clock controls or an equivalent test-only clock injection; it must not depend on the host date, which is already after the October 11, 2026 cutoff in Europe/Berlin.
- Timed behavior tests should use fake timers, injected clocks or Playwright clock controls where possible instead of sleeping on wall-clock time.

---

## Plan

1. Audit current `GameState`, options flow, overlay focus helper and preview board components after STEP-03.
2. Define the live-game state shape: deck cards, card states, flipped indexes, reveal state, peek state, scores, turn, timer, touched/in-progress flag and end result.
3. Build or replace board/card/card-face components using existing content/domain data and stable test IDs.
4. Implement measured responsive layout and verify order-preserving re-wrap.
5. Implement card selection, reveal overlay, match/mismatch resolution, input locks and timer-safe cleanup for pending transitions.
6. Wire header state, Show All, Restart, New Game, Go confirm and end screen.
7. Apply accessibility fixes D1, D2 and D4, then widen e2e axe coverage to all implemented play states.
8. Add clock-pinned browser e2e for both sides of the Denver cutoff.
9. Run unit, build and e2e verification; record any residual risk for Tech Lead review and QA.

---

## Change Notes

| Date | Change | Reason |
| ---- | ------ | ------ |
| 2026-10-11 | Initial STEP-04 draft. | Plan playable board/reveal/end flow and carry forward STEP-02/STEP-03 accessibility and clock e2e items before Development Team implementation. |

---

## Review Notes

---

## QA Notes

---

MOD-W v5.0.1
