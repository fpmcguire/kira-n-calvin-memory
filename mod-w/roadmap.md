# Roadmap - Kira-n-Calvin Memory Game

**Date:** 2026-10-10
**Tech Lead:** Codex
**Status:** Approved by Moderator

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved Tech Lead roadmap and STEP-01 sequencing.

## Sequencing Decision

R1 is the earliest Must-have and is not designed. Ship the greeting page first as a small static Angular route/page that follows the site folder-per-occasion pattern and links to the game route. The game follows in incremental slices, beginning with shell/options and pure domain rules before full play.

## Step Status

| Step | Status | Date | Notes |
| ---- | ------ | ---- | ----- |
| 01 | Approved by Moderator | 2026-10-10 | Greeting route, game placeholder and static base-path assumptions accepted with follow-ups in `review.md`. |
| 02 | Approved for QA | 2026-10-10 | Game shell, splash, options draft flow, Playwright e2e and axe coverage accepted by Tech Lead and Moderator. |

## Steps

| Step | Title | Scope | R-IDs | DS-IDs | Evidence owner |
| ---- | ----- | ----- | ----- | ------ | -------------- |
| 01 | Greeting Page and Static Hosting Shape | Build the separate birthday greeting page, route/link to game placeholder, and document base-href/subfolder assumptions. | R1, R34 | None; design-spec section 4.7 notes not designed | Greeting accessibility/link checks |
| 02 | Game Shell, Splash and Options Draft | Angular shell, splash cutoff branch, header skeleton, preview board, options popup, draft/reset/go states. | R2-R8, R19, R20, R24, R30, R33, R37 | DS-001-DS-011, DS-019, DS-020, DS-023, DS-025, DS-026 | Axe, keyboard/focus, cutoff unit tests |
| 03 | Domain Engine and Deck Rules | Pure game options, cutoff, deck-building and matching rules with exhaustive tests. | R3, R4, R9-R12, R28, R35 | DS-009, DS-020 | Unit-test matrix for every themes x variants x fill combination |
| 04 | Play Loop, Board and Reveal | Responsive board, card states, selection, match/mismatch reveal, empty slots, Show All, animations/reduced motion. | R12-R18, R26, R29, R32, R33 | DS-007-DS-015, DS-022, DS-023, DS-026 | Component tests plus browser layout checks |
| 05 | End Screen, Restart/New Game and Persistence | End results, confetti, Restart/New Game confirm rules, best scores, last options, sound toggle placeholder. | R21-R25, R31, R36, R37 | DS-004-DS-006, DS-016-DS-018, DS-021, DS-024-DS-026 | Timer/popup return tests, storage tests |
| 06 | Content, Art, Device QA and Release Hardening | Integrate final SVG art/logo/sounds, contrast/screen-reader checks, real-device layout evidence, production base path. | R27, R29, R30, R31, R34, R35 | All implemented DS IDs | Real device/browser evidence and QA handoff |

## Reference Implementation Dispositions

| Prototype area | Disposition | Rationale |
| -------------- | ----------- | --------- |
| Splash cutoff behavior | Adopt with modifications | Preserve approved behavior; move cutoff to content data and injectable clock. |
| Options popup behavior | Adopt with modifications | Preserve non-destructive draft/Close behavior; implement with Angular overlay/focus utilities. |
| Deck building | Adopt with modifications | Use the pair-list approach, but rewrite as pure tested domain logic and clarify R11 balancing. |
| Responsive grid fit | Adopt with modifications | Keep measured-container idea; implement via Angular resize handling and test 40-card layouts. |
| Card face composition | Adopt with modifications | Keep one scalable face concept; use shared component and static SVG art/content separation. |
| Focus stack | Adopt with modifications | Keep stacked-overlay semantics; avoid double key paths and verify with axe/screen-reader smoke tests. |
| Prototype inline data | Reject | Violates R35; content must be separate from engine. |
| Prototype code/runtime | Reject | Claude Design HTML/runtime is non-production and not Angular. |

