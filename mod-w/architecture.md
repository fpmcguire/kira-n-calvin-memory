# Architecture - Kira-n-Calvin Memory Game

**Date:** 2026-10-10
**Tech Lead:** Codex
**Status:** Approved by Moderator

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved Tech Lead architecture handoff work for STEP-01 planning.

## Stack and Delivery

- Angular 22 project, satisfying the Angular 21+ constraint (R34). Use standalone components without explicit `standalone: true`.
- Static build only: no backend, no server state, no accounts, no remote API calls.
- Host under a subfolder of `kira-n-calvin.com`; the exact base href and folder name remain a Product Owner/site-repo question (R34).
- Use Angular signals for game, options and UI state. Use RxJS only where Angular platform APIs require it.
- Use Vitest/Angular unit tests for domain logic and component behavior. Use browser-based accessibility and layout checks for WCAG evidence.

## Application Boundaries

- `src/app/greeting/`: separate birthday greeting route/page for R1. It links to the game but is not part of the game state machine.
- `src/app/game/`: production game shell, overlays, board, cards and header.
- `src/app/domain/`: pure TypeScript rules for options, cutoff, deck building, matching, scoring and game-progress checks.
- `src/app/content/`: edition-specific content records: children, themes, cutoff, card art references, logo reference and copy. The engine imports content through typed interfaces, not from component files (R35).
- `public/content/kira-calvin/`: static SVG art and logo assets for the gift edition. Public edition content can replace this package without rewriting the engine.

## Data Model

- `ChildId`: `kira | calvin`.
- `ThemeId`: one ID per approved activity.
- `VariantId`: `base | alternate`.
- `DifferenceType`: `color | pattern | accessory | orientation`.
- `FaceId`: `{ themeId, variantId }`; two cards match only when both fields match (R12).
- `Card`: `{ id, faceId, state }`, where state is `down | up | gone | peeked`.
- `GameOptions`: player count, variants flag, fill flag, fill card count and selected themes.
- `EditionContent`: children, brand, cutoff record, themes and art references. It owns personal likeness/activity data; domain rules do not.

## State Model

Use one top-level signal-backed state with explicit sub-states:

- `splash`: birthday or generic, derived from the build-time `permanentBirthday` flag or, in the `dated-birthday` build, from the data-driven cutoff (R2, R38).
- `options`: a non-destructive overlay with `draftOptions` and optional `returnTo`.
- `play`: live game record with deck, scores, turn, timer, flipped indices and turn state.
- `end`: completed game record and result.

Transient overlays are modeled as stackable UI state: `options`, `confirm`, `reveal`, `end`. The options popup is an overlay over a preserved live or completed game, not a replacement for the game record (R37, DS-025, DS-026). Opening it pauses the single-player timer by recording a pause instant; closing shifts elapsed time so the live timer resumes unchanged.

Header New Game and Restart stay disabled while input is locked, during a reveal, or during Show All. This follows the prototype and avoids pending transition conflicts under the options popup.

## Domain Rules

Deck building is a pure function:

1. Build available pair identities from selected themes and variants (R9).
2. Without fill, use all available pair identities.
3. With fill and enough supply, randomly choose themes and include both variant pair identities for a chosen theme when variants are on until the exact pair count is met (R10).
4. With fill and insufficient supply, repeat the full pair-identity supply round-robin, then choose a shuffled remainder so no pair identity appears more than one extra time than another (R11).
5. Double each pair identity into two cards and shuffle cards.

The R10 wording is theme-oriented while R12 is face-oriented. Production tests will enforce whole pairs and repeated face identity matching; if Product Owner wants remainder balancing by theme rather than pair identity, that is a product clarification before Step 03.

## Cutoff and Time

The cutoff is content data: `{ localDateTime: "2026-10-11T00:00", timeZone: "America/Denver" }` (R3). Since 2026-10-11 it holds no player. A clock service/function supplies `now`, making both sides of the cutoff testable. The production comparison may use platform `Intl` time-zone support; if browser support proves weak, add a small time-zone utility rather than hard-coding the UTC instant.

The cutoff affects the splash only, and only in the `dated-birthday` build. Players come from `GameOptions.players`, the checked Kira and Calvin boxes: `assignPlayers(selected, children, random)` in `src/app/domain/players.ts` returns single-player for one child and two-player with a random first player for both, rolled on each Go and Restart (R4, DS-020). `canGo` needs at least one player and one theme; `cardCount` depends on themes only, so the preview board does not change with players.

## Build-Time Feature Flags (R38)

- `src/app/config/feature-flags.ts` exports `FEATURE_FLAGS.permanentBirthday`, default `true`. It is the default build.
- `angular.json` configuration `dated-birthday` replaces that file with `src/app/config/feature-flags.dated.ts`, which sets the flag to `false`. Build with `npm run build:dated-birthday` (`ng build --configuration production,dated-birthday`).
- The flag is read once, in `GameState.birthdaySplash`, through the pure helper `showsBirthdaySplash(now, cutoff, permanent)` in `src/app/domain/cutoff.ts`. The domain does not import the config.
- The flag changes the splash only. Player assignment reads neither the flag nor the cutoff.
- Test coverage: unit tests for the pure helper run in both modes. Component tests that depend on the build flag use `it.skipIf`. Browser tests in `e2e/cutoff.spec.ts` use `test.skip` on the same flag, and they run only against the default build. Running the browser suite against the dated build is not wired up.

## Device Persistence and Sound

STEP-05 adds client-only persistence for R36. Store only non-sensitive game preferences and scores in browser storage:

- Last-used options: `GameOptions`, including `players` as an array of child IDs, `variants`, `fill`, `fillCount` and selected `themes`.
- Best scores: single-player only, keyed by player, card count and variants on/off, matching DS-024. Store attempts as the primary score and optionally the elapsed time as supporting display data. Do not store two-player results unless a later Product Owner decision changes DS-016.
- Sound preference: boolean on/off state for the header sound toggle.

Persistence belongs behind a small game storage service/helper that validates parsed data before using it. If stored data is absent, malformed, stale, or references unknown players/themes, fall back to current defaults rather than blocking game startup. Storage failures, including private-mode quota/security errors, must degrade silently to in-memory behavior.

Sound feedback for STEP-05 should use a small, injectable sound service. Placeholder tones generated through Web Audio are acceptable until final sound assets arrive in STEP-06. The service respects the persisted sound preference and never becomes the only feedback channel: flip, match and win already have visible state changes. Tests should use a stub/fake sound service rather than real audio playback.

## Accessibility and Testing

WCAG 2.2 AA is a baseline, not a polish pass. Each overlay must move focus in, trap focus while open, and restore focus on close. Enter and Space are handled by the focused control where possible; page-level handlers must not double-fire when the target is a button, addressing OBS-012.

Evidence owners:

- Step 01: greeting page accessibility, link behavior and axe pass.
- Step 02: shell/options/splash focus, keyboard and axe pass.
- Step 03: deck-building unit-test matrix for R9-R12.
- Step 04: board/reveal keyboard, focus and reduced-motion behavior.
- Step 05: storage behavior, best-score display, persisted sound preference and stubbed sound cue calls. Timer, popup return and confirm already have STEP-04 evidence.
- Step 06: real-device or browser-matrix layout evidence, rendered contrast checks and screen-reader smoke tests.

## Decisions That Diverge From Prototype

- The greeting page is built first and separately because R1 is the earliest Must-have and is not prototyped.
- Personal content moves out of the engine into typed static content and asset files; the prototype keeps theme and child data inline.
- Deck building becomes pure domain logic with exhaustive tests before full game UI, rather than embedded in the page object.
- The options popup is modeled as an overlay over a preserved game record; the prototype approximates this with `phase` plus `returnTo`.
- Card face rendering is a shared Angular presentation component for grid and reveal; the prototype duplicates markup.
- The production app will use static SVG art references and `NgOptimizedImage` for static image assets where applicable. Inline base64 images are disallowed.
- Confetti should run finitely or be cheap to disable, rather than looping indefinitely by default.
- Runtime tweak controls such as `cutoffMode` and `matchPauseMs` are test/dev fixtures only, not product UI.

## Open Architecture Questions

- Which repository and subfolder serve the greeting page and game?
- What exact greeting page copy/assets are approved for R1?
- Are likenesses based on real photos or described traits?
- What is the final K-n-C logo asset path and format?
- Should R11 remainder balancing be defined by pair identity or by theme when variants are on?
- Which real devices/browsers are required for layout and screen-reader evidence?

