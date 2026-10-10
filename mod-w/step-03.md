# STEP-03 - Domain Engine and Deck Rules

**Status:** Approved by Moderator for Development Team implementation
**Development Team interface:** Claude Code
**Step type:** Implementation

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the Tech Lead STEP-03 plan for Development Team implementation.

---

## Goal

Build the pure TypeScript game domain engine for cutoff-driven player assignment, deck construction, variant-difference assignment and matching. This Step turns the product rules into deterministic, exhaustive tests while keeping personal Kira/Calvin content separate from reusable engine logic.

---

## Related Requirements

- R3 - The cutoff is data-driven as `2026-10-11T00:00` in `America/Denver`.
- R4 - Before cutoff, Kira is the single player and Kira starts two-player; after cutoff, player/first player are randomized on each game start and Restart.
- R9 - Variants off yields one pair per checked theme; variants on yields two pairs per checked theme.
- R10 - Fill on with more supply than needed randomly chooses checked themes and includes whole pairs until the requested card count is met.
- R11 - Fill on with less supply than needed repeats pairs round-robin, then distributes leftover pairs so no pair appears more than one extra time than another.
- R12 - Cards match by face identity only: same theme and same variant. Grid position does not matter, and repeated pairs share one face identity.
- R28 - The variant difference type is randomized per game.
- R35 - Personal content is kept separate from the game engine.

## Related Design IDs _(if design-spec.md exists)_

| Design ID | Design element | Design intent to preserve | Product requirement |
| --------- | -------------- | ------------------------- | ------------------- |
| DS-009 | Card face variant cues | Difference type is chosen per theme per game; color differences must also have the secondary dot-pattern cue. | R9, R28, R29 |
| DS-020 | Cutoff-driven player assignment | Before cutoff forces Kira; after cutoff randomizes single-player and first player on each Go and Restart. Header order remains Kira, Calvin. | R3, R4 |

---

## Assigned Dev Team Interface

> Moderator decision. Default is Claude Code.

- [x] Claude Code (default)
- [ ] Claude Design (visual / chart / interaction-heavy Step)

**Hard rule:** if Claude Design is assigned here, it MUST NOT have authored this `step-xx.md`. Codex writes the spec; Claude Design implements against it. Plan vs. implement model contrast is preserved.

---

## Scope

- Define or refine domain types for child IDs, theme IDs, variant IDs, face identity, difference type, game options, player mode, player assignment, pair identities and deck cards.
- Keep engine code pure and reusable under `src/app/domain/`; it must not import Angular component files or gift-edition personal data directly.
- Keep Kira/Calvin edition data under `src/app/content/` behind typed content interfaces, including children, themes, cutoff record and allowed difference types.
- Implement cutoff comparison from a data record and an injected/provided clock value, preserving `America/Denver` behavior.
- Implement player assignment for Go and Restart using an injectable/random source: forced Kira before cutoff, randomized Kira/Calvin after cutoff.
- Implement variant difference assignment per game and per selected theme. When the difference type is `color`, the returned face metadata must preserve the DS-009 secondary cue requirement.
- Implement deck construction as a pure pair-list step followed by doubling into cards and shuffling.
- Implement exact card-count rules for variants off/on and fill off/on.
- Implement matching by face identity only, including repeated pairs.
- Connect the existing shell/options flow only as far as needed to use the domain helpers for applied options, preview/dealt card counts, player assignment and deck creation. Keep UI behavior minimal and within existing STEP-02 surfaces.
- Add exhaustive unit tests for the full selected-themes x variants x fill matrix.

---

## Out of Scope

- Responsive board fitting, card selection, flipped/up/gone visual states, reveal overlay, match/mismatch timing and empty-slot layout.
- Show All behavior.
- Scoring, attempts, end screen, Restart/New Game confirm flow, persistence and best scores.
- Final SVG art, logo assets, sound files or production card illustration rendering.
- Accessibility fixes D1, D2 and D4 from STEP-02; these are owned by STEP-04.
- D3 fill-slider target-size follow-up; this is owned by STEP-06.
- Clock-pinned Playwright e2e for browser splash coverage; this is owned by STEP-04 because STEP-03 verifies cutoff logic in pure unit tests, while the residual risk is browser-visible e2e coverage.
- Editing prototype files, `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md` or `mod-w/sign-off.md`.

---

## Inputs

- `mod-w/product.md` (R3, R4, R9-R12, R28, R35)
- `mod-w/design-spec.md` (DS-009, DS-020)
- `mod-w/architecture.md` (`src/app/domain/`, `src/app/content/`, pure deck-building rules, cutoff and time)
- `mod-w/architecture-notes.md` (OBS-005, OBS-006, OBS-008, OBS-009, OBS-013)
- `mod-w/roadmap.md` (STEP-03 row)
- Existing STEP-02 game shell/options/content code

---

## Expected File Changes

- `src/app/domain/**`
- `src/app/content/**`
- `src/app/game/**` only where needed to consume the new domain engine from the existing shell/options flow
- `src/app/**/*.spec.ts` for domain and integration unit coverage
- `e2e/**` only if existing smoke tests need selector-safe adjustment after domain integration; do not add the clock-pinned e2e in this Step
- `README.md` only if test commands or domain conventions need documentation

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

- Preserve the prototype's pair-list then double-and-shuffle shape, but rewrite it as pure TypeScript domain code with deterministic random injection and exhaustive tests.
- Preserve matching by `{ themeId, variantId }`; do not use grid index or card instance ID for match equality.
- Move inline prototype content into typed edition content records; domain code consumes interfaces and IDs only.
- Treat the architecture decision as controlling for R11: balance repeated supply by pair identity unless Product Owner explicitly clarifies otherwise.
- Implement cutoff from data plus injected clock/`now`; do not hard-code the UTC instant into game logic.
- Keep DS-009 difference types as typed values and make the secondary cue explicit for color differences.
- Do not port Claude Design runtime code or prototype markup.

### Prototype Assumption Disposition _(required if Claude Design implements from its own prototype)_

| Assumption type | Details |
| ---------------- | ------- |
| Accepted prototype assumptions | Pair-list deck construction; face-identity matching; per-game difference types; content can be represented as plain records. |
| Modified prototype assumptions | R11 leftover balancing is by pair identity for testability and direct R12 alignment, not by UI theme labels. Cutoff and random behavior must be injectable for tests. |
| Rejected prototype assumptions | Inline personal content inside game logic; prototype runtime/code as production source. |
| Mandatory divergence from prototype | Angular production code must live behind `src/app/domain/` and `src/app/content/` boundaries and remain strictly typed. |

---

## Acceptance Checks

- [ ] AC1: Domain types model `ChildId`, `ThemeId`, `VariantId`, `DifferenceType`, `FaceId`, pair identity, deck card identity, `GameOptions`, selected themes, player mode and cutoff data without using `any`.
- [ ] AC2: Gift-edition content for Kira/Calvin children, ten approved themes, cutoff data and allowed difference types lives outside the domain engine and is accessed through typed interfaces.
- [ ] AC3: Cutoff comparison is data-driven and unit-tested immediately before, exactly at and after `2026-10-11T00:00 America/Denver`.
- [ ] AC4: Player assignment follows R4 and DS-020 before and after cutoff for both single-player and two-player modes, with deterministic random tests proving both Kira and Calvin can be selected after cutoff.
- [ ] AC5: Variants off with fill off creates exactly one pair per selected theme and two cards per pair.
- [ ] AC6: Variants on with fill off creates exactly two variant pairs per selected theme and four cards per selected theme.
- [ ] AC7: Fill on always creates exactly the requested card count for every allowed fill value from 4 to 40.
- [ ] AC8: Fill on with more pair supply than needed selects only checked themes, includes whole pairs, never creates orphan cards, and honors the "theme includes both variant pairs when variants are on" rule.
- [ ] AC9: Fill on with less pair supply than needed repeats pair identities round-robin and distributes leftovers so no pair identity appears more than one extra time than another.
- [ ] AC10: Extreme boards are valid, including one selected theme, variants off, fill 40.
- [ ] AC11: Every produced deck has an even number of cards, contains only whole pairs, and can be grouped by face identity without remainder.
- [ ] AC12: Matching uses face identity only. Two copies of the same repeated pair match even when card IDs and positions differ; same theme with different variant does not match.
- [ ] AC13: Variant difference types are assigned per selected theme per game, re-rollable through the random source, and color differences expose the secondary cue required by DS-009.
- [ ] AC14: Existing options/card-count UI behavior from STEP-02 still passes after switching to the domain engine.
- [ ] AC15: `npm test -- --watch=false` and `npm run build` pass. Existing e2e smoke tests continue to pass if run for regression, but no new clock-pinned e2e is required in STEP-03.
- [ ] AC16: No implementation files outside the expected areas, prototype files, `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md` or `mod-w/sign-off.md` are edited.

---

## Test Expectations

- Unit tests must cover the full selected-themes x variants x fill matrix:
  - every non-empty subset of the ten themes;
  - variants off and variants on;
  - fill off;
  - fill on for each allowed count: 4, 8, 12, 16, 20, 24, 28, 32, 36 and 40.
- Matrix assertions must verify exact card count, whole-pair integrity, legal selected-theme use, legal variant use and no orphan faces.
- Targeted tests must separately cover R10 supply-greater-than-needed cases and R11 supply-less-than-needed cases, including one-theme 40-card extremes.
- Randomized paths must use deterministic random stubs or seeded helpers so tests are repeatable and prove branch behavior without statistical flakiness.
- Cutoff tests must pin `now` rather than relying on the host clock.
- Matching tests must include repeated pair copies, same-theme/different-variant non-matches and different-theme non-matches.
- Content-boundary tests or compile-time structure should make it clear that `src/app/domain/` does not import `src/app/game/` components or gift-edition content records directly.

---

## Plan

1. Audit current STEP-02 domain/content helpers and decide what stays, moves or is replaced.
2. Define the domain interfaces and content interfaces before wiring any UI.
3. Implement cutoff, player assignment, difference assignment, pair-list building, deck doubling/shuffling and match predicates as pure functions.
4. Add exhaustive matrix tests and targeted edge-case tests.
5. Wire the existing shell/options flow to the new helpers only where needed for applied options, counts, player assignment and deck creation.
6. Run unit/build verification and any existing e2e smoke tests needed to guard STEP-02 behavior.

---

## Change Notes

| Date | Change | Reason |
| ---- | ------ | ------ |
| 2026-10-10 | Initial STEP-03 draft. | Plan Domain Engine and Deck Rules after STEP-02 Moderator approval. |
| 2026-10-10 | Recorded Moderator approval. | Moderator approved Tech Lead plan for STEP-03. |

---

## Review Notes

---

## QA Notes

---

MOD-W v5.0.1
