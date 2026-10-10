# Product Owner Sign-off

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
