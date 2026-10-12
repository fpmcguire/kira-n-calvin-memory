# QA

## QA - STEP-06 Slot-Based SVG Variants

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-06 - Content, Art, Device QA and Release Hardening (slot-based SVG variant scope only)
**Tester:** Claude Code (QA role)
**Date:** 2026-10-12
**Commit under test:** `a808ed6` (`docs(mod-w): approve step 06 rework for QA`). Implementation chain: `40a7686` (initial), `99e4d05` (Moderator handoff), `fe5eeb3` (Tech Lead review), `61e188c` (rework), `a808ed6` (Moderator approval of rework and passing re-review). `git diff 40a7686~1 a808ed6 -- mod-w resources prototype` lists only `mod-w/review.md`, `mod-w/roadmap.md` and `mod-w/step-06.md` (Tech Lead/Moderator records); neither implementation commit touches `mod-w/**`, `resources/art/**` or `prototype/**`. Working tree was clean before and after QA; this section is the only change QA made. No tag was created.
**Status:** Pass with notes for the slot-based SVG variant implementation and the contract-boundary rework. No blocking defects. STEP-06 as a whole is not closed: the external gates listed below remain open.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-12
- **Decision:** Approved the QA record for the slot-based SVG variant implementation and its Pass with notes verdict, together with the added DS-009 section 3.9.4 matrix protocol below. Non-blocking item Q1 and notes N1-N5 are accepted as recorded. Every external gate listed in this section and the C2PA publication decision remain open; this approval closes none of them.

### Summary

**Pass with notes.** Every acceptance check that the slot-based SVG work can satisfy without external evidence passes. Both Tech Lead must-fix findings remain resolved. I found no blocking defect and no regression in matching, scoring, attempts, timer, players, confirmation flows or persistence.

The one non-green result is a **single failure in my first `npm run test:e2e` run** (83 passed, 1 failed). The failing test is a test-timing hazard, not a product defect (Q1 below). The test passed 5/5 in isolation and the full suite then passed 84/84 on an immediate full rerun. I record both runs rather than only the clean one.

### Must-fix findings from the Tech Lead review - still resolved

| Finding | Result | Evidence |
| ------- | ------ | -------- |
| 1. Generic edition-declared child IDs; no child-name/ID branching in reusable TypeScript or templates | Resolved | `ChildId` is an opaque string and the parser applies the generic kebab-case grammar to child declarations and `theme.child`. `parser` specs replace both shipped IDs with valid alternatives and keep rejection of undeclared theme references. The `.ts`/`.html` scan in `edition-art.cross-validation.spec.ts` is part of `npm run validate:edition` (68 passed). My own grep of non-spec `.ts`/`.html` under `src/app` for `kira`/`calvin` finds only: the edition URL constant (`edition-source.ts`), the route title and flag comment (`app.routes.ts`, `feature-flags.ts`), doc comments (`options.ts`, `players.ts`, `types.ts`, `game-state.ts`) and the separate greeting page. None is a branch. SCSS selectors are the known non-blocking residual (N1). |
| 2. Complete runtime SVG validation of owner, activity, ordered fixed groups/parts, variant groups, slots, variables and defaults before explicit trust | Resolved | `ActivityArtContent` carries `owner`, `activity` and ordered `nonVariantGroups`. Sanitizer, repository-tampering and cross-validation specs mutate each case and are in the 488-test unit run. `grep` for `bypassSecurityTrust` in non-spec source finds one call, `activity-svg-repository.ts:76`, receiving sanitizer output. The only `[innerHTML]` binding is `card-face.html:10`, fed from that repository. |

### Acceptance check results

Only checks the slot-based SVG implementation can affect are marked Pass or Fail. Checks that need external evidence are marked **Open - external**; QA neither passes nor fails them.

| Check | Result | Notes |
| ----- | ------ | ----- |
| AC1 | Pass | `e2e/art.spec.ts` "every theme names a supplied child-prefixed SVG, served unchanged" and "every shown face draws its own inline SVG": 40 inline `svg` under `.front`, no `img`, no `base64`, `data-activity` equals the edition name for all ten themes. Former flat files are gone from `public/content/kira-calvin/art` (diff stat). Board and reveal share `CardFace` (`pair-reveal.html`). `verify:subfolder` drew 10 distinct inline activity SVGs from the built artifact. |
| AC2 | Pass (automated) / **Open - external** (real devices) | Square `viewBox` handling and 3:4 cards are covered by `layout.spec.ts` and `art.spec.ts` at emulated phone/tablet portrait/landscape; all pass. Final no-clipping/no-layout-shift judgment on real devices is AC23 and is not claimed here. |
| AC3 | Pass | `npm run validate:edition`: 1 file, 68 passed, 0 skipped. Covers unique IDs, same-origin relative paths, square `viewBox`, exact slot/group/default-variable and treatment-variable coverage, at least two eligible slots, and edition/served SVG/`manifest.json` equality. See must-fix 1 for the child-name guard. |
| AC4 | Pass | Unit `presentation.spec.ts`, `deck.spec.ts`, `game-state.spec.ts`; e2e "variants on: one eligible slot per theme, identical for every copy" and "Go and Restart reroll the selection; flips and Show All do not". Probe P2 (40 cards, 10 themes) found 20 alternate and 20 base faces, each alternate with a slot and treatment ID. Variants off creates no selection (probe P4: no `data-variant-slot`/`data-treatment-id`). `FaceId` is `{ themeId, variantId }` and card IDs are unchanged. |
| AC5 | Pass (implementation) / **Open - external** (DS-009 3.9.4 matrix) | e2e "an alternate face repaints exactly its selected slot and nothing else" compares rendered fill/stroke per top-level group; "Drones drone recolors both of its variables, and only the drone" passes. Excluded slots are never selected (edition allow-list only). Visual, CIEDE2000 and color-vision judgment stays in AC15. |
| AC6 | Pass with note (N3) | e2e "face-down cards have no front SVG, medallion, hooks or face names": 40 face-down cards have zero `.front`, `app-card-face`, `svg`, `.medallion` or any of the three hooks, and the ARIA snapshot is `Card N, face down` with no face names. Probe P2 (reduced motion, Show All): all 20 alternate faces have exactly one `aria-hidden="true"` medallion; all 20 base faces have none. Probe P4: variants-off board shows 20 faces and zero medallions. Back is the shared `app-card-back` (e2e "every card shows the same logo back and no face"). Medallion geometry (at least 12 px, 2 px ring) passes in `art.spec.ts`. |
| AC7 | Pass | `board.spec.ts`, `game.spec.ts` and `art.spec.ts` assert `data-difference` absent (also `grep` finds it only in negative assertions). `data-variant-slot`/`data-treatment-id` are on the visible `app-card-face` host only and absent on base faces. `data-cue-present` is `true` on alternate and `false` on base, matching `architecture.md` lines 125-126. `board-card-button-{index}`, `data-state` and `data-variant` remain on the card button. |
| AC8 | Pass | Sanitizer, repository and cross-validation specs in the 488-test run: scripts, event attributes, `foreignObject`, external references, undeclared variables, malformed and mismatched SVGs, plus owner/activity/fixed-group mutations are rejected; mismatched markup is never trusted or cached. One trust call, in the repository only (see must-fix 2). |
| AC9 | Pass | Logo is the shared back and the generic-splash mark. Static images use `NgOptimizedImage`; structured art is inline by design. No `NG02955` warning was logged by the probe (see "Browser console"). |
| AC10-AC13 | **Open - external / not in scope** | Final audio is not supplied. `git diff 40a7686~1 a808ed6` does not touch `sound.ts`; the placeholder-tone behavior and Sound-toggle contract from STEP-05 are covered by the unchanged passing unit and e2e suites. No placeholder is presented as final. |
| AC14 | **Open - external** | Product Owner-approved greeting content not supplied. The existing greeting route is intact (e2e `app.spec.ts`, axe on the greeting). |
| AC15 | **Open - external** | The DS-009 3.9.4 matrix (52 x 69 px through 40 cards and reveal, CIEDE2000, protanopia/deuteranopia/tritanopia/achromatopsia, two unfamiliar reviewers, Drones `drone`) was not run. QA has no color-vision simulation tooling or unfamiliar reviewers in this session. |
| AC16 | Pass | Parser rejects an activity with fewer than two eligible slots (unit); selection is an unweighted uniform index over the remaining list; no slot is rejected in the shipped edition. |
| AC17 | Pass (automated) / **Open - external** (final-art and device evidence) | e2e "face ink, the medallion and the logo ring meet WCAG AA contrast when rendered" computes face ink 4.5:1, ring-on-cream and ring-on-face 3:1 and logo ring 3:1 for all ten themes. It passed 84/84 on the second full run and 5/5 isolated; it failed once on the timing hazard in Q1. |
| AC18 | Pass | `art.spec.ts` "fill slider and its steppers have an effective 44 by 44 px target" and "every option checkbox label is at least 44 px tall" pass; card minimum 52 px stays in `layout.spec.ts`. D3 is resolved in code. |
| AC19 | Pass | Widened axe helper (`wcag2a/aa/21/22aa/best-practice`, `AXE_EXCEPTIONS` empty) covers greeting, splash variants, options/fill, board, reveal, confirm, single-player end, two-player winner and tie, and inline-SVG faces with the medallion. 0 findings, no impact filter. |
| AC20 | **Open - external** | No real screen-reader smoke test. QA's ARIA snapshots (face-down name only) are automated evidence and do not satisfy AC20. |
| AC21 | Pass (automated) | Existing `play.spec.ts` keyboard/focus suite passes. Probe P5: Enter and Space flip cards from focus; the mismatch reveal takes focus inside the reveal; Enter dismisses it; cards return to `down`; focus returns to a board card (`board-card-button-2`); no console or page errors. |
| AC22 | Pass | `play.spec.ts` "reduced motion shortens card motion and shows no confetti" (0.001 s vs 0.4 s, no `end-confetti-root`); full motion keeps 0.4 s flip and confetti. Probe P2 under `prefers-reduced-motion: reduce` shows the static medallion on every visible alternate face. |
| AC23-AC26 | **Open - external** | Real phone/tablet 40-card portrait/landscape and rotation; Safari and Firefox normal and private-mode storage. Not run. Storage was verified only in Chromium. |
| AC27 | Pass | `knc-memory.v1.options` is unchanged (`git diff` does not touch `stored.ts` or `game-storage.ts`). Probe P3 after a full variants-on game: only `knc-memory.v1.options` exists, with exactly `fill, fillCount, players, themes, variants`, and the dump contains no `slot`, `treatment`, `medallion` or `cue`. |
| AC28 | Pass | Cancelled "Start over?" and storage-failure unit coverage is in the passing 488-test run. No committed e2e was required by the changed code. |
| AC29, AC31 | **Open - external** | Production repository/base path and static-host deep-link behavior not decided or tested on a real host. |
| AC30 | Pass (local production-style build) / **Open - external** (real host) | `npm run verify:subfolder`: 10 distinct inline activity SVGs, `edition.json` and logo loaded; 21 URLs under `/kira-n-calvin-memory/`; greeting, lazy game route, direct `/game` and refresh checked; no root-relative leak or error. |
| AC32 | Pass with note | All commands pass; see "Command evidence". The first `test:e2e` run had one failure (Q1); the full rerun is 84/84. The one unit skip is the existing `it.skipIf(FEATURE_FLAGS.permanentBirthday)` case. No budget warnings. |
| AC33 | Pass | `npm run test:e2e:dated`: 14 passed. Default and dated builds both build. `play.spec.ts` and `end` e2e assert no birthday copy in gameplay or end screens; player selection is independent of build mode (unchanged `cutoff.spec.ts` passes). |
| AC34 | Pass | See "Commit under test". The implementation range edits no protected record, prototype or source art. |

### Regression review

| Area | Result | Evidence |
| ---- | ------ | -------- |
| Board and reveal rendering | No regression | Shared `CardFace`; board, reveal, axe and layout e2e pass; reveal shows the same slot, treatment and medallion as the board (`art.spec.ts`). |
| Base versus alternate faces | No regression | Probe P2: 20/20 split on a 40-card board; base has no hooks or medallion; alternate has slot, treatment and one medallion. |
| Diamond medallion | No regression | Decorative, `aria-hidden="true"`, present only for visible alternate faces, present in reduced motion, absent with variants off. |
| Face-down/gone identity protection | No regression (note N3, N4) | Zero front subtree, hooks and face names for settled down/gone cards; ARIA snapshot `Card N, face down`. |
| Keyboard and focus | No regression | Existing suite plus probe P5. |
| Reduced motion | No regression | See AC22. |
| Matching, scoring, attempts, timer, players, confirmations | No regression | `FaceId` unchanged; the only domain-boundary change is `startPlay` seeding zero scores from the edition's children, which yields the same `{ kira, calvin }` entries. The full unit suite (488) and e2e (84) pass. |
| Persistence schema and behavior | No regression | AC27; STEP-05 persistence e2e passes unchanged. |

### Command evidence

Run on 2026-10-12 under Node `v26.0.0` (`fnm use v26.0.0`; `node --version` printed `v26.0.0`). Logs were captured to the QA scratch directory.

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | Exit 0. Test Files 27 passed (27); Tests 488 passed, 1 skipped (489); 26.99 s. |
| `npm run validate:edition` | Exit 0. 1 file passed; 68 passed, 0 skipped. |
| `npm run build` | Exit 0. Initial total 258.22 kB (73.58 kB transfer); lazy `game` 64.17 kB (17.40 kB transfer), `greeting` 1.16 kB. No budget warnings. |
| `npm run build:subfolder` | Exit 0. Initial total 258.22 kB (73.58 kB); no budget warnings. |
| `npm run verify:subfolder` | Exit 0. "Drew 10 distinct inline activity SVGs (expected 10), loaded edition.json and the logo." "Loaded 21 URLs ... greeting, lazy game route, direct /game and refresh checked." "Subfolder check passed." |
| `npm run build:dated-birthday` | Exit 0. Initial total 258.22 kB (73.58 kB); no budget warnings. |
| `npm run test:e2e` (run 1) | **Exit 1. 83 passed, 1 failed, 0 skipped (3.3 m).** Failure: `art.spec.ts:441` "face ink, the medallion and the logo ring meet WCAG AA contrast when rendered (AC17)"; `locator.evaluate` timed out at 30 s waiting for `board-card-button-15 .medallion`. See Q1. |
| `npx playwright test e2e/art.spec.ts -g "meet WCAG AA contrast when rendered" --repeat-each=5` | 5 passed (24.1 s; each 3.1-4.8 s). |
| `npm run test:e2e` (run 2, full) | Exit 0. **84 passed**, 0 failed, 0 skipped, 0 flaky (2.9 m). |
| `npm run test:e2e:dated` | Exit 0. 14 passed, 0 failed, 0 skipped (40.1 s). |

These match the Tech Lead re-review figures (488 unit, 68 edition, 84 e2e, 14 dated) once the Q1 timing hazard is set aside.

### Browser console

- All e2e runs: no uncaught error or unexpected console error was reported by the suite. The suite does not assert on console output, so this is limited to what failing tests would catch.
- **QA-only probe** (below): console `error`/`warning`, `pageerror`, failed requests and HTTP 4xx/5xx were recorded for P1 (greeting, splash, options, two-player 8-card game with a mismatch reveal and a full completion), P2 and P5. **Zero entries** in each. No `NG02955` LCP warning appeared on the greeting or splash. The probe ran against `ng serve` in Chromium only.

### Fresh browser verification (QA-only probe)

A throwaway Playwright spec in the QA scratch directory (outside the repo, not committed; it reused `e2e/support.ts` and ran `ng serve` on port 4311 in Chromium). 5/5 passed (37.7 s).

| Probe | Result |
| ----- | ------ |
| P1: greeting to splash to options to two-player 8-card variants-on game, one mismatch reveal, full completion | End screen reached; console, page error, failed-request and HTTP >= 400 logs all empty. |
| P2: `prefers-reduced-motion: reduce`, 40 cards, variants on, Show All | Face-down board has no `app-card-face`/`.medallion`. After Show All: 20 alternate faces each with `data-cue-present="true"`, a slot, a treatment and one `aria-hidden` medallion; 20 base faces each with `false`, no slot/treatment and no medallion. No console errors. |
| P3: stored data after a full variants-on game | Only `knc-memory.v1.options`, five expected keys, no slot/treatment/cue text. |
| P4: variants off, 20 cards, Show All | 20 faces, no medallion, no slot/treatment hooks, `data-cue-present="false"` throughout. |
| P5: keyboard only (Enter, Space, Enter to dismiss) | Flips, reveal focus inside the dialog, dismissal back to `down`, focus on a board card; no console errors. |

### Defects

**Blocking:** None.

**Non-blocking:**

- **Q1 - AC17 contrast e2e is timing-sensitive (test-only, Low).** `art.spec.ts:441` triggers Show All (3000 ms window, `SHOW_ALL_MS`) and then makes about 60 sequential browser round trips (three per theme plus per-theme `paintOf` calls) reading `.medallion` styles. On the loaded first full run the window expired, the face fronts were correctly removed, and the locator waited for a medallion that no longer existed. Product behavior was correct. The test took 3.1-4.8 s in isolation, so the margin against a 3 s window is thin and the failure can recur under parallel load. It is the same class as the previously recorded splash-startup flake: intermittent, passes on rerun, not a product defect. Suggested hardening (Development, not done by QA): read all faces' computed styles in one `evaluateAll` inside the window, or make the test independent of Show All (for example flip pairs and read the reveal). Product Owner and Tech Lead may treat this as release-hardening alongside the splash flake.

### Notes (non-blocking)

- **N1 - SCSS child colors.** `card-face.scss`, `end-screen.scss` and `game-header.scss` still select `[data-child='kira'|'calvin']` with `--kira`/`--calvin`. Tech Lead classified this as later edition-boundary cleanup. Observed, unchanged.
- **N2 - Splash-startup flake and `NG02955`.** The splash-startup flake did not recur in either full e2e run (the Q1 failure is a different test). `NG02955` was not observed. Keep both on the release-hardening list; there is still no console-error assertion in the suite.
- **N3 - Transitional retained front.** For up to `FACE_EXIT_MS = 400` after a card goes down or gone, the front subtree can remain with `aria-hidden="true"` while `data-state` is already `down`/`gone` (ruled acceptable by the Tech Lead; removed at once under reduced motion). QA verified final absence on settled boards and `aria-hidden` on the retained front by code reading (`board.html`), not with an assistive-technology capture inside that 400 ms window.
- **N4 - Hooks on the face-down button.** The card button keeps `data-theme`, `data-variant` and `data-card-id` while face down. These are the pre-existing, spec-required hooks (AC7 requires `data-variant`), are not part of the accessible name, and do not expose the slot/treatment/cue. Noted only for awareness of the face-identity boundary; QA found nothing in the accessibility tree.
- **N5 - Chromium only.** All QA browser evidence is Chromium on Windows. No WebKit or Firefox run.

### External gates still open

None of these were closed, simulated or filled with placeholder evidence:

1. Real phone/tablet evidence (AC2, AC23, AC24).
2. DS-009 section 3.9.4 visual, CIEDE2000, color-vision, unfamiliar-reviewer and Drones `drone` matrix (AC15, and the final-art part of AC5 and AC17).
3. Real screen-reader smoke test (AC20).
4. Safari and Firefox normal and private-mode storage (AC25, AC26).
5. Final sound assets, listening checks and iOS audio unlock behavior (AC10-AC13).
6. Product Owner-approved greeting content (AC14).
7. Production repository/base-path/static-host decision and real-host deep-link check (AC29, AC31, and the host part of AC30).
8. Moderator C2PA publication decision (undecided; does not block QA).

### Protocol for the open DS-009 section 3.9.4 matrix (AC15)

This is the procedure the evidence provider follows. It adds no criterion; every threshold is quoted from `design-spec.md` section 3.9.4. Until a run is recorded, every row is **Not Run**. Do not approve from a magnified SVG alone, and do not substitute automated DOM checks for the visual review.

**Scope.** 29 eligible default/treatment combinations (section 3.9.1/3.9.2): Dance 2, Art 4, Snowboard 4, Red Pandas 2, Squishies 3, Video games 2, Archery 4, Rock climbing 2, Drones 3, Gymnastics 3. Each is checked at three surfaces: a 52 x 69 px board card, representative fitted boards at 4, 20 and 40 cards, and the large reveal. Give the Drones `drone` slot (two variables, thinnest included slot) its own recorded line.

**Setup.** Run the build under test and force each combination in turn (the edition's treatment for the slot, or a QA-only harness outside the repo); record commit, browser and version, device pixel ratio and viewport. Capture each face at actual CSS size at the native device pixel ratio. For each combination capture the base face and the alternate face side by side.

| Step | Check | Pass criterion (section 3.9.4) | Record |
| ---- | ----- | ------------------------------ | ------ |
| 1 | Exact-one-slot integrity | Exactly the selected slot's variables differ from defaults; all non-variant groups, other slots, outlines and fixed details are unchanged; a multi-variable slot changes all its variables. | Per combination: pass/fail, differing groups. |
| 2 | Region size at 52 x 69 px | At least one recolored region 4 x 4 CSS px or larger, and the full slot spans at least 15% of the square art's width or height. Split groups count together only when they read as one object. | Measured px and percentage. |
| 3 | Region size in the reveal | At least one recolored region 12 x 12 CSS px or larger. | Measured px. |
| 4 | CIEDE2000 | Default and alternate colors of every changed variable have `dE00 >= 20` (compute from the section 3.9.2 hex values with a CIEDE2000 implementation; record the tool). | Value per variable. |
| 5 | Boundary contrast | Recolored shape keeps a clear boundary and fixed internal details; where the boundary is needed, at least 3:1 through its unchanged outline or against its immediate background. | Ratio and how measured. |
| 6 | Color-vision review | In normal color, protanopia, deuteranopia and tritanopia simulations the changed region stays locatable side by side and the medallion stays unmistakable. In achromatopsia/grayscale the medallion still distinguishes the alternate. | Simulation tool, per-simulation result. |
| 7 | Unfamiliar reviewers | At least two reviewers who do not know the slot choices identify the alternate in every approved pair, at board and reveal sizes, with no coaching. Any miss rejects that slot/treatment combination pending Designer revision. | Reviewer IDs (not names), pairs, hits, misses. |
| 8 | Copy consistency | Both cards of a pair, and every repeated copy of a face, are visually identical; variants-off shows no recoloring and no medallion. | Pass/fail per theme. |
| 9 | Medallion | Present on every alternate, absent on base and variants-off; geometry at least 12 px board (ring 2 px, diamond 5 x 5 px) and 28 px reveal (ring 3 px, diamond 12 x 12 px); no trace on the shared back. | Measured sizes. |

**Failure handling.** A slot that fails any step is removed from edition content or its treatment is revised by the Designer; remaining slots are never weighted (section 3.9.1). An activity left with fewer than two eligible slots stops for Product Owner and Designer review (AC16). QA does not alter the edition, art or treatments.

**Evidence rules.** Evidence must name who ran each step and with what tool. Reviewer results from the author of a treatment do not count as unfamiliar. A partial run records which combinations remain Not Run; AC15 passes only when all 29 combinations pass steps 1-9.

### Recommended next action

Moderator: accept this QA record as **Pass with notes** for the slot-based SVG variant scope and route it to the Product Owner for review of that scope, keeping every external gate and the C2PA decision open. Optionally ask Development for a small hardening change that fixes Q1 together with the existing splash-startup flake and a console-error assertion for `NG02955`; neither needs to hold the QA gate. STEP-06 itself cannot be signed off until the external gates above have genuine evidence or the Moderator changes the scope.

## QA - STEP-05

**Project:** Kira-n-Calvin Memory Game
**Step:** STEP-05 - Persistence and Sound Feedback
**Tester:** Claude Code (QA role)
**Date:** 2026-10-11
**Commit under test:** `b1ce86c` (`feat(game): implement step 05 persistence and sound feedback`). Tech Lead review `628c6a3`; Moderator QA handoff `d29ff05`. `git diff b1ce86c..d29ff05 -- src e2e prototype angular.json` is empty, so the code under test is exactly `b1ce86c`. Working tree was clean before QA. This section is the only change QA made.
**Status:** Pass with notes. Approved by Moderator; STEP-05 handed to Product Owner acceptance.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the STEP-05 QA record (`1fce1ac`) and its Pass with notes verdict. AC1-AC19 pass with no defects; notes N1-N5 are non-blocking. Next gate: Product Owner Mode 2 acceptance of STEP-05.

### Summary

**Pass with notes.** AC1-AC19 pass. I found no defects. All four required commands pass under Node `v26.0.0`.

I also ran a QA-only Playwright probe against the dev server in real Chromium. It lived outside the repo and was not committed. It checked real `localStorage` contents, corrupt stored data, throwing storage, missing Web Audio and real Web Audio cue scheduling (10/10 passed; see "Fresh browser verification"). The notes below are non-blocking.

### Acceptance check results

| Check | Result | Notes |
| ----- | ------ | ----- |
| AC1 | Pass | `GameState.draft` = `storage.loadOptions() ?? defaultOptions(all themes, [kira])`. Unit `game-persistence.spec.ts` "opens with the approved default when nothing is saved", `game-storage.spec.ts` "has nothing to restore on a first visit". Probe P1: with no valid options, Kira is checked, Calvin unchecked, 10 themes checked, variants and fill off, and Go is enabled. |
| AC2 | Pass | `go()` / `confirmStartOver('go')` → `startFromDraft` → `saveOptions` → `startGame`. `storedOptions` keeps exactly `players`, `variants`, `fill`, `fillCount`, `themes`. e2e `persistence.spec.ts` checks that a reload restores the checkboxes, the summary "8 cards · 4 pairs" and 8 preview cards. Probe P2 read real storage: `{"players":["kira","calvin"],"variants":false,"fill":false,"fillCount":4,"themes":["dance","drones"]}`. |
| AC3 | Pass | `parseStoredOptions` (`domain/stored.ts`) rejects non-records, empty, unknown or duplicate players/themes, non-boolean toggles and fill counts outside 4-40, off the 4-step or fractional. `GameStorage.read` catches both `JSON.parse` and `getItem` failures. Unit: 15 rejection cases in `stored.spec.ts` and 7 fallback cases in `game-storage.spec.ts`, including malformed JSON. Probe P1 seeded real `localStorage` with malformed JSON, an unknown theme, the retired `twoPlayers` shape, `fillCount: 42` and empty players. Each case opened with defaults and logged no page or console errors. See note N2 on whole-set rejection. |
| AC4 | Pass | `resetOptions()` only sets the draft and never writes. Unit `game-persistence.spec.ts` "Reset clears the draft without touching the remembered options" and `game.spec.ts` (AC4). e2e: after Reset both players are unchecked, and after a reload the remembered Calvin and the 8-card summary return. |
| AC5 | Pass | `openOptions` copies `applied` into the draft. Close, Escape and `cancelStartOver` never call storage. Unit "Close and a cancelled 'Start over?' never save the dirty draft". e2e covers Escape with a dirty draft. Probe P2 checked in the browser that a dirty draft followed by Go, cancelling "Start over?" and then Escape leaves stored options byte-identical. |
| AC6 | Pass | `game-storage.ts`, `stored.ts` and `best-score.ts` import neither the cutoff nor `FEATURE_FLAGS`. Unit "restores both players on either side of the cutoff and still rolls the first player". `npm run build:dated-birthday` passes, and the existing cutoff e2e stays splash-only. Its dated-build-only case is skipped in the default build, as before. |
| AC7 | Pass | `storedOptions` drops any `first` / `twoPlayers` field (unit `stored.spec.ts` "keeps only the GameOptions fields…"). `startGame` calls `assign()` on every Go and Restart. Probe P2's stored JSON has no first-player field. |
| AC8 | Pass | `finish()` → `recordBest` runs only for `result.kind === 'single'`, with key `bestScoreKey` = `player:cardCount-plain|variants`. Probe P3 read real storage: `{"kira:4-plain":{"attempts":2,"timeMs":4979}}`. Unit and e2e "New best for Kira on this board!". |
| AC9 | Pass | `judgeBest` replaces only on `score.attempts < previous.attempts`. Unit covers equal and worse games, and equal attempts with a faster time. e2e: a worse game (3 attempts) and an equal game after a reload (2 attempts) both show "Kira's best on this board: 2 attempts". The note text matches DS-016 (design-spec §3.14) exactly. |
| AC10 | Pass | Unit "keeps Kira and Calvin apart on the same board". e2e "Calvin keeps his own best on the same board" shows "New best for Calvin…" after Kira's best. |
| AC11 | Pass | `boardKey` = card count + variants. Unit `best-score.spec.ts` and `game-persistence.spec.ts` "keeps each board apart". The same card count from different themes counts as one board, as C6 requires. |
| AC12 | Pass | `recordBest` returns early for winner/tie. `EndScreen` sets `best: ''` for winner and tie. Unit (AC12) and e2e: there is no `end-best-note` on the winner screen. Probe P3 checked that the best table is byte-identical after a two-player game on the same board. |
| AC13 | Pass | `Sound` is a root `@Service`. `GameHeader.soundOn` is an `input()`, and the toggle goes through an `output()`. The header binds `aria-pressed` and `data-state`. Unit (AC13) and e2e check `aria-pressed` and `data-state` on/off, the 44×44 px minimum, persistence across a reload, and persistence across a `/` → `/game` route visit. |
| AC14 | Pass | `selectCard` plays `flip` only after the `canFlip` guard, `openReveal` plays `match`, and `finish` plays `win`. `Sound.play` returns early when off. Unit with a fake `TonePlayer` gives the exact sequence `flip, flip, match, flip, flip, match, win`, nothing for Show All or an ignored tap, and nothing while muted. Probe P6 in real Chromium counted `createOscillator` calls: 0 after Show All, 1 per flip, 3 per match, 4 for win, and 0 for a whole game with Sound off. This matches DS-021 §5.9. |
| AC15 | Pass | `TonePlayer.play` and `Sound.play` both wrap in try/catch. `audio()` returns null without `AudioContext`. Unit: throwing player, no Web Audio and a failing context. Probe P5 deleted `window.AudioContext` and finished a game with Sound on. Probe P4 made `Storage.getItem`/`setItem` throw; the game still finished with "New best for Kira on this board!" through the in-memory fallback. Neither probe logged page or console errors. |
| AC16 | Pass | The STEP-04 unit and e2e suites pass unchanged: Restart/Go confirms, draft and live state preserved, two-player reroll, timer pause, and no birthday copy in gameplay or on the end screen. `confirmStartOver` was restructured (the `restart` branch still deals `applied`), and its existing confirm tests pass. |
| AC17 | Pass | `expectNoAxeViolations` (widened tags, `AXE_EXCEPTIONS` empty) runs in `persistence.spec.ts` on: the first-open popup with restored options, Sound on, Sound off, the single-player end screen with the best note, and the two-player (winner) end screen without a best note. All have 0 findings. |
| AC18 | Pass | See command evidence. |
| AC19 | Pass | `git diff 057835e..b1ce86c -- prototype mod-w` is empty. Changed files are limited to `src/app/game/**`, `src/app/domain/{stored,best-score}*`, `e2e/persistence.spec.ts`, `src/test-providers.ts`, `src/testing/memory-storage.ts`, and `angular.json`/`tsconfig.{app,spec}.json` (unit-test `providersFile` storage isolation, excluded from the app build). The Tech Lead record is its own commit (`628c6a3`), as the STEP-04 Moderator decision requires. |

### Command evidence

Run on 2026-10-11 under Node `v26.0.0` (`fnm env` + `fnm use v26.0.0`).

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | Exit 0. Test Files 21 passed (21); Tests 303 passed, 1 skipped (304); 14.48 s. The skip is the flag-dependent `it.skipIf(FEATURE_FLAGS.permanentBirthday)` dated-splash case in `game.spec.ts`. |
| `npm run build` | Exit 0. Initial total 234.69 kB (66.38 kB transfer); lazy `game` 55.18 kB (14.17 kB transfer); no budget warnings. |
| `npm run build:dated-birthday` | Exit 0. Initial total 234.69 kB; lazy `game` 55.18 kB; no budget warnings. |
| `npm run test:e2e` | Exit 0. 62 passed, 1 skipped (2.2 m). The skip is `cutoff.spec.ts` "generic splash … (dated-birthday build)", which needs the dated build. |

These results match the Dev Team and Tech Lead figures.

### Fresh browser verification (QA-only probe)

This probe is a throwaway Playwright spec in the QA scratch directory. It reused `e2e/support.ts` and ran against `ng serve` on port 4311 in Chromium. It was not added to the repo. 10/10 passed (54.4 s).

| Probe | Result |
| ----- | ------ |
| P1 ×5: real `knc-memory.v1.options` seeded with malformed JSON, unknown theme, retired `twoPlayers`, `fillCount: 42`, empty players | Defaults restored each time; no page or console errors. |
| P2: two-player Go, then a dirty draft → Go → cancel "Start over?" → Escape | Stored JSON has exactly the 5 `GameOptions` keys and no first player. Storage is unchanged after the cancel and Escape. Reload restores both children. |
| P3: single-player then two-player on the same 4-card board | Best table `{"kira:4-plain":{"attempts":2,…}}`, unchanged by the two-player game; no best note on the two-player screen. |
| P4: `Storage.prototype.getItem`/`setItem` throw | Game plays to the end; "New best" note shows from the in-memory copy; no errors. |
| P5: `AudioContext` removed, Sound on | Game completes; no errors. |
| P6: real Web Audio, oscillator count | Show All 0; flip 1; match 3; win 4; muted game 0. |

### Defects

None.

### Notes (non-blocking)

- **N1 - Sound test ID differs from the design-spec text.** Design-spec §3.6 lists `header-action-button-sound-{on|off}`. The build uses `header-action-button-sound` plus `data-state="on|off"`. This was already the case before STEP-05 (`057835e`), and AC13 asks for `data-state`, so it is not a STEP-05 regression. The Moderator may want the spec or the build aligned later.
- **N2 - One bad field discards all remembered options.** For example, a theme removed in a later edition resets everything to defaults rather than keeping the valid parts. This meets AC3 ("fall back safely to defaults"), and the Tech Lead flagged it as intentional. Product Owner awareness only.
- **N3 - Stored `timeMs` is not shown.** It is computed as `endedAt - startedAt`, with popup pauses removed through the `startedAt` shift in `closeOptions`. It is supporting data only and never shown or used to decide a best (AC9). STEP-05 allows this ("may be stored").
- **N4 - Some checks are unit-only in the committed tests.** The committed e2e covers Escape. The cancelled "Start over?" no-save path and the storage-failure path are covered by unit tests only. QA's probe (P2, P4) verified both in a browser. A committed e2e is optional.
- **N5 - The two-player tie screen has no axe run.** AC17's "two-player end screen without best note" is covered by the winner screen. The tie screen is the same template and has no best note (unit), but no axe run covers it.

### Manual checks not done / residual risks

- I did not listen to the tones. Audibility, volume (peak gain 0.15) and how pleasant the placeholder tones sound are left to the Product Owner. STEP-06 owns the final sounds.
- iOS Safari audio unlock and the suspended `AudioContext` behavior were not tested on a real device. The code resumes on the first cue after a tap. This belongs to the STEP-06 real-device matrix.
- Storage was verified in Chromium only. Private-mode Safari and Firefox quota behavior is covered by the in-memory fallback logic (P4 simulates it) but was not run on those browsers.

### Recommended next action

Moderator review of this QA record. If accepted, hand STEP-05 to the Product Owner for acceptance. N1 and N2 are worth a Product Owner or Designer glance; no rework is required.

## QA - Post-STEP-04 Change Requests

**Project:** Kira-n-Calvin Memory Game  
**Date:** 2026-10-11  
**Changes under gate:** `998197d` (`feat(game): add permanent birthday flag and Kira/Calvin player checkboxes`) and `2287328` (`docs(mod-w): record permanent birthday and player checkbox decisions with Moderator approval`)  
**Status:** Passed by Moderator approval for this situation only.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Tech Lead's post-STEP-04 change review and, because the Product Owner implemented these changes directly under Moderator instruction, approved passing the QA gate for this situation only.
- **Scope of exception:** This approval applies only to the post-STEP-04 permanent birthday splash and player checkbox change requests. It does not change the normal MOD-W requirement that future implementation work proceeds through Dev Team, Tech Lead review, QA and Product Owner gates.
- **Evidence basis:** Tech Lead source review in `mod-w/review.md`; local `npm run build` passed; remaining command verification under a compatible Node version is accepted as a QA follow-up risk by Moderator decision.

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
- **N7 resolution (2026-10-11, Product Owner, R38):** the permanent birthday flag is implemented. `FEATURE_FLAGS.permanentBirthday` is on in the default build and off in `npm run build:dated-birthday`. The flag changes the splash only. Player rules stay on the cutoff (R4). Test coverage added: `showsBirthdaySplash` unit tests in both modes, the flag-aware game shell tests in `game.spec.ts`, and the flag-aware browser tests in `e2e/cutoff.spec.ts`. QA has not yet verified this change. The dated build has been compiled, not run in the browser.
- **Player checkboxes (2026-10-11, Product Owner, R4/R6/R7):** supersedes the "player rules stay on the cutoff" part of the N7 resolution above. The Two players checkbox is replaced by Kira and Calvin checkboxes; the cutoff no longer affects players. Implemented directly by the Product Owner at the Moderator's direction, without the Dev Team. QA has not verified it. Coverage: `players.spec.ts`, `options.spec.ts`, `game-state.spec.ts`, `game-play.spec.ts`, `game.spec.ts`, the new `e2e/players.spec.ts`, and a splash-only `e2e/cutoff.spec.ts`.
- **N7 (product heads-up for the Product Owner, not a defect; original text kept as the record):** the Moderator reports (2026-10-11) that stakeholders are discussing keeping the Happy Birthday screens and messages permanently. The Product Owner will hear this before STEP-05 starts and will decide whether the date condition is removed or placed behind a feature flag. QA records no position on that. Observations from the current record and code, to help the decision:
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

#### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved QA re-check of the STEP-04 N4/N6 follow-up (`3046905`). Next gate: Product Owner Mode 2 acceptance of STEP-04 (N3 and N7).

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
