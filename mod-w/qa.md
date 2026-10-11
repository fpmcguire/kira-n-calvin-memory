# QA

## QA — STEP-04

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-04 — Play Loop, Board, Reveal and End Flow
**Tester:** Claude Code (QA role)
**Date:** 2026-10-11
**Commit under test:** `b733a84` (`feat(game): implement step 04 play loop`). Working tree was clean before QA. This section is the only change QA made.
**Status:** Pass with notes. Submitted for Moderator review. Q1 (AC1, Medium) was open in this record; it is fixed in `f2211c5` and verified closed in "Q1 re-check" below. Notes N1-N6 remain for the Moderator and Product Owner.

### Summary

**Pass with notes.** AC2-AC24 pass. All three required commands pass under Node `v26.0.0`, and a 5× repeat of the e2e suite (250 runs) had no failures. The STEP-02 carry-forwards are closed: D1 and D2 pass under the widened axe helper, D4 is in place with no exceptions, and the clock-pinned cutoff e2e covers both sides of `2026-10-11T00:00 America/Denver`. It also closes STEP-03 N7 for player assignment.

**AC1 is partly met (defect Q1).** On a face-down card, the face is not visible and is not in the accessible name. But the face text ("Kira", "Snowboard") is a non-ignored part of the button's subtree in Chromium's accessibility tree, and the DOM also holds face identity in test hooks, `data-child` and the `--hue` style. The accessibility-tree exposure goes further than the DOM-attribute question the Tech Lead raised, and assistive technology can reach it. AC25 passes with the same process note as STEP-03 N1 (`review.md` and `roadmap.md` were edited in the implementation commit).

### Acceptance check results

| Check | Result | Notes |
| ----- | ------ | ----- |
| AC1 | **Partially met (Q1)** | Go deals from `dealGame` (`GameState.startGame`), and the board renders `record.cards.length` buttons. Every back is the same `.back` element with the `edition.brand.mark` logo (screenshot: 8 identical K-n-C backs). Accessible name of a down card: `Card N, face down` (`GameState.cardViews`). **But** `board.html` always renders `<app-card-face>` inside `.front`, and only `backface-visibility: hidden` hides it. Probe on a down card: `innerText` is `"K-n-C Kira illustration Dance"`. Chromium `Accessibility.getFullAXTree` shows `StaticText "Kira"` and `StaticText "Snowboard"` under `button "Card 1, face down"` with `ignored=false`. The DOM also carries `data-theme`, `data-variant`, `data-difference`, `data-child`, `data-pattern`, `data-badge` and `style="--hue: N"`. See Q1 and the AC1 interpretation below. |
| AC2 | Pass | `fitBoard` (`board/fit-board.ts`) measures the table, tries every column count, keeps 3:4 cards and has a minimum (52/64 px) with vertical table scrolling as fallback. `.grid` uses `justify-content: center` with fixed-width tracks, so incomplete rows stay left-aligned within the grid. `e2e/layout.spec.ts` covers 4/20/40 cards × phone/tablet × portrait/landscape. Unit: `fit-board.spec.ts`. |
| AC3 | Pass | `layout.spec.ts` "rotating keeps card order, ids and states, scores and the active player". Layout reads only the count and size, and `@for` tracks `card.id`. |
| AC4 | Pass | Native `<button>` per card, `disabled` when gone. e2e "keys reach the cards in grid order…" and "gone cards leave the tab order". 44 px minimum is asserted in the layout e2e. |
| AC5 | Pass | `flipCard` sets `touched`. `inProgress` drives the Restart/Go confirm. Unit `game-play.spec.ts` and e2e AC15. |
| AC6 | Pass | `flipCard` adds one attempt only when `flipped.length === 2`. `selectCard` sets phase `flipping`, and `FLIP_MS` (420) later `openReveal`. |
| AC7 | Pass | `PairReveal` is a `role="dialog"` with `OverlayFocus`. e2e covers focus on the first reveal card and Tab trap. The cream focus ring was not measured by QA; design-spec §2.2 records 6.46:1. |
| AC8 | Pass | Phase `reveal-match` → `MATCH_PAUSE_MS` → `resolveMatch` (pairs +1, `current` unchanged). Gone cards use `opacity: 0; visibility: hidden` and keep their grid slot. e2e "a match leaves an empty slot, moves nothing and keeps the same player". |
| AC9 | Pass | Title "Not a match", hint "Tap a card to continue". `keepFocus` stops scrim presses, and `onCard`/`onKey` dismiss. `onKey` ignores button targets, so Enter on a focused reveal card dismisses only once. `dismissReveal` is guarded by phase. e2e AC9 tests. |
| AC10 | Pass | `locked = phase !== 'idle'` gates `selectCard`, `showAll`, `restart` and `openOptions`, and the header buttons are disabled from the same computed values. e2e Show All test checks that Restart/New Game/Show All are disabled and that a forced card click does nothing. |
| AC11 | Pass | `canShowAll` requires `flipped.length === 0`. `useShowAll` adds +1 attempt with the same `current`. `peeked` is a view-only state, so restoring is exact. `SHOW_ALL_MS` = 3000. The timer keeps running (e2e asserts `0:0[3-9]` afterwards). |
| AC12 | Pass | `GameState.players` / `timerText`. `showTimer` hides the timer in two-player. Unit and e2e. |
| AC13 | Pass | `isComplete` → `finishing` → `finish`. `gameResult` ranks by pairs, then fewest attempts, then tie. e2e checks that the end screen has no "birthday" text and shows attempts and time. Unit covers winner, tie-break and tie. |
| AC14 | Pass | e2e "the end screen offers Restart, and New Game over it closes back to the result". The end screen is `hidden`/`inert` under the popup, and `closeOptions` returns to it. |
| AC15 | Pass | `restart()` confirms only when `inProgress`. A completed game is excluded through `!ended`. e2e AC15. |
| AC16 | Pass | `go()` with `popupOpen && inProgress` sets `confirm('go')`. `cancelStartOver` only clears `confirm`, so the draft and live game stay. e2e AC16. |
| AC17 | Pass | `openOptions` never confirms. It copies `applied` into the draft and pauses the timer, and `closeOptions` resumes it with the paused time removed. e2e AC17. |
| AC18 | Pass | `startGame` calls `assign()` against `clock.now()` on every deal and re-deals cards and differences. e2e `cutoff.spec.ts` "Restart keeps Kira first, every time" and "a session open over midnight Denver time goes random on Restart". |
| AC19 | Pass | Global `prefers-reduced-motion` rule in `styles.scss` (1 ms transitions/animations). The `ReducedMotion` service removes confetti. Play timings are unchanged. e2e checks 0.001s vs 0.4s and that confetti is absent or present. Confetti is finite: 60 pieces, no `infinite`. |
| AC20 | Pass | e2e axe: post-Go board, 40-card narrow board with a scrolling table, end screen at a narrow viewport. All have 0 findings. |
| AC21 | Pass | `<header app-game-header>` sits outside `<main>` (banner landmark). Widened axe reports no `region` finding. |
| AC22 | Pass | `expectNoAxeViolations` uses tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice` and fails on every impact. `AXE_EXCEPTIONS` is empty. |
| AC23 | Pass | `cutoff.spec.ts` pins the browser clock at 23:59:59 and 00:00:00 MDT (in a `Europe/Berlin` browser), with rolls 0 and 0.99, and covers a session crossing midnight. It does not depend on the host date. |
| AC24 | Pass | See command evidence. |
| AC25 | Pass with note | `git diff 6f59bb5 b733a84 -- prototype mod-w/design-spec.md mod-w/qa.md mod-w/sign-off.md` is empty. No config or package files changed. Code changes are limited to `src/app/game/**`, `src/app/domain/play*`, `src/app/content/**` (typed face metadata), `src/styles.scss` (global reduced-motion and button styles) and `e2e/**`. **Note N1:** the commit also edits `mod-w/review.md` (+63, the Tech Lead record) and `mod-w/roadmap.md` (STEP-04 row). AC25 lists `review.md` as not to be edited. This is the same pattern as STEP-03 N1, which the Moderator accepted. The review record's own AC25 line leaves `review.md` out of the list it checks. |

### Command evidence

Run on 2026-10-11 under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`; npm 11.12.1).

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | Exit 0. Test Files 16 passed (16); Tests 218 passed (218); 14.35 s |
| `npm run build` | Exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 49.52 kB, `greeting` 1.16 kB; no budget warnings |
| `npm run test:e2e` | Exit 0. 50 passed (1.6 m) |
| `npx playwright test --repeat-each=5` (flake check, QA-only) | Exit 0. 250 passed (8.0 m), 0 failed, 0 flaky |

The Tech Lead could not run unit tests under Node v24.13.0. That gap is now closed: QA ran all three commands on a compatible Node.

### Focus items

**1. AC1 interpretation.** There are two layers:

- *DOM test hooks* (`data-theme`, `data-variant`, `data-difference`): design-spec §3.9 asks for `data-variant` and `data-difference` "on the card (tests only, never displayed)". The e2e suite needs them (`faceKeys`, `pairsOf`) to play deterministic games. Reading them requires dev tools. QA view: acceptable as test hooks if the Product Owner agrees. Note that the spec asks for `data-variant="{1|2}"`, while the build uses `base|alternate`. The spec does not list `data-theme`.
- *Rendered face subtree* (Q1): this is not a test hook. The full face (child chip, activity name, `--hue`, pattern and badge attributes) is always in the DOM and in the accessibility tree under every down card. Only a 3D backface hides it. A screen-reader user who explores the button's contents, or any tool that reads the AX tree, can hear the face. That counts as exposing face identity "from the back". It could also show up through find-in-page or copy and paste. QA did not confirm find-in-page, because the probe's `window.find` result was ambiguous (the header also contains matching text).

**2. Residual e2e flake risk: low.** The hardened helper is `configure()` in `e2e/support.ts:87`, which now waits for "Pick at least one theme" after Reset. The likely cause: Reset sets the draft signal at once, but zoneless change detection re-renders a moment later. Playwright's `.check()` then saw a still-checked box, did nothing, and the re-render unchecked it. This is a test-timing race, not a product bug, because no person can click inside that single frame. The wait targets text rendered in the same pass, so the fix is sound. In 250 repeated runs there were 0 failures. Remaining pattern of the same kind: `play.spec.ts:116-117` reads `states()` with a non-retrying `expect(await …)` right after the Show All click. If the attribute update ever lags the click round-trip, it could flake. Suggested hardening (non-blocking): use a retrying `expect.poll`/`toHaveAttribute`. Also, the test named "full motion keeps the 0.4 s flip and shows confetti" does not assert confetti. Confetti is asserted in the first play test instead.

**3. STEP-02 carry-forwards.** D1, D2, D4: closed (AC20-AC22). Axe now runs on greeting, splash, first-open and reopened options, Fill stepper, post-Go, narrow 40-card scrolling, one face-up card, Show All, mismatch and match reveals, "Start over?" from Restart and Go, end screen with and without the popup, and narrow end screen. All have 0 findings with no exceptions. Clock-pinned e2e: closed (AC23). STEP-03 N7: players are now re-rolled against the clock on every deal. The splash variant is still decided once on route entry, as intended.

**4. Edited files before QA's record.** No prototype, `design-spec.md`, `qa.md` or `sign-off.md` edits. No unrelated implementation areas were touched. Process note N1 covers `review.md`/`roadmap.md`.

### Defects

| ID | Description | Severity | Status |
| -- | ----------- | -------- | ------ |
| Q1 | Face identity of face-down cards is in the accessibility tree (`StaticText` child name and activity under each `button "Card N, face down"`) and in rendered DOM text. Cause: `board.html` always renders `<app-card-face>` in `.front`, hidden only by `backface-visibility`. AC1 says the back must not expose face identity. The fix belongs to the Dev Team; for example, hide `.front` from assistive technology (`aria-hidden`/`inert`) or hide it while `state` is `down`/`gone`, keeping the flip animation. Add an AX-tree or `innerText` assertion on a down card. | Medium | Fixed in `f2211c5`; verified closed in "Q1 re-check" below |

### Notes (non-blocking)

- **N1 (process, AC25):** `mod-w/review.md` (+63 lines: the Tech Lead's STEP-04 review, including the Moderator's QA-handoff approval) and `mod-w/roadmap.md` (STEP-04 row) were edited in implementation commit `b733a84`. AC25 and the Step's Out of Scope list both say `review.md` must not be edited. The review record's own AC25 line says "met" but leaves `review.md` out of its list of untouched files. There is no product impact. The cost is the audit trail: the code and the verdict on it share one commit, so history cannot show that the review followed a frozen implementation. This is the second time (STEP-03 N1 was accepted without a rule change).
  - **QA recommendation:** accept for STEP-04; splitting the commit is not worth rewriting history. From STEP-05 on, the Tech Lead review should be its own commit after the implementation commit (for example `docs(mod-w): record step NN technical review`), the same way QA, Product Owner and Moderator records are already committed. AC25-style checks can then stay as written.
  - **Moderator decision (2026-10-11, fpmcguire):** accepted for STEP-04, as QA recommended. From STEP-05 on, the Tech Lead review is its own commit after the implementation commit. AC25-style checks stay as written.
- **N2 (spec drift, DS-008/DS-009):** design-spec asks for `data-variant="{1|2}"` and a `board-card-button-{index}` modifier `-down|-up|-gone`. The build uses `data-variant="base|alternate"` and a separate `data-state` attribute. This has no user impact, but the spec and build should agree, through a design-spec change or a code change.
  - **Routing correction (QA):** this record first sent N2 to the Product Owner. That was wrong: design-spec's Authority Boundary puts test-hook names and canonical domain types under Tech Lead authority, and there is no user-facing effect. N2 is a Moderator/Tech Lead item.
  - **Moderator decision (2026-10-11, fpmcguire):** keep the build and change the spec. QA made the edit on the Moderator's behalf: `design-spec.md` §3.8 (card testid is index only, state in `data-state="down|up|peeked|gone"`) and §3.9 (`data-variant="{base|alternate}"`), with a dated entry in a new "Post-approval amendments" table. No code change; the N4/N6 Dev Team round is unaffected. The Tech Lead may ratify the wording in that round's review. Resolved.
- **N3 (Product Owner decision):** whether DOM test hooks on down cards are acceptable under AC1 (QA recommends yes; see Focus item 1).
  - **Routing (2026-10-11, Moderator):** recorded for the Product Owner's review decision, to be taken before STEP-05 starts. It is not a Moderator or Tech Lead item. The narrowed statement of the question is under "Q1 re-check" below.
- **N4 (test robustness):** non-retrying state read after the Show All click (`play.spec.ts:116-117`), and the confetti test's name claims more than it asserts.

### Manual checks not done

Real screen-reader smoke test (would confirm Q1's user impact), real-device matrix, and native find-in-page on the live board. The first two are STEP-06 scope.

### Recommended next action

**Moderator:** decide N1 (QA recommends accepting it for STEP-04 and requiring a separate Tech Lead review commit from STEP-05 on). Send Q1 back to the Dev Team as a small fix in STEP-04 with a regression assertion. Following MOD-W §3d ("Return to 3a until green"), the fix goes back through Tech Lead review before a QA re-check of AC1. Alternatively, accept Q1 with an explicit deferral and owner.
**Product Owner (after Q1):** confirm N3 (test hooks acceptable) and N2 (which side changes), then accept STEP-04. _(Superseded: N2 was decided by the Moderator on 2026-10-11 and is not a Product Owner item; see N2 and "Q1 re-check" below.)_

### Q1 re-check (AC1, after `f2211c5`)

**Tester:** Claude Code (QA role)
**Date:** 2026-10-11
**Commit under test:** `f2211c5` (`fix(game): hide face-down card faces from assistive tech (STEP-04 Q1)`). It sits on `b733a84`; the later commits `0ceb295` and `25749de` are records only, so the code under test is the same at `HEAD`. Working tree clean before and after (QA mutated `board.html`/`board.scss` temporarily and restored them with `git checkout HEAD --`; `git status` was empty afterwards).
**Result:** **Q1 closed. AC1 met** for what it asks: a down or gone card's child and activity names are no longer in `innerText`, the accessible name or Chromium's accessibility tree, and the flip, up, peeked and reveal behaviour is unchanged. What remains is the DOM test-hook question (N3), which the fix left open on purpose.

**Process note:** per the Moderator record in `review.md` (`0ceb295`), the rework went straight to this QA re-check with no Tech Lead re-review. See N5. This section is behavioural verification, not a code review.

#### Check results

| # | Check | Result | Evidence |
| - | ----- | ------ | -------- |
| 1 | Q1 / AC1: live down card, fresh deal | Pass | Chromium 156 (Playwright), 4-card game. `innerText` of every card is `K-n-C` (back mark only); the board's `innerText` has no face word. `Accessibility.getFullAXTree`, non-ignored nodes under the board: `group "Table: 4 of 4 cards left"` and four `button "Card N, face down"`; no `StaticText` anywhere. `ariaSnapshot` of the board lists only those four buttons. Every `.front` is `aria-hidden="true"` with computed `visibility: hidden`. |
| 1b | Same, after a mismatch turned a card back down | Pass | Card 1 after dismissing the mismatch: `innerText` `K-n-C`, `ariaSnapshot` `- button "Card 1, face down"`, `aria-label` back to `Card 1, face down`, AX tree has no face word. Also checked after Show All ends and under reduced motion: same result. |
| 1c | Gone cards | Pass | After one match: `innerText` is `["", "K-n-C", "K-n-C", ""]`; AX board is `group "Table: 2 of 4 cards left"` plus the two live buttons only; gone buttons are absent; all four `.front` are `aria-hidden` and hidden. After the last pair the end screen is up and the board's `innerText` is empty. |
| 2 | Up and peeked cards | Pass | Up: name `Kira: Dance`, `.front` visible and without `aria-hidden`, `innerText` `K-n-C Kira illustration Dance`, the AX button carries the same name. Show All: 4 of 4 peeked, every `.front` visible and not `aria-hidden`, every name is `{Child}: {Activity}` and matches the face under it. Screenshot of the peeked board shows four faces with their cues. |
| 3 | Flip in both directions, full motion | Pass | Turn down (6 mismatch dismissals and 6 Show All endings, 12 in all): face visible on the first frame, hidden 380-417 ms after the turn starts, and the card was already at 0° on the last frame the face was visible. `aria-hidden` is already `true` on the first frame, so assistive tech loses the face at once while sight keeps it for the flip. A 10 %-speed screenshot mid-turn shows the face turning. Turn up: face visible and `aria-hidden` absent from the first frame, never hidden during the turn. |
| 3b | Reduced motion (AC19) | Pass, unchanged | Flipper `transition-duration: 0.001s`; `.front` `transition-delay: 0s`. Up shows the face at once; down hides it within one frame (17 ms), not after 0.4 s. Play timings unchanged (suite: "reduced motion shortens card motion and shows no confetti" passes). |
| 4 | `app-pair-reveal` | Pass | Not touched by the commit and does not use `.front`. Mismatch: two 340×453 cards with child and activity text, "Not a match", "Tap a card to continue". Match: "Match!" with both faces. Axe on the mismatch reveal: 0 findings; match reveal is covered by the suite's "mismatch and match reveals have no violations". |
| 5 | AC20 / AC22 axe, no exceptions | Pass | Suite axe tests pass and `AXE_EXCEPTIONS` is still empty (`e2e/support.ts` is not in the commit). My own axe runs, same tags as the helper (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`): face-up card, mismatch reveal, board after the mismatch turn-down, peeked board, board with gone cards, end screen: 0 findings each. |
| 6 | Scope (AC25, N1) | Pass | `git show --stat f2211c5`: `board.html`, `board.scss`, `board.spec.ts` (all under `src/app/game/board/`) and `e2e/play.spec.ts`; 4 files, +69/-2. No `mod-w/`, prototype, `design-spec.md`, `sign-off.md` or roadmap file. `0ceb295` touches only `mod-w/review.md` (+15). N1 does not repeat. |
| 7 | N4: `states()` read after Show All | Pass (see N4) | `play.spec.ts:143` now reads `await expect.poll(() => states(page)).toEqual([...])`. The two later `expect(await states(page))` reads (lines 150, 153) follow a retrying wait on the same render pass, or are a no-change check, so they are not racy. |
| 8 | New tests catch the defect | Pass | See the mutation table below. Both fail against the pre-fix code, as the Dev Team reported. |

#### Mutation check (item 8)

QA reverted or altered the fix in the working tree, ran the two new tests, and restored it.

| Variant | Unit: "hides a face-down face from assistive tech…" | E2E: "a face-down card shows only the shared back…" |
| ------- | ------ | ------ |
| M0: `board.html` + `board.scss` from `b733a84` (pre-fix) | **Fails**: `aria-hidden` expected `[null, 'true', 'true']`, got `[null, null, null]` | **Fails**: `toHaveText('K-n-C')` receives the face text as well |
| M1: remove `aria-hidden`, keep CSS | **Fails** (`aria-hidden` assertion) | Passes. Correct: `visibility: hidden` alone already removes the face from `innerText` and the AX tree. |
| M2: remove CSS `visibility`, keep `aria-hidden` | **Fails**: computed visibility `visible` where `hidden` expected | **Fails**: face text in `innerText` |
| M3: remove the 0.4 s hide delay (`transition: none`) | Passes | Passes; **no test in the suite fails** (see N6) |

#### Command evidence

Run on 2026-10-11 under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`), at `HEAD` with a clean tree.

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | Exit 0. Test Files 16 passed (16); Tests 219 passed (219); 9.4 s |
| `npm run build` | Exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 49.83 kB (was 49.52 kB), `greeting` 1.16 kB; no budget warnings |
| `npm run test:e2e` | Exit 0. 51 passed (1.5 m) |
| `npx playwright test --repeat-each=3` (QA-only) | Exit 0. 153 passed (4.4 m), 0 failed |

Browser evidence came from a scratch Playwright script outside the repo (not committed). After I corrected three assertion errors in the script itself (a regex that did not allow the `group` line, a sign error in the flip angle, and a sampler that started before the click), 52 of 53 checks passed. The 53rd compared one Show All turn-down (face hidden at 360 ms) with my own 380 ms floor; I re-measured 12 turn-downs (380-417 ms, card at 0° each time), so I read the 360 ms as frame jitter, not a defect.

One unrelated failure was seen once: in the M3 full-suite run, `app.spec.ts:132` ("Start over?" from Restart and from Go has no violations) failed. I did not capture its message. It did not reproduce in 10 further runs under M3, 10 at `HEAD`, the 153-test run above, or the original 250-run flake check. Nothing connects it to `.front`, but its cause is unexplained and I am not claiming otherwise.

#### Updated notes

- **N3 (Product Owner decision), still open and now narrower:** the AX tree and `innerText` are clean. What remains in the DOM of a down card: `data-theme`, `data-variant`, `data-difference` on the button (design-spec §3.9 test hooks); `data-child`, `data-pattern`, `data-badge`, `data-mirrored` and `--hue` on the `app-card-face` host (the review record's list omits `data-mirrored`); and the face's text nodes under the hidden `.front` (`textContent`, visible in dev tools or to a scraper). None of it is rendered, in the accessible name or in the AX tree. QA recommendation is unchanged: acceptable as test hooks if the Product Owner agrees. Removing the text nodes would mean not rendering the face while down, which would cost the flip animation.
- **N4 (test robustness), half closed:** the racy `states()` read is fixed (check 7). Still open and trivial: the test "full motion keeps the 0.4 s flip and shows confetti" (`play.spec.ts:326`) asserts only the flip duration, so its name claims more than it checks.
- **N5 (process):** the rework had no Tech Lead re-review. The original QA record recommended one under MOD-W §3d; the Moderator chose otherwise and recorded it in `0ceb295`. QA does not dispute that. The fix is 4 files and small, and this re-check found nothing, but the audit trail for STEP-04 now has a code change that no Tech Lead has read.
  - **Moderator decision (2026-10-11, fpmcguire):** the Moderator intentionally bypassed Tech Lead review for this round of STEP-04, that is, the Dev Team's Q1 rework (`f2211c5`) and the QA re-check built on it, for expedience. The Moderator acknowledges that this departs from MOD-W §3d (Dev Team -> Tech Lead -> QA). Recorded as a deliberate deviation, not an oversight. The QA re-check above is the only independent check the rework received. The follow-up Dev Team round for N4 and N6 will follow the full Dev Team -> Tech Lead -> QA flow.
- **N6 (test gap, Low, non-blocking):** nothing guards the 0.4 s hide delay (M3). If it is removed, the face disappears at the start of a turn-down instead of at the end of the flip, and every test still passes. A one-line e2e assertion would close it, in the style of the existing flip-duration checks: `.front` `transitionDelay` is `0.4s` on a down card in full motion and `0s` under reduced motion.
- **N7 (product heads-up for the Product Owner, not a defect):** the Moderator reports (2026-10-11) that stakeholders are discussing keeping the Happy Birthday screens and messages permanently. The Product Owner will hear this before STEP-05 starts and will decide whether the date condition is removed or placed behind a feature flag. QA records no position on that. Observations from the current record and code, to help the decision:
  - **The cutoff has two consumers, not one.** R2 selects the splash (birthday or generic). R4 selects the players: Kira is always the single player and first player before the cutoff, random after it. Both read one switch today (`isBeforeCutoff`, used by `game.html` for the splash and by `choosePlayer` for the players). Removing or flagging the date condition leaves R4 open: should Kira stay fixed, or should player choice stay random with a permanent birthday splash?
  - **In-game messages and the end screen.** Non-goal 5 says no birthday messages inside the game after the splash, and R21 says the end screen has no birthday message. "Messages" beyond the splash would change both.
  - **Greeting page.** R1's greeting page (STEP-01) is a separate route; stakeholders' "screens" may include it.
  - **Why before STEP-05:** Restart (R23, AC18) re-rolls players against the cutoff, and R36 persistence may need to remember whichever behaviour is chosen.
  - **If R2-R4 change:** `product.md` R2-R4 and its cutoff checklist line, DS-001 and DS-020 in `design-spec.md`, `cutoff.ts`, `players.ts`, `game.html` and `game-state.ts`, the unit cutoff tests and the clock-pinned `e2e/cutoff.spec.ts` (STEP-04 AC23) would need to follow. A feature flag keeps both paths, so both would need test coverage.

#### Not done

Native screen-reader smoke test, real-device matrix and native find-in-page (STEP-06 scope, as before). Chromium only. I did not repeat the manual AC2-AC19 checks of the original pass beyond what the full unit, build and e2e runs and the probe above cover; the commit touches only the board's markup and CSS.

#### Recommended next action

**Moderator:** Q1 is closed. N1 is decided (accepted; separate Tech Lead review commit from STEP-05 on). N2 is decided (spec amended). N5 is recorded as an intentional bypass. N4 (confetti test name) and N6 go to the Dev Team round, which follows Dev Team -> Tech Lead -> QA.
**Product Owner (Mode 2 acceptance, after that round clears Tech Lead and QA):** confirm N3 (test hooks and hidden DOM text acceptable under AC1; QA recommends yes), then accept STEP-04. N3 must be answered before STEP-05 starts. N2 is no longer open. Also take N7 (permanent birthday screens and the date condition) at the same time; it affects STEP-05's Restart and persistence work.

### STEP-04 AC13 unit clock fix re-check (`33c746b`)

**Tester:** Claude Code (QA role), Claude Haiku 5.5
**Date:** 2026-10-11
**Commit under test:** `33c746b` (`test(game): pin AC13 end-screen unit clock before cutoff`), on top of `e35b792`. The commit touches only `src/app/game/game/game.spec.ts` (+5/-1). Working tree clean before and after; the one temporary mutation below was restored with an edit back and `git status` was empty afterwards.
**Result:** **Pass.** The AC13 unit clock fix is test-only and makes no product, assertion or `data-*` hook change. The AC13 end-screen unit now runs against a fake clock pinned to `BEFORE` (`2026-10-10T18:00:00Z`), so roll `0.9` keeps Kira on the host date after the `2026-10-11T06:00:00Z` cutoff. No new defects.

#### Check results

| # | Check | Result | Evidence |
| - | ----- | ------ | -------- |
| 1 | Scope: changed file set | Pass | `git show --stat 33c746b` lists only `src/app/game/game/game.spec.ts`. |
| 2 | No product, assertion or `data-*` change | Pass | The diff adds one comment line, `vi.setSystemTime(BEFORE)` in the play-loop `beforeEach` after `vi.useFakeTimers()`. No expectation, selector, `data-*` attribute or `src/app` file changed. |
| 3 | N3, N5, N7 not reopened | Pass | No change to `board.html`, `board.scss`, `e2e/`, `mod-w/` or the cutoff code. Records in `review.md` and `qa.md` are unchanged by this commit. |
| 4 | AC13 no longer depends on the host date after the cutoff | Pass | Setup does not pin system time (`setup(BEFORE)` only supplies the Clock), so the `ticking` clock (`new Date()`) reads the faked `Date`. Under fake timers it starts at `BEFORE` and moves only with `advance`. Run time was `2026-10-11T08:15Z`, after the cutoff, and the test passed. |
| 5 | Mutation: pin removed | Pass (test catches it) | With the `setSystemTime(BEFORE)` line removed, `npm test -- --watch=false` gave 218 passed, 1 failed. AC13 expected `Well done, Kira!` and received `Well done, Calvin!`, which matches the Tech Lead's mutation evidence. The file was then restored. |
| 6 | AC12 timer coverage | Pass | `runs the single-player timer and pauses it under the popup (AC12, AC17)` still checks `0:05`, then `paused` at `0:05` after 20 s under the popup, then `running` and `0:07` after the popup closes. Unchanged. |
| 7 | Other tests unaffected by the pin | Pass | Only the two tests that pass `ticking` (AC12 timer and AC13 end screen) read the faked `Date`. The default Clock in `setup` is a fixed `now`, so the other play-loop tests do not see the pin. |

#### Command evidence

Run on 2026-10-11 under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`), at `HEAD` with a clean tree.

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | Exit 0. Test Files 16 passed (16); Tests 219 passed (219). |
| `npm run build` | Exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 49.83 kB, `greeting` 1.16 kB; no budget warnings. |
| `npm run test:e2e` | Exit 0. 51 passed (1.5 m). |
| Mutation run (check 5) | Exit 1 by design. 218 passed, 1 failed (AC13). Spec restored afterwards. |

#### Notes (non-blocking, carried)

- **N3, N4, N6:** unchanged by this commit. N4 and N6 are for the Dev Team's follow-up round, as recorded in the Q1 re-check.
- **N5, N7:** unchanged. The bypass recorded for `f2211c5` is still a deliberate deviation. N7 is still the Product Owner's decision before STEP-05.

#### Recommended next action

**Moderator:** accept the AC13 unit clock fix re-check (`33c746b`). It closes the test-only follow-up on the cutoff date and does not change the STEP-04 open items above.

#### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved QA acceptance of the STEP-04 AC13 unit clock fix re-check (`33c746b`).
- **Open:** the Tech Lead's N4/N6 follow-up review (`3046905`, `review.md`) asks for its own QA re-check. This entry does not cover `3046905`; that re-check is still outstanding.

### STEP-04 N4/N6 follow-up re-check (`3046905`)

**Tester:** Claude Code (QA role), Claude Haiku 5.5
**Date:** 2026-10-11
**Commit under test:** `3046905` (`test(game): guard the face-hide delay and assert confetti in the full-motion test (STEP-04 N6, N4)`), on top of `3f9dca4`. The commit touches only `e2e/play.spec.ts` (+15). The tree is clean before and after; the one temporary mutation below was restored and `git status` was empty afterwards.
**Result:** **Pass.** N6 is closed: the `.front` delay guard catches the hide-delay mutation. N4's confetti-name half is closed: the full-motion test now asserts the end screen and confetti. No product, `data-*` or unit-test change.

#### Check results

| # | Check | Result | Evidence |
| - | ----- | ------ | -------- |
| 1 | Scope | Pass | `git show --stat 3046905` lists only `e2e/play.spec.ts` (+15, no deletions). |
| 2 | No product change | Pass | The diff adds a `frontDelay` helper and assertions only. No `src/` file changed. |
| 3 | N6 guard: full motion, down card | Pass | `await expect.poll(() => frontDelay(page, 0)).toBe('0.4s')` on the down card, in the full-motion test. |
| 4 | N6 guard: reduced motion | Pass | In the reduced-motion test, `frontDelay(page, 0)` is asserted `0s` right after the existing `.flipper` `0.001s` duration check. |
| 5 | N6 guard: up card | Pass | After the first match, `frontDelay(page, two[0])` is `0s` on the up card. |
| 6 | Mutation: hide delay removed | Pass (guard catches it) | `board.scss` line 112 set to `transition: none`. `npx playwright test e2e/play.spec.ts -g "full motion keeps"` failed with `Expected: "0.4s"`, `Received: "0s"`. Restored. This is the case the earlier M3 check reported as undetected. |
| 7 | N4: confetti test name matches its assertions | Pass | The test is titled "full motion keeps the 0.4 s flip and shows confetti". It now asserts the single-player end dialog is visible and `end-confetti-root` is attached. |
| 8 | Not racy | Pass | `--repeat-each=3` on the changed test: 3 passed, 0 flaky. |

#### Command evidence

Run on 2026-10-11 under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`), at `3f9dca4` with a clean tree.

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` (rerun) | Exit 0. Test Files 16 passed (16); Tests 219 passed (219). |
| `npm run build` | Exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 49.83 kB, `greeting` 1.16 kB; no budget warnings. |
| `npm run test:e2e` | Exit 0. 51 passed (2.4 m). |
| Mutation run (check 6) | Exit 1 by design. The guard failed on `0s` vs `0.4s`. Restored. |
| `npx playwright test e2e/play.spec.ts -g "full motion keeps" --repeat-each=3` | Exit 0. 3 passed. |

#### Environment note

The first unit-test run in this check failed with 9 tests timing out at 5000 ms in `game.spec.ts`, with no assertion errors. A second run failed 8 tests the same way. Rerun passed 219/219. The host had many Chrome processes at high CPU time, and I took the timeouts to be load-related. I did not kill any processes, as they may belong to the user. This is a stability note for the Dev Team, not a defect in `3046905`.

#### Notes

- **N3, N5, N7:** unchanged by this commit. N3 is still the Product Owner's decision, N5 is still the recorded bypass for `f2211c5`, and N7 is still the Product Owner's decision before STEP-05.
- **Unit timeouts (new, low):** the 5000 ms default timeout is tight for `game.spec.ts` on a loaded host. Raising it or reducing parallel load would remove the flake. Not a blocker.

#### Recommended next action

**Moderator:** accept the N4/N6 follow-up re-check (`3046905`). After that, the next gate is Product Owner Mode 2 acceptance of STEP-04 (N3 and N7).

---

## QA — STEP-03

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-03 — Domain Engine and Deck Rules
**Tester:** Claude Code (QA role)
**Date:** 2026-10-10
**Commit under test:** `4040f85` (`feat(domain): add step 03 deck, player and matching engine`), working tree clean before and after QA
**Status:** Pass with notes. Submitted for Moderator review. No blocking defects.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the STEP-03 QA review and acceptance with notes. Notes N1-N7 are carried forward; N1 (AC16 review.md edit) is accepted by the Moderator. Product Owner acceptance is still pending.

### Summary

**Pass with notes.** All AC1-AC16 pass under their stated wording, with one process note on AC16 (`mod-w/review.md` was edited in the implementation commit). The pure domain boundary holds: `src/app/domain/` imports only sibling domain modules, with no Angular, game or content imports. Cutoff, player assignment, deck rules R9-R12, DS-009 cues and face-identity matching are covered by deterministic tests. The STEP-02 options flow still renders the same counts and header order after the domain integration.

### Acceptance check results

| Check | Result | Notes |
| ----- | ------ | ----- |
| AC1 | Pass | `src/app/domain/types.ts` defines `ChildId`, `ThemeId`, `VariantId`, `DifferenceType`, `FaceId`, `PairIdentity`, `DeckCard`, `GameOptions`, `PlayerMode`, `PlayerAssignment`, `Cutoff`, `Deal`. No `any` in `src/app/domain`, `src/app/content` or `game-state.ts` (scan). |
| AC2 | Pass | Kira/Calvin children, the ten themes, cutoff record and the four difference types live in `src/app/content/kira-calvin.ts` behind the typed `EditionContent` interface, provided through `EDITION`. `domain/` has no content import. |
| AC3 | Pass | `cutoff.spec.ts` pins `now` at 05:59:59.999Z (before), 06:00:00.000Z (exactly at) and 06:00:00.001Z (after) for `2026-10-11T00:00 America/Denver`. Also covers the 03:00Z same-day zone case and a second zone (Pacific/Auckland) to show the boundary is data-driven. |
| AC4 | Pass | `players.spec.ts` and `cutoff.spec.ts`: before cutoff Kira is forced as single player and first in two-player, whatever the roll. After cutoff both Kira and Calvin are reachable with injected rolls. Header order is always Kira, Calvin. `game-state.spec.ts` re-rolls the first player on each Go after cutoff. |
| AC5 | Pass | `deck.spec.ts` "fill off": variants off gives one pair and two cards per selected theme. |
| AC6 | Pass | `deck.spec.ts` "fill off": variants on gives two variant pairs and four cards per selected theme. Ten themes with variants on gives 40 cards. |
| AC7 | Pass | Matrix over `FILL_COUNTS = [4, 8, …, 40]` (`deck.spec.ts:8`) with variants off and on. Exact count asserted for every case. |
| AC8 | Pass | R10 targeted tests (`deck.spec.ts` lines 213-268): only checked themes are used, whole pairs only, both variant pairs included per theme with variants on. Supply equal to need uses every pair once; ten themes with variants on at 40 cards uses all 20 pairs with none repeated. |
| AC9 | Pass | R11 targeted tests (lines 269-312): round-robin repeats; one theme with variants off at 40 cards repeats one face 20 times; one theme with variants on splits evenly across both pairs; three themes with variants off at 40 cards give 7/7/6 copies; leftovers are chosen through the injected random source. |
| AC10 | Pass | One theme, variants off, fill 40: the face repeats 20 times. Variants on: the two pairs split evenly. The extreme board is valid. |
| AC11 | Pass | Matrix: all 1023 non-empty subsets × variants on/off × fill off/4-40 × three random sources (seeded, all-zero, identity). Each deck has even card count, whole pairs, legal theme and variant IDs, unique card IDs and no orphan faces. |
| AC12 | Pass | `match.spec.ts`: same theme and variant match; same theme with different variant does not; different theme with same variant does not; a card never matches itself; repeated-pair copies from different positions match. |
| AC13 | Pass | `difference.spec.ts`: one type per selected theme, drawn from allowed types only (including a roll of exactly 1), re-rolls when the source changes, and `color` always carries `secondaryCue: 'dot-pattern'`. `dealGame` re-rolls cards and differences together. |
| AC14 | Pass | Unit: `game-state.spec.ts` (preview count, deal size, fill-count deal, difference assignment, pre- and post-cutoff players). Browser: scripted check run outside the repo against `ng serve` (see Manual checks below); 13/13 steps passed on the second run. |
| AC15 | Pass | Under Node `v26.0.0`: unit tests 10 files / 119 tests passed; `npm run build` passed; `npm run test:e2e` 5/5 passed. Command evidence below. |
| AC16 | Pass with note | Commit file set is within the expected areas (`src/app/domain/**`, `src/app/content/**`, `src/app/game/game-state.ts` and its spec, and the matching spec files), with no prototype, `design-spec.md`, `sign-off.md`, `e2e/` or `README.md` edits. **Note N1:** the commit also adds 65 lines to `mod-w/review.md`, which AC16 lists as a file not to be edited. See N1. |

### Command evidence

Run on 2026-10-10 under Node `v26.0.0` (`fnm use v26.0.0`).

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | Exit 0. Test Files 10 passed (10); Tests 119 passed (119) |
| `npm run build` | Exit 0. Initial total 224.60 kB; lazy chunks `game` 22.49 kB, `greeting` 1.16 kB |
| `npm run test:e2e` | Exit 0. 5 passed (25.1s): greeting→game route, plus axe for greeting, splash, first-open options and reopened options. The `NativeCommandError` lines in the output are the web server's `NO_COLOR`/`FORCE_COLOR` warnings, not failures. |

### Scope check (changed file set of `4040f85`)

| File | In expected area? |
| ---- | ----------------- |
| `src/app/domain/*.ts` and `*.spec.ts` (types, cutoff, players, difference, deck, match, random, options and specs) | Yes (`src/app/domain/**`) |
| `src/app/content/edition.ts`, `kira-calvin.ts`, `kira-calvin.spec.ts` | Yes (`src/app/content/**`) |
| `src/app/game/game-state.ts`, `game-state.spec.ts` | Yes (`src/app/game/**` for domain consumption; spec in `src/app/**/*.spec.ts`) |
| `mod-w/review.md` | Process note, see N1 |

No prototype, `design-spec.md`, `qa.md` (before this section), `sign-off.md`, Product Owner, `e2e/` or `README.md` file changed.

### Manual / browser checks

Scripted Chromium session (Playwright, outside the repo, against `ng serve` on port 4300), clock pinned to 2026-10-10 18:00 MDT (before cutoff):

- First open: summary "20 cards · 10 pairs", preview 20 cards.
- Variants on: summary "40 cards · 20 pairs".
- Fill on starts at 20 (ten themes). Decrement to 16, then to the floor of 4, where the decrement control is disabled. Increment twice to 12.
- Go with two players and fill 12: popup closes, preview shows 12 cards, header lists "Kira" then "Calvin" with Kira active.
- Reopen, which keeps the applied count "12 cards · 6 pairs". Uncheck two players and Go: header shows Kira only.

Result: 13/13 steps passed on the second run. On the first run, one check (decrement from 20 to 16) read the stepper value immediately after the click and got the old value. The same code passed on the next run and I did not reproduce it. I attribute it to the script's read timing, not the product, but I did not confirm the root cause.

Not checked: after-cutoff behavior in the browser (covered by unit tests with pinned `now`), a real-device check, and a screen-reader check.

### Residual risks (non-blocking)

- **N1 (process, AC16):** `mod-w/review.md` was edited inside the implementation commit `4040f85`. AC16 lists `review.md` as a file not to be edited. The edit appears to be the Tech Lead's review record, which is the place reviews are recorded (earlier history also touches `review.md`). Moderator to decide whether this counts as an AC16 breach or is acceptable, and whether future Tech Lead records should land in a separate commit.
- **N2 (cosmetic):** `src/app/domain/deck.ts` begins with a UTF-8 byte-order mark. No test or build effect. Remove in a later cleanup.
- **N3 (R35 boundary):** `ChildId = 'kira' | 'calvin'` is a literal union in domain `types.ts`, as AC1 requires. The child names and theme content are in `content/`, but a different edition with different children would need a domain type change. Accepted as the AC1 design; note for a future public edition.
- **N4 (DS-020, pre-Go header):** `GameState` rolls the single player once on construction, so after the cutoff the header shows a random child before the first Go. This carries over from STEP-02. The roll is re-made on each Go, as R4 requires. Product Owner may want to confirm that a random pre-Go header is acceptable.
- **N5 (engine edge, not UI-reachable):** `selectPairs` with an odd pair count can give a half-used theme (variants on). Fill counts in the UI are multiples of 4, so pair counts are always even and this cannot happen. The edge is tested and documented in `deck.spec.ts`.
- **N6 (product clarification open):** R11 leftover balancing is by pair identity, not by theme, as the Architecture decision and Tech Lead review record. The open question in `architecture.md` is still open for the Product Owner.
- **N7 (carried from STEP-02):** `GameState.beforeCutoff` is evaluated once when the game route is entered, so a session open across midnight Denver time keeps the earlier rule until `/game` is re-entered. The e2e suite still uses the real clock; the clock-pinned e2e belongs to STEP-04.

### Blocking defects

None.

### Recommended next action

Moderator to decide N1, then pass STEP-03 to the Product Owner for acceptance. N4 and N6 need a Product Owner answer, but neither blocks STEP-03 QA.

---

## QA — STEP-02

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-02 — Game Shell, Splash and Options Draft
**Tester:** Claude Code (QA role)
**Date:** 2026-10-10
**Commit under test:** `cc67d0b` (with `f318e3d` Playwright/axe tooling), working tree clean
**Status:** Approved by Moderator

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved the STEP-02 QA review. The disposition of defects D1-D4 has not been recorded yet and is still open for Product Owner sign-off and the Moderator final gate.

### Summary

**Pass with notes.**

All AC1-AC16 pass under their stated wording. One Medium defect (D1) was found outside the three axe states AC14 lists. After Go, the shell has a serious axe violation (`scrollable-region-focusable` on `<main>`). That breaks the AGENTS.md rule that the app "MUST pass all AXE checks", so the Moderator should decide whether to fix it now or defer it to STEP-04, when cards become focusable. No regressions on the greeting route.

### Acceptance check results

| Check | Result | Notes |
| ----- | ------ | ----- |
| AC1 | Pass | `src/app/app.routes.ts` uses `loadComponent` for `game/game/game`. The build output shows a separate lazy `game` chunk (21.03 kB) and a separate `greeting` chunk. In the browser, clicking the greeting link fetched new chunks, rendered `app-game` and did not render `app-greeting`. The greeting link `href` is `/game`. `GameState` is provided on `Game` (`providers: [GameState]`), not globally. |
| AC2 | Pass | With a fixed browser clock: 23:59 MDT Oct 10 (`05:59Z`) gives `splash-screen-root-birthday` "Happy Birthday Kira! Tap to start". 00:00 MDT Oct 11 (`06:00Z`) gives `splash-screen-root-generic` "K-n-C Kira-n-Calvin Memory Game Tap to start". 03:00Z on Oct 11, still Oct 10 in Denver, gives birthday. No date text in either variant. Unit tests `cutoff.spec.ts` cover the boundary and time zone. |
| AC3 | Pass | Real timers: the popup replaced the splash 3504 ms after the splash became visible. `SPLASH_MS = 3000`; the extra time is page render and Playwright polling. Skip worked by click, Enter (56 ms) and Space (36 ms). Escape on the splash does nothing, as the spec requires. |
| AC4 | Pass | After the splash, `options-dialog-root` is shown and `board-grid-root-preview` stays visible behind it. The `.shell` behind it gets `inert`. |
| AC5 | Pass | First open: 10/10 themes checked; Two players, Variants and Fill off; no Close button; summary "20 cards · 10 pairs"; preview 20 cards; Go enabled. Escape is ignored on first open. |
| AC6 | Pass | Reset unchecked every checkbox, hid the stepper, disabled Go, set the summary to "Pick at least one theme", set the preview to 0 cards and kept the popup open. When the popup is reopened, Reset changes only the draft: the board behind stays at the applied count. |
| AC7 | Pass | Go is disabled with no themes. It is still disabled with Fill on and no themes. Checking one theme enables it ("2 cards · 1 pair"). Go applied the draft (preview = 4 cards for 2 themes), closed the popup, removed `inert` and moved focus to New Game. |
| AC8 | Pass | Variants on: "40 cards · 20 pairs", preview 40. 3 themes: "6 cards · 3 pairs", preview 6. Fill on from 6 cards starts at 8 (round up to a multiple of 4). Fill on with no themes starts at 4. The summary and preview follow the fill value. |
| AC9 | Pass | Increment visits exactly `4,8,…,40` and is disabled at 40. Decrement is disabled at 4. The slider (`min=4 max=40 step=4`) with Home and ArrowRight visits `4…40` in steps of 4. `setFillCount` rounds and clamps (unit tested). |
| AC10 | Pass | Header: K-n-C mark and "Memory Game". Player blocks with Attempts 0 / Pairs 0. Single player shows a Time 0:00 timer; two players shows no timer. Show All and Restart are disabled. Sound toggles `aria-pressed` and changes its label between "Sound on" and "Sound off". New Game is enabled after Go and disabled while the popup is open. |
| AC11 | Pass | Before the cutoff: 8 Gos in single player were all Kira; 8 Gos in two-player all had Kira active. After the cutoff: 20 Gos in single player produced both Kira and Calvin; 20 Gos in two-player produced both first players, and the header order was always Kira, Calvin. Unit tests inject a `Random` stub for the deterministic cases. |
| AC12 | Pass | New Game reopened the popup with the applied settings (art and drones, two players, "4 cards · 2 pairs") and the Close button present. A dirty draft (Variants) was discarded by Escape. A dirty draft (Reset) was discarded by Close. Focus returned to New Game in both cases. |
| AC13 | Pass | Focus moves to the splash button on load. On first open it moves to Two players; when reopened it moves to Close, matching design-spec §4.3. Tab ×25 stayed inside the popup. Shift+Tab from Close goes to Go, and Tab from Go wraps to Close. Tab stays inside the splash. Focus returns on close (see AC12). |
| AC14 | Pass with notes | Visible focus: `:focus-visible` gives a 3 px solid navy outline with 3 px offset. Header buttons, checkbox rows, ± stepper buttons, Close, Reset and Go are all at least 44 px at 320, 375 and 1280 px. The range slider is only 16 px tall (D3). Automated axe: the e2e suite passes for the splash, first-open and reopened states. I also ran axe with all rules and all impacts for the birthday and generic splash, first-open, reopened (dirty draft), the Fill stepper, the Reset state, and at 375 px. All had 0 violations. The post-Go shell state, which AC14 does not list, fails (D1, D2). |
| AC15 | Pass | All four commands passed under Node v26.0.0. See command evidence below. |
| AC16 | Pass | `git diff ac4ee92..HEAD -- prototype mod-w/design-spec.md qa.md` is empty. No Product Owner sign-off files were changed. `f318e3d` also edited `AGENTS.md` and `CLAUDE.md` (component-file and Playwright guidance). These files are not forbidden, but they are not in the Step's "Expected File Changes" list (Info, I1). |

### Command evidence

Run on 2026-10-10 under Node v26.0.0. In this shell, `fnm use` requires `fnm env` to be loaded first.

| Command | Result |
| ------- | ------ |
| `fnm use v26.0.0` | `Using Node v26.0.0`; `node -v` → `v26.0.0` |
| `npm test -- --watch=false` | Exit 0. Test Files 4 passed (4); Tests 32 passed (32) |
| `npm run build` | Exit 0. Lazy chunks: `game` 21.03 kB, `greeting` 1.16 kB; initial total 224.60 kB |
| `npm run build:subfolder` | Exit 0. `dist/kira-n-calvin-memory/browser/index.html` has `<base href="/kira-n-calvin-memory/">` |
| `npm run test:e2e` | Exit 0. 5 passed (15.7s): the greeting→game route, plus axe for greeting, splash, first-open options and reopened options |

### Manual / browser check notes

I drove a scripted Chromium session (Playwright library, outside the repo) against `ng serve` at `http://localhost:4200/`. It made 115 checks; the only failures are the defects listed below. I used `page.clock.setFixedTime` to test both sides of the cutoff.

- **Root base path:** `<base href="/">` at `http://localhost:4200/`; the greeting and `/game` both load.
- **Keyboard-only flow:** I completed splash (Enter/Space) → options (Tab, Space on checkboxes, Home/arrow keys on the slider) → Go → New Game (Enter) → Escape without a mouse. Escape does nothing on the splash and on the first-open popup, as specified.
- **Focus visibility and restoration:** the focus ring is visible on keyboard focus. Focus returns to New Game after Close, Escape and Go.
- **Responsive:** at 320×568, 375×667 and 1280×800, the popup stays inside the viewport (16 px inset on phones) with no horizontal scroll. The popup scrolls internally and Go can be reached. The header wraps into 3 rows on a phone, and the page itself never scrolls. The theme columns stay two-up at 375 px.
- **Preview layout:** at 375 px the preview board shows one card per row at about 220 px wide (20 cards ≈ 6000 px of scroll inside `<main>`). At 1280×800 it shows 5 columns and also scrolls. This is expected until grid fitting arrives in STEP-04 (roadmap "Responsive grid fit"), but it is what users see behind the first-open popup on a phone (I2).

### Defects

| ID | Severity | Description | Reference | Status |
| -- | -------- | ----------- | --------- | ------ |
| D1 | Medium | After Go, with no overlay open, axe reports `scrollable-region-focusable` (serious; WCAG 2.1.1). `<main>` scrolls (`overflow-y: auto`) but contains nothing that can take focus, so keyboard users cannot scroll the board. It reproduces with the default 20 cards at both 1280×800 and 375×667. The e2e suite misses it because it never runs axe on the post-Go shell; the reopened state is not flagged because the shell is `inert` then. | `src/app/game/game/game.scss` (`main { overflow-y: auto }`), `src/app/game/preview-board/preview-board.html` (cards are `aria-hidden` divs) | Open. Moderator to decide: fix in STEP-02, or accept and defer to STEP-04 when cards become focusable buttons |
| D2 | Low | After Go, axe reports `region` (moderate; best-practice, not WCAG): the header content (`h1`, player/timer group) is not inside a landmark. `app-game-header` has no `<header>` or `role="banner"`. | `src/app/game/game-header/game-header.ts` host, `game-header.html` | Open |
| D3 | Low | The Fill-the-grid range slider is 16 px tall (105×16 at 375 px, 322×16 at 1280 px). Design-spec §1.3 asks for tap targets ≥ 44 px for the stepper. WCAG 2.5.8 is still met because the 44 px −/+ buttons do the same job, so this is a design-fidelity gap, not an accessibility failure. | `src/app/game/options-popup/options-popup.scss` (range input) | Open |
| D4 | Low (test gap) | The e2e axe helper fails only on `serious` and `critical` violations and filters to WCAG tags, so `moderate` and `minor` findings and best-practice rules (such as D2) pass silently. AGENTS.md says the app must pass *all* axe checks. | `e2e/app.spec.ts` `expectNoSeriousAxeViolations` | Open |

Info (no action needed for STEP-02):

- **I1:** `f318e3d` edited `AGENTS.md` and `CLAUDE.md`, which are outside the Step's expected file list. The changes are guideline-only and match the component layout the code uses.
- **I2:** The preview board does not fit the viewport (see the manual notes). Grid fitting is STEP-04 scope.
- **I3:** The unit test title `navigates to the placeholder via the link without a reload` (`src/app/app/app.spec.ts`) still says "placeholder" although the placeholder was removed.

### Regressions or risks

- No regressions found. The greeting route renders, links to `/game`, and passes axe (e2e plus unit tests).
- **Clock-dependent e2e:** the e2e suite uses the real clock. After 2026-10-11 06:00Z, the "game splash" axe test will exercise the generic splash instead of the birthday splash, and nothing in e2e will cover the birthday splash. Tests will still pass (the test-id regex matches both). Unit tests and this QA run cover both variants; consider pinning the clock in e2e.
- `GameState.beforeCutoff` is computed once, when the route is entered. A session that is open across midnight Denver time keeps the birthday rules until `/game` is entered again. This matches the code comment and R2; it is noted for later steps.
- Running `npm run build:subfolder` after `npm run build` overwrites `dist/` with the subfolder base. Deploy from whichever build ran last.

### Manual checks required (Moderator / deferred evidence)

- A real-device touch check (phone and tablet) of splash tap-to-skip and checkbox hit areas. I checked only emulated viewports in Chromium; no Firefox, WebKit or real devices.
- A screen-reader smoke test (dialog announcement, `aria-live` summary, and `aria-pressed` on Sound) was not performed. Roadmap STEP-06 owns this.
- The subfolder build was checked by its base href only. It was not served from `/kira-n-calvin-memory/` (deep-link hosting follow-up from STEP-01 is still open).

### Known limitations

- Out of scope and not tested: deck building, matching, card art, reveal, scoring, persistence, end screen, sounds, confetti, Show All behavior and the "Start over?" confirm.
- The timer is a static `0:00` placeholder, and the Sound toggle is visual only, as STEP-02 intends.
