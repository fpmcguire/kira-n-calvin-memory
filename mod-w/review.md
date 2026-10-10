# Technical Reviews

## STEP-03 Technical Review

**Date:** 2026-10-10
**Reviewer:** Codex Tech Lead
**Status:** Approved by Moderator for QA handoff

### Verdict

Approve for QA handoff.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the Development Team's STEP-03 work for Tech Lead review and approved the Tech Lead review decision to hand STEP-03 to QA.

### Scope check

The implementation stays within STEP-03's approved domain-engine scope. Changes are limited to `src/app/domain/**`, `src/app/content/**`, and `src/app/game/game-state*`, with no prototype, design-spec, QA, sign-off, or STEP-04 UI behavior edits observed.

### Findings

#### Must fix now

None.

#### Could fix later

1. Consider adding a stronger import-boundary guard later if the project adds Node typings or a lint layer. For STEP-03, the structural check is acceptable: domain files import only sibling domain modules, and content imports only domain types plus content siblings.

### Acceptance check mapping

- AC1: met - domain types cover player, option, face, deck, difference and cutoff concepts without `any`.
- AC2: met - Kira/Calvin edition content is behind `EditionContent`, with difference types in content data.
- AC3: met - cutoff tests cover immediately before, exactly at and after `2026-10-11T00:00 America/Denver`, plus a second time zone.
- AC4: met - player assignment tests cover before/after cutoff, single/two-player, both random outcomes and fixed header order.
- AC5: met - variants-off/fill-off deck tests prove one pair and two cards per selected theme.
- AC6: met - variants-on/fill-off deck tests prove two variant pairs and four cards per selected theme.
- AC7: met - fill-on matrix covers exact counts 4 through 40.
- AC8: met - R10 targeted tests cover checked-theme selection, whole-pair integrity and whole-theme behavior with variants on.
- AC9: met - R11 targeted tests cover round-robin repetition, one-theme 40-card boards and balanced remainders.
- AC10: met - one selected theme across 40 cards is covered for variants off and variants on.
- AC11: met - matrix tests verify even counts, whole pairs, legal themes/variants, unique card IDs and no orphan faces.
- AC12: met - matching tests prove face-identity matching, repeated-pair copies and variant sibling non-matches.
- AC13: met - difference assignment tests prove per-theme assignment, re-rollability and the color secondary cue.
- AC14: met - `game-state.spec.ts` and existing STEP-02 e2e smoke coverage pass after domain integration.
- AC15: met - verification commands passed under Node `v26.0.0`.
- AC16: met - file changes are within expected STEP-03 implementation areas.

### Design ID mapping

- DS-009: met - `DifferenceType` is typed, assigned per selected theme per game, and `color` produces the `dot-pattern` secondary cue.
- DS-020: met - cutoff-driven player assignment preserves Kira-before-cutoff behavior, post-cutoff randomization and Kira/Calvin header order.

### Evidence

- `npm test -- --watch=false` under Node `v26.0.0`: 10 test files passed, 119 tests passed.
- `npm run build` under Node `v26.0.0`: passed.
- `npm run test:e2e` under Node `v26.0.0`: 5 tests passed.
- Boundary spot check: `rg "@angular|\.\./content|\.\./game" src/app/domain` returned no matches; `rg any src/app/domain src/app/content src/app/game/game-state.ts` found no `any` type usage, only ordinary prose.

### Recommended next action

Send STEP-03 to QA. After QA and Product Owner acceptance, the Moderator can decide whether to approve and tag the completed Step.

## STEP-02 Technical Review

**Date:** 2026-10-10
**Reviewer:** Codex Tech Lead
**Status:** Approved by Moderator for QA handoff

### Verdict

Approve for QA handoff.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the Development Team's STEP-02 work for Tech Lead review and approved the Tech Lead review decision.

### Findings

No blocking findings.

The STEP-02 implementation satisfies the approved shell/options/splash scope and the follow-up fixes for automated axe coverage and stable test-id usage. The one design-spec mismatch around stable implementation IDs for sound/player state is accepted as an implementation clarification; carry a non-blocking Design/PO documentation follow-up to update `mod-w/design-spec.md` later.

### Evidence

- `npm test -- --watch=false` under Node `v26.0.0`: 4 test files passed, 32 tests passed.
- `npm run build` under Node `v26.0.0`: passed.
- `npm run build:subfolder` under Node `v26.0.0`: passed.
- `npm run test:e2e` under Node `v26.0.0`: 5 tests passed, including 4 axe checks.
- No prototype files, `mod-w/design-spec.md`, `qa.md` or Product Owner sign-off files were edited.
- Playwright generated artifacts are ignored by `.gitignore`.

### Follow-Ups

- Later Design/PO documentation update: align `mod-w/design-spec.md` test-id notes with stable sound/player IDs plus separate state attributes.
- QA should validate STEP-02 against `mod-w/step-02.md` AC1-AC16 and record results in `qa.md`.

## STEP-01 Technical Review

**Date:** 2026-10-10
**Reviewer:** Codex Tech Lead
**Status:** Approved by Moderator

## Verdict

Approve with follow-ups.

## Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the Development Team's STEP-01 implementation and the Tech Lead review.

## Findings

No required changes.

The implementation satisfies STEP-01 AC1, AC2, AC3, AC5 and AC6, and stays within the approved scope. AC4 automated axe evidence is not complete because the project has no axe tooling; that evidence remains due in QA/Step 06 as documented by the Development Team.

## Evidence

- `git status --short` and `git diff --name-status` showed only the expected STEP-01 files changed.
- No prototype files, `mod-w/design-spec.md`, `qa.md` or Product Owner sign-off files were edited.
- `npm test -- --watch=false` under Node `v26.0.0`: 1 test file passed, 3 tests passed.
- `npm run build`: succeeded and produced static output.

## Follow-Ups

- In Step 02, move any shared greeting/game presentation styles to a shared or global location instead of having game components import from `src/app/greeting/`.
- Before release, confirm the static host serves `index.html` for deep links under `/kira-n-calvin-memory/`; otherwise decide between hash routing and folder-root-only links.
- Carry automated axe evidence forward to QA/Step 06 unless accessibility tooling is added earlier.
