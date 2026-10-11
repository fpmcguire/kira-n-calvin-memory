# Product Owner Sign-off

## Product Owner Sign-off — STEP-05

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-05 — Persistence and Sound Feedback
**Date:** 2026-10-11
**Mode:** Product Owner, Mode 2 (Acceptance Validation)
**Commit under review:** `b1ce86c` (`feat(game): implement step 05 persistence and sound feedback`). Tech Lead review `628c6a3`, QA `1fce1ac`. Code under test is unchanged since `b1ce86c`.
**Evidence reviewed:** `step-05.md` (AC1-AC19, approval record), `product.md` (R4, R6, R7, R21, R31, R36, R38), `design-spec.md` (DS-006, DS-016, DS-020, DS-021, DS-024, §3.5, §3.6, §3.14, §5.9, §5.10), `domain-language.md`, `review.md` (STEP-05 Tech Lead review), `qa.md` (QA - STEP-05 and its Moderator approval), and the STEP-04 sign-off for format. Spot checks in the working tree: the DS-016 best-note strings in `end-screen.ts`, the Sound toggle markup in `game-header.html`, no e2e test still asserting the retired Kira-first rule, and the `b1ce86c` file list (no prototype or `mod-w` files changed). I did not re-run the test, build or e2e commands or the app. Results rely on the QA and Tech Lead evidence above.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Pending. The Moderator records the final gate and STEP-05 completion separately.

### Verdict

**Accepted with notes**

- All 19 acceptance checks are met on the QA and Tech Lead evidence, and the spot checks above agree with it.
- Two QA notes need a product decision. N1 (test-ID naming) is accepted as-is, with a spec-only fix recommended. N2 (one bad field discards all saved options) is accepted for STEP-05, with a follow-up recorded below.
- Audio is unverified by ear and on iOS Safari, and storage is unverified on Safari and Firefox. These are carried to STEP-06 and do not block this gate.

### Acceptance check review

- AC1: met — first open with nothing saved gives Kira alone, all ten themes, variants and fill off, Go enabled. Covered by unit, e2e and QA probe P1.
- AC2: met — Go is the only save point. The real `localStorage` contents (QA probe P2) hold exactly `players`, `variants`, `fill`, `fillCount` and `themes`. A reload restores the checkboxes, the summary and the preview.
- AC3: met — malformed JSON, unknown players or themes, empty sets, the retired `twoPlayers` shape and `fillCount: 42` all fall back to defaults with no page or console errors (QA probe P1, plus 15 rejection and 7 fallback unit cases). The whole-set fallback is N2.
- AC4: met — Reset clears both checkboxes and writes nothing. After a reload the remembered options return. Matches the R36 intent that Reset is not destructive.
- AC5: met — Close, Escape and a cancelled "Start over?" leave stored options byte-identical after a dirty draft (probe P2). Only a confirmed Go saves.
- AC6: met — the storage, validation and best-score code does not import the cutoff or feature flags. Both builds compile. Cutoff e2e stays splash-only. Players are unchanged on either side of the cutoff.
- AC7: met — the stored JSON has no first-player field. `startGame` re-rolls the first player on every Go and Restart. Saved two-player options restore both checkboxes only.
- AC8: met — a single-player win stores a best under player plus board key (probe P3: `{"kira:4-plain":{"attempts":2,…}}`).
- AC9: met — only strictly fewer attempts replaces a best. The worse and equal cases keep the old best. The note text matches DS-016 exactly: "New best for {Player} on this board!" and "{Player}'s best on this board: N attempts" (`end-screen.ts:113-114`).
- AC10: met — Kira and Calvin keep separate bests on the same board (unit and e2e).
- AC11: met — card count plus variants on/off gives separate boards (unit and e2e). Themes with the same card count share a board, as C6 specifies.
- AC12: met — two-player results write no best and show no best note. The stored table is unchanged after a two-player game on the same board (probe P3).
- AC13: met — the header Sound button shows visible text "Sound on" / "Sound off", with `aria-pressed` and `data-state`. It is at least 44 px. The state survives a reload and a route visit. Test-ID naming differs from the spec; see N1.
- AC14: met — the unit sequence is flip, flip, match, flip, flip, match, win, with nothing for Show All and nothing while muted. Real Web Audio counts (probe P6) show 0 cues with Sound off and 0 for Show All. Tones have not been listened to; see residual risks.
- AC15: met — with Web Audio removed (probe P5) or storage throwing (probe P4), the game still finishes and shows the best note from the in-memory copy. No errors.
- AC16: met — the STEP-04 unit and e2e suites pass unchanged, including Restart reroll, the Go and Restart confirms, and no birthday copy in gameplay or on the end screen.
- AC17: met — axe runs on restored first-open options, Sound on, Sound off, the single-player end screen with the best note, and the two-player winner screen without one. All report 0 findings. The tie screen was not axe-tested (N5); the AC wording is met by the winner screen.
- AC18: met on QA evidence — under Node v26.0.0: unit 303 passed / 1 skipped, both builds pass, e2e 62 passed / 1 skipped. Both skips are flag-dependent and expected. I did not re-run these.
- AC19: met — `git show --stat b1ce86c` lists 22 files, all under `src/`, `e2e/`, `angular.json`, or the two `tsconfig` files. `git diff 057835e b1ce86c -- prototype mod-w` is empty. The Tech Lead and QA records were committed separately.

### Product intent checks

- **R36, remembered options:** restored on first open, Reset is draft-only, and dirty drafts are not saved. This is the behavior a returning family expects. Met.
- **R36, best scores:** single-player only, per child, per board key (card count plus variants). Two-player writes nothing. Met.
- **R21, end screen:** two-player results show the winner or tie with no best note and no birthday text. Met.
- **R31, Sound:** the toggle is in the header, its state is shown as text plus `aria-pressed`, and the preference is remembered. Sound is never the only channel: the flip is visible, "Match!" shows in the reveal, and the win shows on the end screen with confetti. Met.
- **R4 and R38, players and birthday flag:** no e2e test still asserts the retired Kira-first rule. Player behavior is covered by `players.spec.ts`. The cutoff affects only the splash. Met.
- **Scope:** no new features were added beyond `step-05.md`.

### Notes

**Decisions on QA notes**

- **N1 — Sound test ID (accept as-is for STEP-05):** the build uses `header-action-button-sound` plus `data-state="on|off"`. The spec's §3.6 says `header-action-button-sound-{on|off}`, but its own §3.5 lists `header-action-button-{show-all|sound|restart|new-game}`. The spec is internally inconsistent, and the build matches §3.5. It was already the case before STEP-05, so no code change is needed. Recommended follow-up: the Designer corrects §3.6 to match the build in a docs-only commit. The Product Owner does not edit `design-spec.md`.
- **N2 — one bad field discards all saved options (accept for STEP-05, record a follow-up):** this is the literal reading of AC3, and the cost is small. A family re-picks their options once. It can only happen when edition content changes, and the gift edition's content is fixed for this release. Follow-up for future edition work, including the public edition: when a theme or child ID is removed, keep the valid fields and drop only the unknown values. Tech Lead to schedule. Product Owner confirms the rule when that work starts.

**Carry-forwards to STEP-06**

- **Listen to the placeholder tones on a phone and a tablet at normal volume.** Nobody has listened to them yet, including me. Check that the flip tone is audible and not harsh (peak gain 0.15). Final sounds replace them in STEP-06 under DS-021.
- **iOS Safari audio unlock on a real device (priority).** If cues stay silent on iPad, gameplay still works (AC15), but the sound feature does nothing for the family. Put it at the top of the real-device matrix.
- **Safari and Firefox storage, including private mode.** Only the in-memory fallback is proven, and only in Chromium.
- **Accessibility pass additions from QA:** axe on the two-player tie screen (N5); an optional committed e2e for the cancelled "Start over?" and storage-failure paths (N4). Both can ride with the STEP-06 accessibility pass.
- **Already in STEP-06 from STEP-04:** real screen-reader smoke test, slider target size (D3), and real-device 40-card layout.
- **Storage key `knc-memory.v1.options` is versioned.** Any future schema change needs a new key or a migration. Tech Lead to keep this in mind.

**Open questions for the Moderator**

1. Accept N1 as-is with a Designer docs fix, and N2 as a recorded follow-up. Where should N2 go: `roadmap.md` under STEP-06, or a later backlog item? I did not edit `roadmap.md`.
2. Accept "Accepted with notes" even though nobody has listened to the tones yet? I think yes, since DS-021 accepts placeholder tones and the listening check is in STEP-06.
3. Final gate and STEP-05 completion are yours to record.

---

## Moderator Approval — Post-STEP-04 Change Requests, 2026-10-11

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the two Product Owner decision records below and their implementation in `998197d`:
  1. Permanent birthday splash behind the build-time flag `permanentBirthday` (R38). This resolves STEP-04 N7.
  2. Kira and Calvin player checkboxes replacing the Two players option (R4, R6, R7).
- **STEP-04:** remains approved and signed off as completed (`aa3a26f`, `acbf175`). The changes above are post-STEP-04 change requests made before STEP-05 planning. They do not reopen STEP-04.
- **Workflow deviation (Moderator instruction):** the Moderator instructed the Product Owner to implement both changes directly. This bypasses the normal Dev Team -> Tech Lead -> QA flow and the Product Owner's no-code boundary. The Moderator also authorized the Product Owner to edit documents owned by other roles: `design-spec.md`, `architecture.md`, `domain-language.md`, `roadmap.md` and `qa.md`. This is recorded as a deliberate deviation for expedience, not an oversight.
- **Gate completion update:** the Tech Lead reviewed `998197d` and the accompanying document changes and recorded a Pass verdict in `review.md`. The Moderator approved that Tech Lead review.
- **QA and Product Owner gates:** because the Product Owner implemented these changes directly under Moderator instruction, the Moderator approves passing the QA and Product Owner gates for this situation only. This exception applies only to the two post-STEP-04 change requests above and does not change the normal MOD-W gate sequence for future work.
- **Final Moderator decision:** approved re-tagging STEP-04 completed after the approval-record commit.

## Product Owner Decision Record — N7 (permanent birthday screens), 2026-10-11

- **Source:** stakeholder decision, relayed by the Moderator (fpmcguire): the Happy Birthday screens and messages are permanent, not limited to 2026-10-10. The Moderator asked for a build-time feature flag and for the change to be recorded in all relevant documents.
- **Decision:** add R38. The default build shows the birthday splash on every visit. The `dated-birthday` build restores the cutoff rule for the splash. Player rules (R4) are unchanged in every build. No birthday messages are added inside gameplay or to the end screen (Non-goal 5, R21 unchanged).
- **Why this meets the N7 condition:** it sits behind an explicit build-time flag, and the flag separates splash behavior from player assignment, as N7 required.
- **Open for the Product Owner with stakeholders:** whether Kira stays the single and first player after the cutoff, and whether birthday messages should appear beyond the splash. Both are listed in `product.md` Open Questions.
- **Status:** approved by the Moderator on 2026-10-11 (see Moderator Approval above). Implemented in `998197d`. STEP-05 Restart and R36 planning must follow the change. Historical sign-off, review and step records below are unchanged.

## Product Owner Decision Record — Player checkboxes, 2026-10-11

- **Source:** stakeholder decision, relayed by the Moderator (fpmcguire): replace the Two players option with Kira and Calvin checkboxes that decide single-player or two-player and who plays alone; in two-player the first player is random.
- **Moderator direction:** agreed all eight Product Owner recommendations, and directed the Product Owner to implement the change directly. The Moderator acknowledges that the Tech Lead and Dev Team were bypassed this round; the Tech Lead is to review the change as a Dev Team implementation.
- **Decision:**
  1. Neither child checked disables Go (R7).
  2. First open checks Kira alone, unless saved options exist (R36).
  3. The cutoff no longer affects players. Both checked is random first even before the cutoff.
  4. The checkboxes apply in every build. The `dated-birthday` build changes the splash only.
  5. Two-player re-rolls the first player on every Go and Restart.
  6. The player checkboxes do not filter themes.
  7. Changing players over a game in progress goes through the existing "Start over?" rule (R25).
  8. The header shows only the chosen child in single-player. Best scores stay per player.
- **Documents changed:** `product.md` (R3, R4, R6, R7, R38 wording, scenarios 2, 8 and 9, acceptance checks, risks, assumptions, open questions, change log), `design-spec.md` (§3.10, §4.3, §5.5, DS-020, glossary, §10, C8), `domain-language.md`, `architecture.md`, `roadmap.md`, `qa.md`, `README.md`.
- **Status:** approved by the Moderator on 2026-10-11 (see Moderator Approval above). Implemented in `998197d`. Tech Lead review and QA verification are still outstanding.

## Product Owner Sign-off — STEP-04

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-04 — Play Loop, Board, Reveal and End Flow
**Date:** 2026-10-11
**Mode:** Product Owner, Mode 2 (Acceptance Validation)
**Commit under review:** `c8cadd5` record state, covering implementation `b733a84`, AC1 fix `f2211c5`, AC13 unit clock fix `33c746b`, and N4/N6 follow-up `3046905`.
**Evidence reviewed:** `step-04.md`, `qa.md` (STEP-04 main record, Q1 re-check, AC13 unit clock re-check, N4/N6 re-check, and Moderator approvals), `review.md` (STEP-04 Tech Lead review records), `product.md`, `design-spec.md`, and spot checks of `board.html`, `card-face.ts`, cutoff/splash references and git history. I did not run the app, tests, build or axe locally; results below rely on QA and Tech Lead evidence plus the stated spot checks.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Product Owner's STEP-04 review and verdict "Accepted with notes"; signed off STEP-04 as completed. The N3 and N7 Product Owner decisions stand for STEP-05 planning. N1 and N5 remain recorded Moderator process decisions and require no STEP-04 rework.

### Verdict

**Accepted with notes**

- AC1-AC25 are accepted as met on the combined QA, Tech Lead and spot-check evidence.
- AC1 is accepted with the N3 product decision below: DOM-only test hooks and hidden face text nodes on face-down cards are acceptable because they are not rendered, not in the accessible name, and not present in the accessibility tree.
- AC25 is accepted with Moderator process notes: N1 was accepted for STEP-04, and N5 was recorded as a deliberate Moderator bypass of Tech Lead re-review for `f2211c5`.
- N7 is recorded as a STEP-05 planning decision, not a STEP-04 defect.

### Acceptance check review

- AC1: met, with N3 note — Go deals from the STEP-03 deck and renders the dealt card count with the shared K-n-C back. Q1 initially found face text in `innerText` and the accessibility tree; `f2211c5` fixed that, and QA re-checked down, turned-down, gone, up and peeked cards. Remaining DOM-only hooks and hidden text nodes are accepted under N3.
- AC2: met — QA and `layout.spec.ts` cover 4, 20 and 40 cards across phone/tablet portrait and landscape, with 3:4 cards, minimum sizes, left-aligned incomplete rows inside the centered grid, and scroll only as fallback.
- AC3: met — QA confirms resize/rotation preserves order, IDs, face states, active player, attempts, timer and score.
- AC4: met — card buttons are native buttons, reachable in grid order, skipped when gone, at least 44 px, and selectable by pointer, Enter and Space.
- AC5: met — first-card selection flips only that card, marks the game touched/in progress, and drives the R25 confirm behavior.
- AC6: met — second-card selection increments the active player's attempts exactly once, locks input and opens reveal after the flip delay.
- AC7: met — every two-card turn opens the pair reveal with two large faces, focus on the first reveal card and trapped Tab; the cream focus ring aligns with the approved design evidence.
- AC8: met — match flow shows "Match!", auto-dismisses, leaves invisible empty slots without moving cards, increments pairs and keeps the same active player.
- AC9: met — mismatch flow shows "Not a match" and "Tap a card to continue"; scrim tap does nothing; reveal-card tap, Enter and Space dismiss once, turn cards down and pass the turn in two-player.
- AC10: met — shared lock state gates cards, Show All, Restart and New Game during reveal, match pause and Show All.
- AC11: met — Show All is between-turn only, peeks remaining cards for about three seconds, costs one attempt, keeps the turn and timer running, and restores prior state.
- AC12: met — header attempts, pairs, active-player highlight and single-player timer update from live state; two-player hides the timer.
- AC13: met — completion opens the end screen with no birthday message, single-player attempts/time, and two-player winner/tie logic by pairs then fewest turns. The host-date-sensitive unit was fixed in `33c746b` and re-checked.
- AC14: met — end-screen Restart and New Game work as specified; New Game opens options over the completed game and Close/Escape returns to the result.
- AC15: met — Restart asks "Start over?" only for an in-progress game; untouched and completed games restart without confirmation.
- AC16: met — Go from options over an in-progress game asks "Start over?", confirming applies draft options, and cancelling preserves both draft and live game.
- AC17: met — New Game never asks, opens with current settings, preserves the board, scores, turn, face-up card, timer and focus-return behavior, and pauses/resumes the timer under the popup.
- AC18: met — Restart re-rolls deck, differences and players against the clock; before cutoff Kira remains first, after cutoff random players are reachable, including a session crossing midnight Denver time.
- AC19: met — reduced motion shortens CSS motion and omits confetti while preserving state changes and play timing. N6's hide-delay guard was added and QA-verified.
- AC20: met — post-Go/play, narrow 40-card scrolling table and end-screen axe checks pass with 0 findings.
- AC21: met — game header content is in a banner landmark and the widened axe helper reports no undocumented region/landmark findings.
- AC22: met — axe helper covers WCAG 2.2 and best-practice tags across all impacts, with no exceptions.
- AC23: met — clock-pinned e2e covers both sides of `2026-10-11T00:00 America/Denver` and no longer depends on the host date.
- AC24: met — QA and later re-checks report `npm test -- --watch=false`, `npm run build`, and `npm run test:e2e` passing under Node `v26.0.0`; the final reported suite is 219 unit tests and 51 e2e tests.
- AC25: met with process notes — no prototype, `design-spec.md`, `qa.md`, `sign-off.md` or unrelated implementation files were edited by the implementation/fix commits under review. N1 (`review.md`/`roadmap.md` in the original implementation commit) was accepted by the Moderator for STEP-04; N5 records the Moderator's deliberate bypass of Tech Lead re-review for `f2211c5`.

### Product decisions

- **N3 — DOM hooks and hidden face text on face-down cards:** Accepted under AC1. The product intent is that a player must not learn the face from the back through sight, accessible name or assistive technology. After Q1, QA verifies that down/gone cards expose only the shared back visually and only neutral labels in the accessibility tree. DOM attributes (`data-theme`, `data-variant`, `data-difference`, `data-child`, `data-pattern`, `data-badge`, `data-mirrored`, `--hue`) and hidden text nodes are test/presentation internals available through dev tools or scraping, not through the game UI. They are acceptable for STEP-04, and no rework is requested.
- **N7 — Happy Birthday screens/date condition for STEP-05 planning:** Do not silently make the birthday experience permanent in STEP-05. Keep the current date-gated R2-R4 behavior as the default unless the Moderator approves a product change. If stakeholders want persistent birthday screens, put that behind an explicit content/config feature flag that separates splash/greeting behavior from player assignment; do not add birthday messages inside gameplay or the end screen without changing product.md Non-Goal 5 and R21. STEP-05 planning for Restart and R36 persistence should account for whichever explicit mode is approved, but `product.md` must not be changed without Moderator approval.

### Notes

- **N1:** Moderator item already decided: accepted for STEP-04, with Tech Lead review records to be separate commits from STEP-05 onward. I do not reopen it.
- **N5:** Moderator item already recorded: the `f2211c5` Q1 rework bypassed Tech Lead re-review by deliberate Moderator decision. I do not decide or reopen it.
- **Closed follow-ups:** Q1 is closed by `f2211c5`; AC13 unit clock stability is closed by `33c746b`; N4/N6 are closed by `3046905` and QA re-check.
- **Residual scope:** real screen-reader smoke test, real-device matrix, final card art, final sounds and persistence remain outside STEP-04 and belong to later approved steps.
- **Verification limit:** I did not independently run the app, tests, build or axe. This sign-off relies on the recorded QA/Tech Lead evidence and limited source/history spot checks.

---

## Product Owner Sign-off — STEP-03

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-03 — Domain Engine and Deck Rules
**Date:** 2026-10-10
**Mode:** Product Owner, Mode 2 (Acceptance Validation)
**Commit under review:** `4040f85` (`feat(domain): add step 03 deck, player and matching engine`), QA record `71b0063`.
**Evidence reviewed:** `step-03.md`, `qa.md` (STEP-03 section, Moderator approval, N1-N7), `review.md` (STEP-03 Technical Review), `product.md` (R3, R4, R9-R12, R28, R35), `design-spec.md` (DS-009, DS-020), `AGENTS.md`. I did not run the app, the tests or the build. Results below rely entirely on the `qa.md` and `review.md` evidence.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the Product Owner's STEP-03 review and verdict "Accepted with notes". The N4, N6 and N3 answers stand as the product decision; no rework required.

### Verdict

**Accepted with notes**

- All 16 acceptance checks are met as written, on the strength of the QA and Tech Lead evidence.
- Three checks are "met with notes" because the written check is satisfied but a product-level question is still open: AC9 (N6, R11 balancing unit), AC14 (one unreproduced flaky manual-check step), and AC16 (N1, already resolved by the Moderator in `qa.md`).
- N4 and N6 are answered below; neither requires rework.

### Acceptance check review

- AC1: met — `review.md` and `qa.md` both confirm `src/app/domain/types.ts` defines `ChildId`, `ThemeId`, `VariantId`, `DifferenceType`, `FaceId`, `PairIdentity`, `DeckCard`, `GameOptions`, `PlayerMode`, `PlayerAssignment` and `Cutoff`, and that a scan of `domain/`, `content/` and `game-state.ts` found no `any`.
- AC2: met — Kira/Calvin children, the ten themes, cutoff data and the four difference types live in `src/app/content/kira-calvin.ts` behind the typed `EditionContent` interface; QA confirms `domain/` has no content import.
- AC3: met — `cutoff.spec.ts` is reported pinning `now` at one millisecond before, exactly at and one millisecond after `2026-10-11T00:00 America/Denver` (05:59:59.999Z / 06:00:00.000Z / 06:00:00.001Z), plus a same-day cross-zone case and a second time zone to prove the logic is data-driven rather than instant-hard-coded.
- AC4: met — `players.spec.ts` and `cutoff.spec.ts` are reported to force Kira before cutoff regardless of the random roll, and to reach both Kira and Calvin after cutoff with injected rolls, in both single- and two-player mode, with header order fixed at Kira, Calvin.
- AC5: met — `deck.spec.ts` "fill off" cases give one pair and two cards per selected theme with variants off.
- AC6: met — the same fill-off cases give two variant pairs and four cards per selected theme with variants on, including a ten-theme, 40-card case.
- AC7: met — the `FILL_COUNTS` matrix (4 through 40) asserts the exact requested count for every case.
- AC8: met — targeted R10 tests are reported to show only checked themes are used, whole pairs only, both variant pairs per theme when variants are on, and no orphans when supply equals demand.
- AC9: met, with a note — targeted R11 tests show round-robin repetition and a leftover spread that never differs by more than one copy between pair identities, including the one-theme 40-card extreme for both variants off and on. The unit this is measured in is pair identity, which is a product clarification rather than a test gap; see N6 below for the explicit answer.
- AC10: met — one selected theme, variants off, fill 40 is explicitly tested (single face repeated 20 times), and the variants-on counterpart (even split across both pairs) is also tested.
- AC11: met — the reported matrix covers all 1023 non-empty theme subsets × variants on/off × fill off/4-40 × three random sources, each asserted for even count, whole pairs, legal theme/variant IDs, unique card IDs and no orphan faces.
- AC12: met — `match.spec.ts` is reported to cover same theme/variant matches, same-theme/different-variant non-matches, different-theme non-matches, a card never matching itself, and repeated-pair copies from different positions matching.
- AC13: met — `difference.spec.ts` is reported to assign one type per selected theme from the allowed set, to re-roll when the random source changes, and to always attach `secondaryCue: 'dot-pattern'` for `color`, which matches DS-009's "always on" requirement.
- AC14: met, with a note — unit coverage (`game-state.spec.ts`) and a scripted browser session are reported to reproduce STEP-02's counts, summary text, stepper range and header/player behavior after the domain rewire. QA notes one of the 13 manual browser-check steps misread a stepper value on the first run and passed cleanly on a second run, attributing it to script read timing rather than a product defect; this is plausible but was not independently reproduced by QA or by me, so I record it as a residual, non-blocking risk rather than a closed item.
- AC15: met — `npm test -- --watch=false` (119/119), `npm run build` and `npm run test:e2e` (5/5) are reported to pass under Node `v26.0.0`, consistent between `qa.md` and `review.md`.
- AC16: met, with a note already resolved — the changed-file set in `4040f85` is within `src/app/domain/**`, `src/app/content/**` and `src/app/game/game-state*`. QA's N1 flags that the same commit also edits `mod-w/review.md`, which AC16 names as a file not to be edited; the Moderator has already accepted this edit as the Tech Lead's own review record (see `qa.md` Moderator Approval). I do not reopen N1.

### Alignment with product.md

| R-ID | Result               | Notes                                                                                                                                                                     |
| ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R3   | Aligned              | Cutoff is data (date, zone, player) and is proven data-driven by the second-time-zone test, not just the Denver boundary.                                                 |
| R4   | Aligned, with a note | Pre-cutoff forced Kira and post-cutoff randomization are both proven, including on Restart/Go re-rolls. See N4 for the pre-Go header question.                            |
| R9   | Aligned              | One pair per theme with variants off, two with variants on, matching the exact card-count formula in R9.                                                                  |
| R10  | Aligned              | Supply-greater-than-needed tests match R10's "pick checked themes at random … include a theme's variant pair … until the grid is full" wording directly.                  |
| R11  | Aligned              | See N6: R11's own text says "no pair appears more than one extra time", so balancing by pair identity is the literal reading of the requirement, not a deviation from it. |
| R12  | Aligned              | Face-identity matching and repeated-pair equivalence are both tested; grid position and card instance ID are confirmed not to participate in equality.                    |
| R28  | Aligned              | Difference type is chosen per theme per game and is reported to be re-rollable through the injected random source.                                                        |
| R35  | Aligned, with a note | Children, themes and cutoff data are content, not engine code. See N3 for the `ChildId` union question.                                                                   |

### Answers to open product questions

- **N4 — random header before the first Go after cutoff:** Acceptable under DS-020. DS-020 only constrains the roll that happens "on each Go and Restart"; it does not require withholding a player name before the first Go, and the pre-Go value is discarded and re-rolled at Go regardless, so it cannot bias or leak the real outcome. No rework needed. If this is visually confusing to a tester or a parent during a demo, a later Step may choose to blank the header pre-Go as a polish item, but that is a UI nicety, not an acceptance gap.
- **N6 — R11 leftover balancing by pair identity vs. theme:** By pair identity is correct and is what I want. R11's own text ("no pair appears more than one extra time compared with the others") refers to pairs, not themes, and R12 defines matching at face/pair-identity granularity. Balancing by theme would let one theme's pair absorb all the leftovers while another theme's pair in the same board gets none, which satisfies no written requirement and would actually be harder to justify against R11's literal wording. No change requested.
- **N3 — hard-coded `ChildId` union for the gift edition:** Acceptable for this gift edition. R35 requires personal content (likenesses and activities) to be kept out of the engine; it does not require the engine to be name-agnostic. `ChildId = 'kira' | 'calvin'` is a closed, two-value structural type, not likeness or activity data, and the actual names/themes/cutoff data already live in `content/`. If a future public (non-gift) edition needs arbitrary children, `ChildId` would need to become a content-driven type at that time — note this as a known adaptation cost for that future Step, not a defect now.

### Notes

- **Carried in from `qa.md`, now closed by this review:** N1 (AC16/`review.md` edit) was already decided by the Moderator in `qa.md`; N4, N6 and N3 are answered above; N5 (odd-pair-count edge case) is confirmed not reachable from the UI, since fill counts are always multiples of 4, and is already covered by a dedicated unit test — no action needed; N7 is a carry-forward from STEP-02 about the cutoff being evaluated once per route entry, which remains open for STEP-04 as previously recorded and is not re-litigated here.
- **Residual, non-blocking:** the single unreproduced flaky step in QA's manual browser check (stepper read timing) is worth a second look if it recurs in STEP-04's expanded browser coverage, but it does not block STEP-03 acceptance given the unit-level coverage of the same stepper logic.
- **Verification limit:** this sign-off relies entirely on the evidence recorded in `qa.md` and `review.md`. I did not independently run the app, the unit tests, the build or the e2e suite.

---

## Product Owner Sign-off — STEP-02

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-02 — Game Shell, Splash and Options Draft
**Date:** 2026-10-10
**Mode:** Product Owner, Mode 2 (Acceptance Validation)
**Evidence reviewed:** `step-02.md`, `qa.md`, `review.md`, `product.md`, `roadmap.md`, `AGENTS.md`, and a spot check of `src/app/content/kira-calvin.ts` and `preview-board.html`. I did not re-run the app or the tests. Results below rely on `qa.md` and `review.md` unless stated.
**Moderator approval:** Approved by fpmcguire on 2026-10-10. The Moderator approved "Accepted with notes" and decided to defer D1, D2, D3 and D4 (see Moderator decision).

### Verdict

**Accepted with notes**

- All 16 acceptance checks are met as written.
- D1 is a real WCAG failure in a state AC14 does not cover. I recommend fixing it in STEP-02 (see Defect dispositions). If the Moderator defers it, the deferral must be recorded.
- Some product intent in R37 and the accessibility constraint cannot be verified in this Step. These are listed in the notes.

### Moderator decision

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the Product Owner verdict "Accepted with notes". Deferred D1, D2, D3 and D4 instead of fixing them in STEP-02. This overrides the Product Owner recommendation to fix D1, D2 and D4 now.
- **Deferral owners:**
  - D1 (post-Go `scrollable-region-focusable`): STEP-04, when cards become focusable. "Post-Go axe clean" is an explicit STEP-04 acceptance check.
  - D2 (header landmark): STEP-04, with D1, since it is the same post-Go state.
  - D3 (16 px fill slider): STEP-06 accessibility pass.
  - D4 (axe helper ignores moderate and minor findings): STEP-04, widened together with the D1 check.
- **Carry forward:** the clock-pinned e2e (qa.md residual risk) is not covered by the decision above. It stays open for the Tech Lead to place in STEP-03 or STEP-04.

### Acceptance check review

- AC1: met — `/game` is a lazy chunk (`game` 21.03 kB). Greeting is a separate chunk and links to `/game`. `GameState` is scoped to `Game`.
- AC2: met — QA tested both sides of the cutoff with a pinned browser clock (23:59 MDT shows birthday, 00:00 MDT shows generic). It also tested 03:00Z on Oct 11, which is still Oct 10 in Denver, and it shows birthday. Unit tests cover the boundary. No date text appears. I also confirmed the cutoff is data in `kira-calvin.ts` (`2026-10-11T00:00`, `America/Denver`, `kira`).
- AC3: met — the popup appeared about 3.5 s after the splash, which is the 3000 ms timer plus Playwright overhead. Click, Enter and Space skip it. Escape does nothing, as specified.
- AC4: met — the options popup replaces the splash, the preview board stays visible, and the shell behind is `inert`.
- AC5: met — first open has 10/10 themes checked, and two players, variants and fill off. There is no Close button and Escape is ignored. This matches the R37 intent that Close applies only when opened from a game.
- AC6: met — Reset clears all options, disables Go, shows "Pick at least one theme" and sets the preview to 0. On reopen, Reset changes only the draft.
- AC7: met — Go is disabled with no themes, including when Fill is on. With one theme Go is enabled and shows "2 cards · 1 pair". Go applies the draft, closes the popup and returns focus to New Game.
- AC8: met — the summary and preview follow variants, theme count and fill (40/20, 6/3, round up to 8, and 4 with no themes). This is preview math only; the R9-R11 deck rules are out of scope.
- AC9: met — the stepper visits 4 to 40 in steps of 4, with the limits disabled. The slider has `min=4 max=40 step=4`. Rounding and clamping are unit tested.
- AC10: met — the header shows the K-n-C mark, Kira/Calvin blocks with Attempts 0 / Pairs 0, and a 0:00 timer in single player only. Show All and Restart are disabled. Sound toggles with `aria-pressed`. New Game is enabled only when no popup is open.
- AC11: met — before the cutoff, 8/8 single-player Gos were Kira and 8/8 two-player Gos had Kira first. After the cutoff, both players and both first players occurred over 20 Gos. The header order was always Kira, Calvin. Deterministic unit tests use a `Random` stub.
- AC12: met — New Game reopens with the applied settings and shows Close. Escape and Close both discard a dirty draft and restore focus to New Game.
- AC13: met — focus moves to the splash button, and to Two players on first open or Close on reopen. Tab was tested 25 times and stayed inside the popup, wrapping both ways. Focus is restored on close.
- AC14: met, with notes — the three states AC14 lists pass axe in e2e, and QA also ran axe on more states with 0 violations. Focus rings are visible. Header buttons, checkboxes, the stepper, Close, Reset and Go are at least 44 px. The range slider is 16 px (D3). The post-Go shell fails axe (D1, D2). AC14 does not list that state, but the AGENTS.md rule is "MUST pass all AXE checks". The check passes as written, but the intent is only partly met until D1 is resolved.
- AC15: met — `npm test` (32 passed), `npm run build`, `npm run build:subfolder` and `npm run test:e2e` (5 passed) all passed under Node v26.0.0. `review.md` records the same results independently.
- AC16: met — the QA diff of the prototype, design-spec and qa/sign-off files is empty. The edits to `AGENTS.md` and `CLAUDE.md` (I1) are outside the Step's expected file list. They are guidance only, so I treat them as acceptable. I confirmed nothing existed at `mod-w/sign-off.md` before this file.

### Alignment with product.md

| R-ID | Result                           | Notes                                                                                                                                                                                                                             |
| ---- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2   | Aligned                          | The splash lasts about 3 s and a tap or key skips it. The birthday variant is "Happy Birthday Kira!" and the generic variant shows the K-n-C mark and the "Kira-n-Calvin Memory Game" title.                                      |
| R3   | Aligned                          | The cutoff is data (date, time zone, player). The evaluation uses `America/Denver`, tested on both sides and with a UTC offset trap.                                                                                              |
| R4   | Aligned                          | Kira-only before the cutoff. Random single player and first player after it, chosen on Go. Restart re-roll belongs to a later Step.                                                                                               |
| R5   | Aligned                          | The board preview shows behind the popup after the splash.                                                                                                                                                                        |
| R6   | Aligned                          | All controls are present and the first-open defaults match product.md. Theme names and the two-column layout were not re-verified by me beyond QA's "10 themes" check.                                                            |
| R7   | Aligned                          | Go is disabled with no themes. Reset clears all options.                                                                                                                                                                          |
| R8   | Aligned                          | The exact 4-40 count in steps of 4. The starting value rounds up to a multiple of 4, which matches the assumed default.                                                                                                           |
| R19  | Aligned                          | Per-player attempts and pairs, with the Kira, Calvin order fixed. The active highlight is covered by AC11 and the unit tests. Values are placeholders by design.                                                                  |
| R20  | Aligned                          | The single-player timer is a static 0:00 placeholder. Real progression is out of scope.                                                                                                                                           |
| R24  | Aligned                          | New Game opens with the applied settings, with no "Start over?" prompt, as revised in rev. 2.                                                                                                                                     |
| R30  | Aligned                          | Preview cards use a K-n-C text back and are `aria-hidden`. The back gives no hint about the front.                                                                                                                                |
| R33  | Aligned for implemented controls | Keyboard and 44 px targets are verified, except the slider (D3). Cards are not interactive yet.                                                                                                                                   |
| R37  | Partly verifiable                | Close and Escape return the game unchanged, with the draft discarded and focus restored. Timer pause while the popup is open cannot be verified because the timer is static. It must be verified in the Step that adds the timer. |

**WCAG 2.2 AA constraint:**

- Verified: visible focus, focus moving in, Tab contained, focus returning on close, Escape behavior, 44 px targets (except the slider), and `aria-pressed` on Sound.
- Not verified, so not counted as met:
  - The screen-reader smoke test (roadmap STEP-06).
  - `prefers-reduced-motion`. A search of `src/` found no handling, which is acceptable only while there are no animations. It must be added with R32.
  - Visual equivalents for sounds. The toggle is visual only, with no sounds yet.
  - Variant differences not shown by color alone. No cards exist yet.
- Failed: D1 (WCAG 2.1.1 keyboard) in the post-Go state.

### Defect dispositions

| ID  | Severity       | Recommendation                                                                                                                                      | Product reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Medium         | **Fix in STEP-02.** Do not defer to STEP-04. The Moderator makes the final call.                                                                    | The shell after Go is the first thing a tester or child sees. At 375 px the default 20-card preview is about 6000 px of scroll, and a keyboard user cannot reach it. This is a serious WCAG 2.1.1 failure against our WCAG 2.2 AA target and the AGENTS.md rule that the app must pass all axe checks. The roadmap lists "Responsive grid fit" under STEP-04, but that Step will change this container anyway, so a deferral could leave a known failure in place if STEP-04 slips. How to fix it is the Dev Team's decision. Whatever the fix, add an e2e axe check on the post-Go state. If the Moderator defers it anyway, record the deferral in `roadmap.md` with STEP-04 as the owner and make "post-Go axe clean" an explicit STEP-04 acceptance check. |
| D2  | Low            | **Fix in STEP-02, together with D1.** If the Moderator does not want another cycle, defer to STEP-03 with an explicit owner.                        | Orientation for screen-reader users is cheap to provide and it is the same post-Go state as D1. It is a best-practice rule, not a WCAG failure, so it does not block acceptance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| D3  | Low            | **Accept and defer to STEP-06 (accessibility pass), with a documented design deviation.**                                                           | The 44 px −/+ buttons give the same control, so WCAG 2.5.8 is met. It is still a tap target for young children (R33) and below the design's 44 px target. Either grow the slider's hit area or record a design-spec decision that the buttons are the primary control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| D4  | Low (test gap) | **Fix with D1.** Widen the axe helper to report moderate and minor findings and best-practice rules. List any exceptions explicitly, with a reason. | Without this, D1 and D2 type findings pass silently. This one-time change protects every later Step.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Residual risks from `qa.md`:

- **Clock-dependent e2e:** accept, with a fix before the Step is closed out. After 2026-10-11 06:00Z the e2e suite silently stops covering the birthday splash, and the cutoff is the headline behavior of this release. Pin the clock in e2e, covering both sides of the cutoff, in the same change as D1 and D4. If the Moderator prefers, this can go to STEP-03, but it must not be forgotten.
- **Cutoff evaluated once per route entry:** accept. A session left open across midnight Denver time keeps the birthday rules until `/game` is entered again. This is consistent with R4 ("chosen at the start of each game") and the stated code comment. The impact is low because the game restarts and re-evaluates on Go. Re-check this when Restart arrives in a later Step.
- **Subfolder build overwrites `dist/`:** accept. Document in the release steps that deployment uses the last build run. The subfolder deep-link hosting follow-up from STEP-01 remains open before the release.

### Notes

- **Moderator decisions needed at the final gate:**
  1. D1, D2 and D4: fix now (recommended) or defer with a recorded owner.
  2. D3: accept the deferral to STEP-06.
  3. The clock-pinned e2e: now or STEP-03.
- **Carry forward (not blockers):**
  - R37 timer pause (needs a real timer).
  - Reduced motion (with R32).
  - Sound visual equivalents (with R31).
  - Screen-reader smoke test (STEP-06).
  - Real-device touch check and Firefox/WebKit (QA did only emulated Chromium).
  - Update `mod-w/design-spec.md` for the stable sound/player test IDs (from `review.md`).
  - The preview board is one card per row at 375 px, which is expected until STEP-04. Phone users will see this behind the first-open popup in the meantime.
- **Minor:** the unit test name in `src/app/app/app.spec.ts` still says "placeholder" (I3). It is worth a rename the next time the file is touched.
- **Product-level criteria not yet testable:** deck rules, matching, 40-card layout at phone and tablet sizes, and variant legibility in the reveal all belong to later Steps. This sign-off does not cover them.
- **Verification limit:** this sign-off relies on the evidence in `qa.md` and `review.md`. I did not independently run the app, tests or axe.
