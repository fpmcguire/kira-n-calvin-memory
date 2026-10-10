# STEP-02 - Game Shell, Splash and Options Draft

**Status:** Approved by Moderator for QA handoff
**Development Team interface:** Claude Code
**Step type:** Implementation

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** STEP-02 was approved as part of the approved roadmap sequencing; this file was backfilled after implementation began because the standalone Step document was missing.
- **Review Gate:** Moderator approved the Development Team's STEP-02 work for Tech Lead review, and approved the Tech Lead review decision to hand STEP-02 to QA on 2026-10-10.

## Goal

Build the first production game route slice after the greeting page: a static Angular game shell with splash, header skeleton, preview board and options popup draft flow. This Step establishes the state shape and interaction contracts for later deck-building and play-loop work without implementing card matching.

## Requirements

- R2: game opens with a roughly 3 second splash; tap can skip; birthday variant before cutoff and generic brand variant after.
- R3: cutoff is data-driven as `2026-10-11T00:00` in `America/Denver`.
- R4: before cutoff, Kira is the single player and Kira starts two-player; after cutoff, player/first player are randomized on Go.
- R5: after splash, board is displayed and options popup opens over it.
- R6: popup has player, variants, fill and theme checkboxes plus Reset and Go.
- R7: Go disabled until at least one theme is checked; Reset clears all options.
- R8: Fill the grid shows exact 4-40 card count controls in steps of 4.
- R19: header shows player blocks with attempts and pairs.
- R20: single-player header shows a timer placeholder.
- R24: New Game opens options with current settings.
- R30: preview card backs use K-n-C text placeholder until final logo exists.
- R33: keyboard support and large tap targets for implemented controls.
- R37: options popup opened from a game has Close/Escape and returns unchanged.

## Related Design IDs

| Design ID | Design element | Design intent to preserve | Product requirement |
| --------- | -------------- | ------------------------- | ------------------- |
| DS-001 | Splash | Full viewport, birthday/generic variants, tap/keyboard dismissal, no date eyebrow. | R2, R3 |
| DS-002 | Game header | Brand, score blocks and action group in wrapping persistent header. | R19, R20 |
| DS-003 | Player score block | Kira/Calvin blocks, active highlight, fixed Kira/Calvin order in two-player. | R4, R19 |
| DS-004 | Timer | Single-player timer placeholder; later pause behavior under popup. | R20, R37 |
| DS-005 | Header action buttons | Show All, Sound, Restart, New Game with disabled states where not yet active. | R24, R31 |
| DS-006 | Sound toggle | On/off visual state placeholder. | R31 |
| DS-007 | Board/table | First-open face-down preview count follows draft options. | R5, R13, R14, R37 |
| DS-010 | Options popup | Draft-only options, first-open/reopened contexts, Reset/Go behavior. | R5, R6, R7, R24 |
| DS-011 | Fill-the-grid stepper | 4-40 exact count controls in steps of 4. | R8 |
| DS-019 | Card count summary | "N cards · N pairs" and empty-theme message. | R8, R9 |
| DS-020 | Cutoff-driven player assignment | Before/after cutoff player selection rules. | R3, R4 |
| DS-023 | Keyboard interaction and focus ring | Enter/Space where native controls allow; focus visible. | R33 |
| DS-025 | Popup Close/Escape | Return to current game unchanged. | R24, R37 |
| DS-026 | Overlay focus management | Focus moves in, Tab is contained, focus returns on close. | R33, R37 |

## Scope

- Replace the game placeholder route with a game shell route under `src/app/game/`.
- Keep `src/app/greeting/` separate from game state and styling ownership.
- Add edition content data for children, themes, brand copy and cutoff.
- Add pure helpers for cutoff and option/card-count calculations needed by the shell.
- Add injectable/testable clock and random providers.
- Add header skeleton, splash, preview board and options popup components.
- Use Angular signals for shell/options state.
- Use separate `.ts`, `.html` and `.scss` files in each component's own folder.
- Add or update unit tests for cutoff, options and shell interactions.
- Add Playwright e2e smoke coverage for route navigation if e2e tooling is added.
- Keep local base href as `/`; use a build script for subfolder deployment.

## Out of Scope

- Deck-building rules R9-R12 beyond simple card-count/preview math.
- Real card faces, SVG art, final logo assets or card matching.
- Full play loop, reveal overlay, matched/gone card states and scoring.
- Real timer progression, persistence, sounds, confetti and end screen.
- Show All behavior beyond disabled header placeholder.
- Confirm dialog for "Start over?".
- `qa.md` or Product Owner sign-off.
- Editing prototype files or `mod-w/design-spec.md`.

## Inputs

- `mod-w/product.md`
- `mod-w/design-spec.md`
- `mod-w/architecture.md`
- `mod-w/roadmap.md`
- `mod-w/review.md` from STEP-01
- `AGENTS.md`
- Existing Angular source under `src/app/`

## Expected File Changes

- `src/app/app.routes.ts`
- `src/app/game/**`
- `src/app/domain/**`
- `src/app/content/**`
- `src/styles.scss` if shared shell tokens/buttons are needed
- `src/app/app/**` and `src/app/greeting/**` only for file-organization conventions
- `package.json`, `package-lock.json`, `playwright.config.ts`, `e2e/**` only if Playwright is introduced
- `README.md` for updated local/deployment/test commands

## Acceptance Checks

- AC1: `/game` lazy-loads the game shell; greeting remains separate and still links to `/game`.
- AC2: Before the cutoff, the birthday splash appears; after the cutoff, the generic K-n-C splash appears.
- AC3: Splash auto-advances after about 3 seconds and can be skipped by user activation.
- AC4: After splash, an options popup opens over a face-down preview board.
- AC5: First-open options default to all ten themes checked, two players off, variants off and fill off.
- AC6: Reset clears all options, disables Go and updates the preview count to zero.
- AC7: Go is disabled until at least one theme is checked, then applies the draft and closes the popup.
- AC8: Variants and fill controls update card count summary and preview count correctly for STEP-02 preview math.
- AC9: Fill control supports exact values from 4 to 40 in steps of 4.
- AC10: Header shows Kira/Calvin blocks, attempts/pairs placeholders, timer placeholder for single-player and disabled unavailable actions.
- AC11: Cutoff-driven player assignment follows R4 before and after cutoff.
- AC12: New Game reopens the options popup with current settings; Close/Escape discards draft changes and restores focus.
- AC13: Overlay focus moves into splash/options, traps Tab within options, and restores focus on close.
- AC14: Implemented controls have visible focus and large tap targets; automated axe checks pass for splash, first-open options and reopened options states.
- AC15: `npm test -- --watch=false`, `npm run build`, `npm run build:subfolder` and `npm run test:e2e` pass where tooling exists.
- AC16: No prototype files, `mod-w/design-spec.md`, `qa.md` or Product Owner sign-off files are edited.

## Test Expectations

- Unit tests for cutoff before/after behavior.
- Unit tests for option defaults, reset, fill-count clamping/stepping and card-count summary.
- Component tests for splash, options popup, header player assignment, New Game/Close/Escape, focus movement and focus trap.
- Playwright e2e smoke test for greeting-to-game route navigation.
- Automated axe coverage for the STEP-02 shell/options/splash states. If tooling is absent, add it rather than deferring again for this Step.

## Reference Implementation

Prototype areas exist for splash, options popup, preview board and focus stack, but prototype code is non-Angular and not production architecture.

- Splash behavior: Adopt with modifications.
- Options popup behavior: Adopt with modifications.
- Preview board concept: Adopt with modifications.
- Focus stack: Adopt with modifications.
- Prototype runtime/code: Reject.

Required changes from prototype:

- Rebuild in Angular with signals and standalone components.
- Keep content data separate from game engine/component code.
- Do not import or port Claude Design runtime code.
- Use production accessibility/focus behavior and tests rather than prototype-only evidence.
- Keep this Step to shell/options draft state only; no card matching or full play loop.

## Notes for Development

- Prefer test IDs from `mod-w/design-spec.md` where specified.
- Keep local development at base href `/`; use `npm run build:subfolder` for `/kira-n-calvin-memory/` deployment.
- Do not share component styles across greeting/game folders; move shared tokens or button styles to global styles only when needed.

