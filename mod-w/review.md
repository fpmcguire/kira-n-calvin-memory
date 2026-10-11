# Technical Reviews

## Post-STEP-04 Change Requests Technical Review

**Commits reviewed:** `998197d` and `2287328`, on top of `acbf175`  
**Diff reviewed:** `git diff acbf175..2287328`  
**Date:** 2026-10-11  
**Reviewer:** Codex Tech Lead  
**Status:** Approved by Moderator

### Verdict

Pass.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved this Tech Lead review. Because the Product Owner implemented the post-STEP-04 changes directly under Moderator instruction, the Moderator also approves passing the QA and Product Owner gates for this situation only. No further rework is required before re-tagging STEP-04 completed.

### Scope check

The implementation change in `998197d` is limited to the approved post-STEP-04 change requests: permanent birthday splash behavior behind a build-time flag, and replacement of the Two players option with Kira/Calvin player checkboxes. The document commit `2287328` records the Moderator-approved product/design/architecture decisions for the same change. The Moderator approval is treated as context only; this review does not rely on it as a technical gate substitute.

### Findings

#### Must fix now

None.

#### Could fix later

1. `assignPlayers([], ...)` currently returns a two-player-shaped assignment with an empty player list and `first` effectively undefined at runtime (`src/app/domain/players.ts:9`). The product UI and `GameState.go()` guard make this unreachable for deals (`src/app/domain/options.ts:24`, `src/app/game/game-state.ts:247`), so it is not a release blocker. A future hardening pass could assert or return a typed empty/error result to make the domain helper total.

### Acceptance check mapping

- R2/R38 permanent birthday splash: met - `FEATURE_FLAGS.permanentBirthday` defaults to true, `GameState.birthdaySplash` reads it through `showsBirthdaySplash`, and the splash template uses that value (`src/app/config/feature-flags.ts`, `src/app/domain/cutoff.ts:28`, `src/app/game/game-state.ts:78`, `src/app/game/game/game.html`).
- R2/R3 dated-birthday build: met - `dated-birthday` replaces `feature-flags.ts` with `feature-flags.dated.ts`, which sets `permanentBirthday: false`, restoring cutoff-only splash behavior (`angular.json`, `src/app/config/feature-flags.dated.ts`).
- R3 cutoff affects splash only: met - `Cutoff.player`, `choosePlayer`, and `GameState.beforeCutoff` are removed; player assignment imports neither cutoff nor feature flags.
- R4 player checkboxes: met - `GameOptions.players` drives `assignPlayers`; one checked child is single-player, both checked is two-player with random first player, and `GameState.startGame` calls assignment on every Go/Restart (`src/app/domain/types.ts`, `src/app/domain/players.ts:9`, `src/app/game/game-state.ts:361`).
- R6 options popup Players group: met - the popup renders a `Players` fieldset and `options-player-checkbox-kira` / `options-player-checkbox-calvin` test IDs (`src/app/game/options-popup/options-popup.html`).
- R7 Go/Reset rules: met - `canGo` requires at least one player and one theme; `resetOptions()` clears both players and themes; summaries distinguish missing player/theme states (`src/app/domain/options.ts:19`, `src/app/domain/options.ts:24`, `src/app/game/options-popup/options-popup.ts`).
- Card count independent of players: met - `cardCount` returns zero only for no themes, and otherwise depends on fill/theme/variant state only (`src/app/domain/options.ts:29`).
- First open Kira alone: met - initial draft options pass `this.children.slice(0, 1)` into `defaultOptions` (`src/app/game/game-state.ts:92`).
- Restart rerolls first player in two-player: met - restart reuses the applied `players` array and calls `startGame`, which calls `assign` again (`src/app/game/game-state.ts:260`, `src/app/game/game-state.ts:361`).

### Design ID mapping

- DS-001: met - splash variants remain birthday/generic, with default build permanently birthday and dated build cutoff-driven.
- DS-020 / §5.5: met - player assignment is checkbox-driven in every build; date and cutoff no longer affect players; header order remains edition order.
- §3.10 / §4.3: met - Players fieldset is present before variants/fill/theme controls, and first focus moves to Kira on first-open popup.
- C7: met - permanent birthday flag and dated-birthday configuration are implemented.
- C8: met - Two players is replaced by Kira/Calvin checkboxes, with tests covering one, both, none, dates, and Restart reroll.

### Evidence

- Source review of `git diff acbf175..2287328`.
- `npm run build`: passed locally.
- `npm test -- --watch=false`: not run to completion locally because this shell reports Node `v24.13.0`; Angular CLI requires `v22.22.3`, `v24.15.0+`, or `v26.0.0`.
- `npm run build:dated-birthday`: not run to completion locally for the same Node version gate. The file-replacement configuration was reviewed directly.
- E2E coverage added in `e2e/players.spec.ts`; cutoff e2e now covers splash behavior by build flag. I did not run `npm run test:e2e` in this review pass.

### Recommended next action

Send to QA. QA should run the full required command set under Node `v26.0.0` or another Angular-compatible version, including both `npm run build` and `npm run build:dated-birthday`, and verify the default and dated splash behavior in browser.

## STEP-04 Technical Review

**Date:** 2026-10-11
**Reviewer:** Codex Tech Lead
**Status:** Approved by Moderator for QA handoff

### Verdict

Approve for QA handoff.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Development Team's STEP-04 work and approved the Tech Lead review decision to hand STEP-04 to QA.

### Findings

No blocking findings.

One product interpretation remains for the next gate to confirm: face identity is present in DOM test-hook attributes (`data-theme`, `data-variant`, `data-difference`) even while cards are face down. The visible back and accessible name do not expose face identity. This matches the implementation test-hook reading of design-spec section 3.9, but QA/Product Owner should decide whether AC1's "does not expose face identity from the back" also covers DOM attributes.

### Acceptance check mapping

- AC1: met with note - Go deals the STEP-03 deck and renders the dealt count with shared backs and neutral accessible names; DOM test hooks still carry face identity.
- AC2: met - layout e2e covers 4, 20 and 40 cards across phone/tablet portrait and landscape.
- AC3: met - rotation preserves order, IDs, card states, active player, attempts, timer and score.
- AC4: met - card buttons are keyboard reachable in order, gone cards leave tab order and rendered cards meet the target-size checks.
- AC5: met - first-card flip marks progress and keeps R25 behavior consistent.
- AC6: met - second-card selection counts one attempt, locks input and opens reveal after the flip delay.
- AC7: met - reveal shows the two large faces, moves focus in and traps Tab.
- AC8: met - matches announce/render "Match!", auto-dismiss, leave empty slots, count pairs and keep the same active player.
- AC9: met - mismatches remain until reveal-card tap or keyboard dismiss, scrim tap does nothing and two-player turn passes.
- AC10: met - input locks during reveal, match pause and Show All.
- AC11: met - Show All is between-turn only, peeks remaining cards, costs one attempt, keeps turn/timer and restores state.
- AC12: met - header attempts, pairs, active player and timer update from live state; two-player omits timer.
- AC13: met - completed games show single-player or two-player results with no birthday message; two-player tie-break uses pairs, then attempts.
- AC14: met - end-screen Restart and New Game flows preserve/replace state as specified.
- AC15: met - Restart asks only for an in-progress game.
- AC16: met - Go from options over an in-progress game asks and preserves draft/game on cancel.
- AC17: met - New Game never asks and preserves live/completed state under the popup.
- AC18: met - Restart re-rolls deck, differences and player assignment against the current clock.
- AC19: met - reduced motion shortens CSS motion and omits confetti while preserving play timings.
- AC20: met - post-Go/play axe checks include narrow scrolling table states.
- AC21: met - header content is inside a banner landmark and the widened axe helper reports no undocumented region finding.
- AC22: met - axe helper reports WCAG 2.2 and best-practice findings across all impacts with no exceptions.
- AC23: met - clock-pinned e2e covers both sides of the Denver cutoff and a session crossing midnight.
- AC24: met with evidence caveat - Dev Team reports all three required commands passing under a compatible Node; Tech Lead independently confirmed build and e2e, but local unit tests could not start under Node v24.13.0.
- AC25: met - no prototype, design-spec, QA, Product Owner sign-off or unrelated implementation files were edited before this review record.

### Evidence

- Dev Team reported `npm test -- --watch=false`: 218 tests passed across 16 files under a compatible Node.
- Dev Team reported `npm run build`: passed with no budget warnings.
- Dev Team reported `npm run test:e2e`: 50 passed.
- Tech Lead independently ran `npm run build`: passed.
- Tech Lead independently ran `npm run test:e2e`: 50 passed.
- Tech Lead attempted `npm test -- --watch=false`, but this shell has Node `v24.13.0`; Angular CLI requires `v22.22.3`, `v24.15.0+` or `v26.0.0`.

### Recommended next action

Send STEP-04 to QA. QA should verify the DOM/test-hook interpretation for AC1, re-run the full required command set under Node `v26.0.0` or another compatible version, and record any residual risk around the inferred e2e race hardening.

### Q1 Rework (QA defect, AC1)

**Fix commit:** `f2211c5` (`fix(game): hide face-down card faces from assistive tech (STEP-04 Q1)`), by the Development Team. It contains code and tests only (QA N1).

- **Change:** while a card is `down` or `gone`, `.front` is `visibility: hidden` and `aria-hidden="true"` (`board/board.html`, `board/board.scss`), so the child and activity names are left out of `innerText` and the accessibility tree. The hide is delayed by the 0.4 s flip, so the face still shows as the card turns down. The global reduced-motion rule sets that delay to 0. `up` and `peeked` cards, the accessible names, `app-pair-reveal` and the `data-theme`/`data-variant`/`data-difference` hooks are unchanged.
- **Tests:** unit `Board › hides a face-down face from assistive tech and shows it once the card is up (AC1)`. E2E `play loop › a face-down card shows only the shared back, to sight and to assistive tech (AC1)`, which uses retrying `innerText` and `ariaSnapshot` assertions on a newly dealt down card and on a card turned back down after a mismatch. Both tests failed against the pre-fix code. QA N4 is hardened: the `states()` read after Show All now uses `expect.poll`.
- **Evidence (Node `v26.0.0`, Dev Team):** `npm test -- --watch=false` 219 passed (16 files); `npm run build` passed with no budget warnings; `npm run test:e2e` 51 passed.
- **Left open:** `data-child`, `data-pattern`, `data-badge` and `--hue` remain on the `app-card-face` host of down cards. They are not text and are not in the accessibility tree. They are offered to the Product Owner with the N3 decision.

#### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Development Team's Q1 rework and sent it directly to a QA re-check of AC1. No separate Tech Lead re-review of the rework was run.

### N4/N6 Follow-up Review

**Commit reviewed:** `3046905` (`test(game): guard the face-hide delay and assert confetti in the full-motion test (STEP-04 N6, N4)`)
**Reviewer:** Codex Tech Lead
**Date:** 2026-10-11
**Status:** Approved for QA re-check with notes

#### Verdict

Approve with notes. The follow-up stays within `e2e/play.spec.ts` and closes N6 plus the open confetti-name half of N4. The earlier Q1 rework commit `f2211c5` still did not receive a Tech Lead review, as recorded by the Moderator in `0ceb295`; I did not re-review it here because `3046905` does not depend on a newly found defect in that code.

#### Findings

- **Medium, unrelated pre-existing unit failure:** `src/app/game/game/game.spec.ts` has a time-dependent AC13 expectation. The test calls `setup(BEFORE, 0.9, [ticking])`, but `ticking` overrides `Clock.now()` with the host's real `new Date()`. After `2026-10-11T00:00 America/Denver` (`2026-10-11T06:00:00Z`), player assignment is post-cutoff and roll `0.9` can produce Calvin, so the assertion expecting `Well done, Kira!` is no longer stable. `3046905` changes only `e2e/play.spec.ts`, so this is unrelated to the follow-up commit. Recommended owner: Dev Team, routed by the Moderator. Recommended fix: keep the test clock pinned before the cutoff while still advancing with fake timers, for example by basing `Clock.now()` on the fake-timer clock or a controlled advancing date rather than the real host date.
- **Low, residual style note:** the existing full-motion duration read remains a bare `evaluate`, while the new `.front` delay checks use `expect.poll`. That is acceptable here: the duration is read after `startGame`, while the delay checks can observe state changes around card flips and benefit from retrying. The helper follows the local `header` helper style.

#### Correctness and Scope

The computed values are the right Chromium values for the CSS under review: full motion reports `.front` `transitionDelay` as `0.4s` from `transition: visibility 0s linear 0.4s`; reduced motion reports `0s` because the global `prefers-reduced-motion` block forces `transition-delay: 0s !important`; and an up card reports `0s` because `.card[data-state='up'] .front` overrides the delay. Checking the up-card delay only in the full-motion test is meaningful because reduced motion already forces every delay to zero globally and would not prove the up/peeked override.

The full-motion test name is now justified: it asserts the 0.4 s flip duration, the `.front` hide delay, completion, and `end-confetti-root` attachment. The reduced-motion twin continues to assert no confetti. The diff is limited to N4/N6 test coverage and does not reopen N3 or the data-hook decision.

#### Mutation Evidence

- M3 mutation, `src/app/game/board/board.scss` `.front { transition: none; }`: targeted full-motion e2e failed as intended, `Expected: "0.4s"`, `Received: "0s"` at the down-card delay assertion.
- Reverse reduced-motion mutation, removing `transition-delay: 0s !important` from `src/styles.scss`: targeted reduced-motion e2e failed as intended, `Expected: "0s"`, `Received: "0.4s"`.
- Optional up/peeked mutation, removing `transition-delay: 0s` from `board.scss`: targeted full-motion e2e failed as intended, `Expected: "0s"`, `Received: "0.4s"` at the up-card assertion.
- Restored mutated files with `git checkout HEAD -- <file>`; `git diff -- src/app/game/board/board.scss src/styles.scss e2e/play.spec.ts` was clean afterwards.

#### Verification

Run under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`).

- `npm test -- --watch=false`: exit 1. Test Files 15 passed, 1 failed (16 total); Tests 218 passed, 1 failed (219 total). Failure: `src/app/game/game/game.spec.ts` "shows the single-player result without a birthday message (AC13)", expected `Well done, Kira!`, received `Well done, Calvin!`.
- `npm run build`: exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 49.83 kB, `greeting` 1.16 kB; no budget warnings.
- `npm run test:e2e`: exit 0. 51 passed (1.7 m).

#### Recommended next action

Send `3046905` to QA for the STEP-04 N4/N6 re-check. The unit failure should be routed to the Dev Team as a separate pre-existing time-dependent test fix; it does not block acceptance of this follow-up commit, but it should be fixed before relying on the full unit suite as green again.

### AC13 Unit Clock Fix (Tech Lead finding on `3046905`)

**Fix commit:** `33c746b` (`test(game): pin AC13 end-screen unit clock before cutoff`), by the Development Team. It contains test code only.

- **Cause:** in the `src/app/game/game/game.spec.ts` play-loop block, `vi.useFakeTimers()` fakes `Date` but starts it at the host's real time. The `ticking` Clock (`now: () => new Date()`) therefore read the real date, and after `2026-10-11T06:00:00Z` roll `0.9` assigned Calvin.
- **Change:** the block's `beforeEach` now also calls `vi.setSystemTime(BEFORE)` (`2026-10-10T18:00:00Z`), the same pattern as `game-play.spec.ts`. `ticking` starts before the cutoff and advances only with `vi.advanceTimersByTimeAsync`, so the AC13 game ends a few fake seconds after `BEFORE` whatever the real date. A one-line comment on `ticking` records this. The AC12 timer test, which also uses `ticking`, keeps its `0:05` / paused / `0:07` checks.
- **Unchanged:** product code, test assertions, the `data-*` hooks and `mod-w/qa.md`. N3, N5 and N7 are not reopened.
- **Evidence (Node `v26.0.0`, Dev Team, run on 2026-10-11 after the cutoff):** `npm test -- --watch=false` 219 passed (16 files); `npm run build` passed with no budget warnings; `npm run test:e2e` 51 passed.

#### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Development Team's AC13 unit clock fix and sent it to Tech Lead review.

### AC13 Unit Clock Fix Follow-up Review

**Commit reviewed:** `33c746b` (`test(game): pin AC13 end-screen unit clock before cutoff`)
**Reviewer:** Codex Tech Lead
**Date:** 2026-10-11
**Status:** Approved for QA re-check

#### Verdict

Approve. The fix is limited to `src/app/game/game/game.spec.ts` test setup and a clarifying comment. It makes no product change, no assertion change and no `data-*` hook change. The AC13 single-player end-screen unit now runs against a fake clock pinned before `2026-10-11T06:00:00Z`, so roll `0.9` remains Kira regardless of the host date. N3, N5 and N7 were not reopened.

#### Findings

- None.

#### Mutation Evidence

- Removed the `vi.setSystemTime(BEFORE)` line from the play-loop `beforeEach` and ran `npm test -- --watch=false` under Node `v26.0.0` on 2026-10-11 after the cutoff. The suite failed as intended: 218 passed, 1 failed; AC13 expected `Well done, Kira!` and received `Well done, Calvin!`.
- Restored `src/app/game/game/game.spec.ts` with `git checkout HEAD -- src/app/game/game/game.spec.ts`; `git diff -- src/app/game/game/game.spec.ts` was clean afterwards.

#### Verification

Run under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`).

- Commit scope: `git show --stat --name-only 33c746b` lists only `src/app/game/game/game.spec.ts`; the patch adds only `vi.setSystemTime(BEFORE)` after `vi.useFakeTimers()` plus a one-line `ticking` comment.
- AC12 timer coverage still uses `ticking` and verifies `0:05`, paused at `0:05` while the popup is open, then `0:07` after close.
- Date-dependency scan found no remaining same-shape host-date dependency: the other `Clock.now(): new Date()` spec helper in `game-play.spec.ts` is paired with `vi.setSystemTime`, and the remaining spec dates are explicit fixed dates.
- `npm test -- --watch=false`: exit 0. Test Files 16 passed; Tests 219 passed.
- `npm run build`: exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 49.83 kB, `greeting` 1.16 kB; no budget warnings.
- `npm run test:e2e`: exit 0. 51 passed.

#### Recommended next action

Send `33c746b` to QA for the STEP-04 AC13 unit clock fix re-check.

#### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Tech Lead review of the AC13 unit clock fix and sent it to QA re-check.

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
