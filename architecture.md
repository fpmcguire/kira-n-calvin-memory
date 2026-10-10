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

- `splash`: birthday or generic, derived from a data-driven cutoff.
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

The cutoff is content data: `{ localDateTime: "2026-10-11T00:00", timeZone: "America/Denver", player: "kira" }` (R3). A clock service/function supplies `now`, making both sides of the cutoff testable. The production comparison may use platform `Intl` time-zone support; if browser support proves weak, add a small time-zone utility rather than hard-coding the UTC instant.

Before cutoff, single-player is Kira and Kira starts two-player. After cutoff, single-player and first player are randomized on each Go and Restart (R4, DS-020).

## Accessibility and Testing

WCAG 2.2 AA is a baseline, not a polish pass. Each overlay must move focus in, trap focus while open, and restore focus on close. Enter and Space are handled by the focused control where possible; page-level handlers must not double-fire when the target is a button, addressing OBS-012.

Evidence owners:

- Step 01: greeting page accessibility, link behavior and axe pass.
- Step 02: shell/options/splash focus, keyboard and axe pass.
- Step 03: deck-building unit-test matrix for R9-R12.
- Step 04: board/reveal keyboard, focus and reduced-motion behavior.
- Step 05: timer, popup return, confirm and persistence behavior.
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

