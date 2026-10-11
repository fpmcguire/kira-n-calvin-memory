# STEP-06 Implementation Evidence - First SVG Integration

**Status:** Review follow-up applied (2026-10-11). Gated checks remain blocked as listed in section 8; AC11, AC13, AC24 and AC27 are Partial.
**Written by:** Development Team (Claude Code), 2026-10-11.
**Not a record of:** Tech Lead review, QA acceptance or Product Owner sign-off. Those are separate gates.
**Location:** `mod-w/evidence/step-06/` is a working location chosen for this evidence; the Moderator or QA may move it.

Written for: Moderator, Tech Lead and QA reviewers checking STEP-06 against the approved first integration.

---

## 1. Implementation Commits

| Commit | Subject |
| ------ | ------- |
| `9eb9e73` | chore(assets): copy approved svgs into kira-calvin edition content |
| `640ecdc` | feat(game): render approved svg art, logo back and variant cues |
| `e3e56f9` | fix(options): give the fill slider a 44 px pointer target |
| `793719e` | test(e2e): cover svg art mapping, cues, logo back, tie and winner axe |
| `3106a8e` | chore(build): add subfolder verification for the production build |
| `410e803` | docs(mod-w): record step 06 implementation evidence |
| `898cef9` | feat(game): use the logo svg as the header mark (Moderator override O1) |
| `92d1a18` | fix(game): start the timer at 0:00 and loop the end-screen confetti (O2, O3) |
| `9727e1e` | docs(mod-w): record step 06 moderator overrides and approval |
| `de58709` | test(e2e): add dated-build suite and focus-ring contrast checks (review follow-up) |
| `b0c1995` | chore(build): extend subfolder verification to routes and all art (review follow-up) |
| (this commit) | docs(mod-w): correct step 06 evidence statuses after review |

No tag was created.

## 2. SVG Theme Mapping (R27, DS-008)

Files are byte-identical to `resources/art/` (SHA-256 checked in `e2e/art.spec.ts`). Source geometry, fills and internal structure are unedited. Both variants of a theme use the same file.

| Theme ID | Child | Public path (`public/`) | SHA-256 |
| -------- | ----- | ----------------------- | ------- |
| `dance` | Kira | `content/kira-calvin/art/dance.svg` | `5d07c1d9e6f2a975c0296a379eef57f6e9354c303aed08ec2e000a24f2eb4dee` |
| `snowboard` | Kira | `content/kira-calvin/art/snowboard.svg` | `5de517fb7a9eb11c34745730e1db651fe4098c117a7c2251a163a6edf4ad333e` |
| `red-pandas` | Kira | `content/kira-calvin/art/redpandas.svg` | `3b435a2a111841be2978525d66344445601eda00c8c2e3f6871e06dcde3e4efb` |
| `squishies` | Kira | `content/kira-calvin/art/squishies.svg` | `5fdef2b5059503d010bf8e09263d551570f3acc7e0a08c6eddbf6657f9b53522` |
| `art` | Kira | `content/kira-calvin/art/art.svg` | `1e5f0809305d545604c87d5ed416a098dc66ea4998eb022829cf182dae173900` |
| `video-games` | Calvin | `content/kira-calvin/art/videogames.svg` | `119ccbbe271aa1e09f70fb88fdb6a9b345b13929b6ea541b1b10960f8849b468` |
| `archery` | Calvin | `content/kira-calvin/art/archery.svg` | `0935b4c07581aba500792a1e2bca8fc6d316c120799e77a52a151fcaba78980e` |
| `rock-climbing` | Calvin | `content/kira-calvin/art/climbing.svg` | `58772b6fc0daa33d4a45ecdcd39a9ebc1e580fd9078945a9de0228a925d8483e` |
| `drones` | Calvin | `content/kira-calvin/art/drones.svg` | `acab33a8e43ae89fd9370c58354f333a1725c380762ab64b6ddb65068b3a6d3d` |
| `gymnastics` | Calvin | `content/kira-calvin/art/gymnastics.svg` | `ef1e01a07e58dce88ac0ef80b38a6e7d5c0555295421016aa7636eee0a442943` |
| Shared back and splash logo | - | `content/kira-calvin/brand/logo.svg` | `53eff21ea1234c81989f96b1a264970098e5c5a0fa405a20778529e9f62bbe9a` |

Reference chain: `src/app/content/kira-calvin.ts` (typed paths) → `FacePresentation.art` → `<img [ngSrc]>` in `CardFace`; logo → `CardBack` and the generic splash.

## 3. Variant Cues (DS-009, R29, AC3)

| Variant | Visible cue | Activity art | Dealt when |
| ------- | ----------- | ------------ | ---------- |
| `base` | Filled circle, top-right corner, ink color | Theme SVG, unchanged | Always |
| `alternate` | Filled star, top-right corner, ink color | Same theme SVG, unchanged | Variants on only |

- The cue is `aria-hidden`; the parent's accessible name is unchanged (`Kira: Dance`, `Card N, face down`).
- Variants off deal only `base`, with no cue.
- Identity stays `{ themeId, variantId }`; matching is unchanged.
- Edition `differenceTypes` is now `['accessory']`. No hue shift, pattern, mirror or other randomized presentation is dealt. The existing color, pattern and orientation branches in `face-presentation.ts` and `difference.ts` are dormant, kept for a later approved plan.

**Randomized color, pattern, accessory and orientation behavior was not implemented, and is not claimed, for this first integration.** This is the Moderator-approved limitation against R28 and DS-009.

## 4. Changed Files Summary

Totals since `265b563`: 42 files, 719 insertions, 89 deletions.

- **Assets:** `public/content/kira-calvin/art/*.svg` (10 files) and `public/content/kira-calvin/brand/logo.svg`.
- **Content and domain:** `src/app/content/edition.ts`, `kira-calvin.ts`, `kira-calvin.spec.ts` (typed art and logo paths; `differenceTypes` = `['accessory']`).
- **Card face:** `card-face.ts/.html/.scss/.spec.ts`, `face-presentation.ts/.spec.ts` (art field; circle and star cue; placeholder frame removed).
- **Card back (new):** `src/app/game/card-back/` (`CardBack`, shared by board and preview).
- **Board and preview:** `board.ts/.html/.scss/.spec.ts`, `preview-board.ts/.html/.scss`, `game/game.spec.ts` (back is the logo image; text mark removed).
- **Splash:** `splash.ts/.html/.scss` (generic splash shows the logo).
- **Options:** `options-popup.scss` (fill slider 44 px target).
- **E2E:** `e2e/art.spec.ts` (new), `e2e/app.spec.ts` (winner and tie axe), `e2e/play.spec.ts` (tie outcome; logo back assertions), `e2e/support.ts` (`playToTwoPlayerTie`, `TIE_THEMES`).
- **Build:** `scripts/verify-subfolder.mjs` (new, extended in the review follow-up), `package.json` (`verify:subfolder`, `test:e2e:dated`).
- **Review follow-up:** `playwright.dated.config.ts` (new), `playwright.config.ts` (ignores `dated.spec.ts`), `e2e/dated.spec.ts` and `e2e/focus-contrast.spec.ts` (new), `e2e/cutoff.spec.ts` (dated-only skip case moved), `e2e/art.spec.ts` and `e2e/support.ts` (contrast helpers shared; `focusRingOf`), `e2e/persistence.spec.ts` (wait before `clearBoard`), `.gitignore` (dated report folders).
- **Not changed:** `sound.ts` and its interface, `SoundCue` names, `game-storage.ts`, `knc-memory.v1.options`, domain rules for deck, scoring, timer, players and cutoff, `prototype/**`, and `design-spec.md`, `product.md`, `qa.md`, `review.md`, `sign-off.md`.

## 5. Build and Test Results

Node v26.0.0 (`%APPDATA%\fnm\node-versions\v26.0.0\installation` first on `PATH`). This section records the follow-up run after Tech Lead review (`265b563..9727e1e`), made on 2026-10-11 against `b0c1995`. All evidence is local: Chromium, Windows, Node 26. No real device, real browser matrix, real screen reader or production host is involved.

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | 23 files passed. **317 passed, 1 skipped** (the `it.skipIf(FEATURE_FLAGS.permanentBirthday)` generic-splash unit test, which runs only when the flag file is replaced; the dated-build e2e now covers that behavior in a browser). |
| `npm run build` | Passed. Initial total 240.25 kB raw, 68.05 kB transfer. No warnings, no budget messages. |
| `npm run build:subfolder` | Passed, `--base-href /kira-n-calvin-memory/`. No warnings. |
| `npm run verify:subfolder` | Passed. 19 URLs under the subfolder; greeting, lazy game route, direct `/game` and refresh; 10 distinct activity SVGs decoded on a 40-card board and each requested with a success status; logo requested and decoded; no root-relative requests, failed responses, console errors or page errors. |
| `npm run build:dated-birthday` | Passed. Initial total 240.25 kB raw, 68.05 kB transfer. No warnings. |
| `npm run test:e2e:dated` | **14 passed, 0 skipped** (`e2e/dated.spec.ts`, against `ng serve` with the `dated-birthday` file replacement). Run three times (while developing, in the final sequence, and after the persistence fix); all passed. |
| `npm run test:e2e` run 1 | **77 passed, 0 skipped** (2.6 min), after the persistence wait fix below. |
| `npm run test:e2e` run 2 | **77 passed, 0 skipped** (2.5 min). |

Counts moved from 74 passed / 1 skipped to 77 passed / 0 skipped: +3 focus-contrast tests, and the dated-only `test.skip` case in `cutoff.spec.ts` moved into `dated.spec.ts`, where it cannot skip. `dist/` is overwritten by each build, so `verify:subfolder` was run straight after `build:subfolder`, as the script requires, before the dated build.

### 5.1 The earlier e2e flake reproduced

Before the persistence fix, one full default run (the first of two, 76 passed, 1 failed) failed. A preceding full run passed. A later `--repeat-each=6` run of `persistence.spec.ts` (30 tests) did not reproduce it.

- **Test:** `e2e/persistence.spec.ts:102` "Calvin keeps his own best on the same board (AC10)".
- **Output:** `expect(reveal(page, 'match')).toBeVisible()` timed out in `playMatch` (`support.ts:155`), called from `clearBoard` (`persistence.spec.ts:27`), at line 111 (the second `clearBoard`, after Calvin's Go).
- **Probable cause (not proven, since it did not recur in isolation):** a test-side race. `clearBoard` read `faceKeys` straight after the Go click, so it could read the board being replaced and click a pair that was no longer a pair on the new deal, so no match reveal appeared. I cannot show that the app is implicated.
- **Change:** `clearBoard` now waits for the options popup to be hidden and no confirm dialog to be present before reading the board. No assertion was weakened.
- **After the change:** two full default runs and a dated run passed with no failure. The failure was intermittent and seen once, so this is "not reproduced since the fix", not "proven fixed".

## 6. Accessibility Evidence

### 6.1 Automated, completed

- **Contrast (AC11), resolved by the browser and computed with WCAG 2.x relative luminance** (`e2e/art.spec.ts`, `e2e/focus-contrast.spec.ts`). The method is canvas color resolution of computed CSS colors (oklch tokens included) in Chromium. It is **not** screenshot pixel sampling.
  - Face ink on face background, all ten themes: 7.87:1 to 8.34:1 (minimum 4.5:1).
  - Badge cue on face background, all ten themes: 7.87:1 to 8.34:1 (minimum 3:1). The cue uses the ink color.
  - Logo cream ring (`#f3e6cc`, fixed in `logo.svg`) on the navy card back: 10.43:1 (minimum 3:1).
  - Keyboard focus ring against the surface behind it, composited from the element's ancestors' backgrounds (minimum 3:1). Each case also asserts `:focus-visible` matches, outline style `solid` and width at least 2 px:

    | Control | Ring | Surface | Ratio |
    | ------- | ---- | ------- | ----- |
    | Greeting "Play" link | `#1a1a1a` | greeting card | 17.40:1 |
    | Options checkbox | navy | options dialog | 12.49:1 |
    | Options Go | navy | options dialog | 12.49:1 |
    | Header Restart | navy | header | 12.16:1 |
    | Board card | navy | table | 11.10:1 |
    | End-screen New game | navy | end dialog | 12.49:1 |
    | Reveal card | cream | dark overlay composited over the table | 6.23:1 |
    | Splash button | cream | navy splash | 11.48:1 |

  - **Activity illustrations:** each `<img>` has empty alt text and sits beside the visible activity name, so card identity does not depend on the SVGs' internal fills. Their internal decorative fills are therefore not measured and are not claimed as measured.
  - **Not measured (the remaining AC11 gap):** the card-back versus table boundary, the edges of secondary-button and option-checkbox borders, the fill-slider track and thumb, and the active-player tint versus the neutral header. Controls carry text labels or native control rendering, but these boundaries are not measured, so AC11 stays Partial.
- **Axe (AC13):** all tests in `e2e/app.spec.ts` pass with the full WCAG 2.2 AA, best-practice and all-impact filter and no accepted exceptions (`AXE_EXCEPTIONS` is empty). This includes the two-player **winner** and **tie** states. **The generic splash** is now run in `e2e/dated.spec.ts` against the dated build with the same helper, together with that build's single-player, winner and tie end screens and live board: all pass, zero findings, no exceptions.
- **Dated build (R2, R3, R38, AC27):** `e2e/dated.spec.ts` (14 tests, no skips) runs through `playwright.dated.config.ts` and `npm run test:e2e:dated`. It verifies: the generic splash after the cutoff, with the title and the approved logo (`src` equals the edition logo path, empty alt, decoded); no birthday copy, in text or the accessibility tree, on the options popup, board, mismatch reveal and single-player, winner and tie end screens; the birthday splash one second before the cutoff and the switch on a fresh visit across the cutoff; and player selection (Kira alone, Calvin alone, two-player with the roll) identical before and after the cutoff. The default `e2e/cutoff.spec.ts` and `e2e/players.spec.ts` keep covering the default build.
- **Target size (AC12, D3):** the fill slider is 44 px tall and at least 44 px wide, the `+` and `−` steppers are at least 44 × 44, and every option checkbox label is at least 44 px tall. Measured by bounding box in `e2e/art.spec.ts`.
- **Keyboard, focus and reduced motion (AC15, AC16):** the existing `play.spec.ts` keyboard, focus-order and reduced-motion tests are unchanged and pass.
- **Accessible names (AC5):** face-down names are unchanged (`Card N, face down`); the back is `aria-hidden` and identical on every card, checked by `innerHTML` comparison.

### 6.2 Not run here (blocked, section 7)

- Real screen-reader smoke test (AC14).
- Real-device keyboard and focus checks on touch devices (AC15, AC17).

## 7. Acceptance Mapping (STEP-06 AC1-AC28)

Status key: **Done** = implemented and verified in this environment (Chromium, Node 26). **Partial** = implemented, with a named gap. **Blocked** = depends on an external input or device. **Regression** = unchanged behavior, existing tests still pass.

| AC | Status | Evidence or gap |
| -- | ------ | --------------- |
| AC1 | Done | Board and reveal show each theme's SVG (`art.spec.ts`). No placeholder "illustration" text in the build. |
| AC2 | Partial | `object-fit: contain` in the art box. Existing 3:4 and layout tests pass. Phone and tablet layout is pending real devices (AC17). |
| AC3 | Done | Circle for `base`, star for `alternate`, same SVG, shared on board and reveal, variants-off dealing only `base` (unit and e2e). No randomized behavior claimed. |
| AC4 | Done | Art is referenced through edition content only. `presentFace` reads `theme.art` and has no likeness-specific branch. |
| AC5 | Done | One `CardBack` component, identical markup on every card and on the preview; no face identity is exposed. Screen-reader confirmation pending (AC14). |
| AC6 | Blocked | Final flip, match and win sounds from the Designer are not supplied. Placeholder Web Audio tones remain behind the unchanged `Sound` service. Not claimed final. |
| AC7 | Regression | Sound requests per cue and the off state are covered by unchanged `sound.spec.ts`. Visible equivalents unchanged. |
| AC8 | Blocked | Needs real iOS Safari. |
| AC9 | Blocked | Needs phone and tablet listening with final sounds. |
| AC10 | Blocked | Greeting copy and photos are a Product Owner input. The greeting route is unchanged. |
| AC11 | Partial | Face ink, badge cues, logo ring and eight focus-ring/surface pairs (navy and cream) are measured (6.1), by canvas color resolution, not pixel sampling. Activity illustrations are redundant with visible names and have empty alt, so their internal fills are not required for identity. Gap: card-back/table, secondary-button and checkbox borders, slider track and active-player tint are not measured. |
| AC12 | Done | Slider and option label targets measured at 44 px. Cards are 52 px or larger, per existing layout tests. |
| AC13 | Partial | Default-build states including winner and tie pass the widened axe helper. The generic splash and the dated build's play and end screens now pass the same helper in `e2e/dated.spec.ts`. Stays Partial pending Tech Lead re-review of that run and the real screen-reader check (AC14). |
| AC14 | Blocked | Real screen reader required. |
| AC15 | Regression | Existing keyboard and focus tests pass. Real-device keyboard not run. |
| AC16 | Regression | Existing reduced-motion tests pass. Confetti absent under reduced motion. |
| AC17 | Blocked | Needs real phone and tablet, portrait and landscape, 40 cards. |
| AC18 | Blocked | Needs real devices. Emulated rotation test passes (`layout.spec.ts`). |
| AC19 | Blocked (Chromium only) | Persistence tests pass on Chromium. Safari and Firefox pending. |
| AC20 | Blocked | Safari and Firefox private modes. |
| AC21 | Done | `knc-memory.v1.options` and its schema are unchanged. No storage file touched. |
| AC22 | Done | Unit coverage for cancelled "Start over?" and storage failure passes. No new e2e path needed. |
| AC23 | Blocked | Product Owner confirms repository and base path. `build:subfolder` uses `/kira-n-calvin-memory/`, an assumed value set only in `package.json` and `scripts/verify-subfolder.mjs`; it is not approved. |
| AC24 | Partial | `verify:subfolder` now covers the greeting route, lazy game route, direct `/game` and refresh, all ten activity SVGs, the logo, and no leaks, failures or console errors, under the assumed `/kira-n-calvin-memory/`. Unresolved: the approved base path (AC23), final audio files (none supplied, none invented) and a real host. The script supplies its own SPA fallback, so it proves local application routing only. |
| AC25 | Blocked | Real static host and the Moderator/Product Owner routing decision. `verify:subfolder` uses its own SPA fallback and is not evidence for this. |
| AC26 | Done | Section 5 results, Node v26.0.0. E2E result in section 5. |
| AC27 | Partial | Default build: `npm run test:e2e` 77 passed, 0 skipped (two runs). Dated build: `npm run test:e2e:dated` 14 passed, 0 skipped; `npm run build:dated-birthday` passes. Real-device and external checks remain blocked, so release verification is not complete. |
| AC28 | Done | No prototype or Designer, QA, Tech Lead or Product Owner record edited. |

## 8. Blocked or Gated Checks (external inputs and devices)

| Dependency | Owner | Checks blocked |
| ---------- | ----- | -------------- |
| Final flip, match and win sounds | Designer | AC6, AC8, AC9 |
| Greeting copy and photos | Product Owner | AC10 |
| Production repository and base path | Product Owner | AC23 |
| Static host routing (deep link) | Moderator/Product Owner | AC25 |
| Real iOS Safari, Android/desktop as needed, phone and tablet | Moderator (devices) | AC8, AC9, AC17, AC18, AC19, AC20 |
| Real screen reader | Moderator (AT access) | AC14 |

No placeholder content is presented as final evidence. Sound playback, greeting, host and device checks are reported as blocked.

## 9. Notes for Tech Lead and Moderator

1. **Embedded C2PA metadata.** Each supplied SVG carries a Content Credentials manifest (`<c2pa:manifest>`). I decoded it. It is signed by Anthropic and says Claude provided the file and may have created or modified it. There are no personal names or contact details. The files are copied unchanged, as the step requires, so this metadata will be published with the site. The Moderator should confirm that is acceptable.
2. **Logo text fonts.** `logo.svg` uses `'Baloo 2'` and `'Arial Rounded MT Bold'`, with a generic fallback. An `<img>` cannot load web fonts, so the letterforms depend on the fonts installed on each device. The local screenshots show what this machine resolves, which may differ from a phone or another desktop. Real-device review should confirm the logo reads correctly.
3. **Sound.** The Web Audio placeholder tones are still in place. The `Sound` interface, cue names and mute behavior are unchanged.
4. **Dormant randomization code.** Color, pattern and orientation branches remain in the domain and presentation code, but the edition offers only `accessory`. Re-enabling them is a separate approved change.
5. **Preview board.** The first-open preview uses the same shared back, so the logo appears there too.
6. **Earlier run.** An e2e run started before my last edits was invalidated by hot reloads and had five failures. The clean run at the end of this work is the one reported in section 5.
7. **Header mark (Moderator-requested addition).** The step named only the card back and the generic splash for `logo.svg`. The Moderator then asked for the header mark to use it too, so the header's 40 px text "K-n-C" circle is now the logo image at 44 px (`aria-hidden`, empty `alt`). This is outside the originally approved STEP-06 scope and is flagged here for Tech Lead. Unit tests (316 passed, 1 skipped), `npm run build` and `npm run test:e2e` (74 passed, 1 skipped) pass after the change. The logo is small at this size; real-device review should confirm legibility.

## 10. Moderator Overrides and Approval

Recorded at the Moderator's direction on 2026-10-11. These items go beyond, or reverse, what `step-06.md` and earlier steps specified. Tech Lead should review each as a Moderator decision, not as Development Team scope creep.

| # | Override | Commit | What it changes |
| - | -------- | ------ | --------------- |
| O1 | Header mark uses `logo.svg` | `898cef9` | The step named only the card back and generic splash. The header's 40 px text "K-n-C" circle is now the logo image at 44 px (`aria-hidden`, empty `alt`). |
| O2 | End-screen confetti loops | `92d1a18` | Reverses the finite one-pass fall chosen in STEP-04 (architecture: "run finitely or be cheap to disable"). Matches design-spec §3.15 / DS-017 ("loops while the end screen is shown"). Reduced motion still renders none. |
| O3 | Timer reads 0:00 before the first deal | `92d1a18` | Defect fix, not a scope change: before the first Go, `startedAt` was 0, so the header showed time since 1970. `timerText` now returns 0:00 until a game is dealt. Unit test added. |

**Moderator approval:** After reviewing the timer and confetti behavior ("timer and confetti look good"), the Moderator approved the first implementation of STEP-06 for Tech Lead review. This approves handoff to review only. It is not a Tech Lead verdict, QA acceptance or Product Owner sign-off, and the blocked checks in section 8 remain open.

**Result counts at approval** (Node v26.0.0): `npm test -- --watch=false` 317 passed, 1 skipped; `npm run build` clean; `npm run test:e2e` 74 passed, 1 skipped on the final run. One earlier e2e run after O2/O3 had a single failure that was not captured and did not recur on re-run, so treat it as an unexplained flake for Tech Lead to be aware of. Section 5 lists the earlier gate results, which predate O1-O3.
