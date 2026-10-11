# STEP-06 Implementation Evidence - First SVG Integration

**Status:** Independent Development Team work complete. Gated checks remain blocked as listed in section 6.
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
| (this commit) | docs(mod-w): record step 06 implementation evidence |

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
- **Build:** `scripts/verify-subfolder.mjs` (new), `package.json` (`verify:subfolder`).
- **Not changed:** `sound.ts` and its interface, `SoundCue` names, `game-storage.ts`, `knc-memory.v1.options`, domain rules for deck, scoring, timer, players and cutoff, `prototype/**`, and `design-spec.md`, `product.md`, `qa.md`, `review.md`, `sign-off.md`.

## 5. Build and Test Results

Node v26.0.0 via fnm (`C:\Users\User\AppData\Roaming\fnm\node-versions\v26.0.0\installation`). Commands were run in the order the step gives. No warnings and no budget messages in any build.

| Command | Result |
| ------- | ------ |
| `npm test -- --watch=false` | 23 files passed. 316 tests passed, 1 skipped (pre-existing `it.skipIf` for the dated build). |
| `npm run build` | Passed. Initial total 240.25 kB raw, 68.05 kB transfer (500 kB budget). |
| `npm run build:subfolder` | Passed, with `--base-href /kira-n-calvin-memory/`. |
| `npm run verify:subfolder` | Passed. Served under `/kira-n-calvin-memory/`, loaded `/game` directly and after reload, dealt a board, decoded the first card art, with no root-relative or failed requests and no console errors. |
| `npm run build:dated-birthday` | Passed. |
| `npm run test:e2e` | 74 passed, 1 skipped (pre-existing `test.skip` for the dated build in `cutoff.spec.ts`). Exit 0. |

Pre-existing skips: one unit test (`it.skipIf` for the dated build) and one e2e test in `e2e/cutoff.spec.ts` (`test.skip`, dated build only).

## 6. Accessibility Evidence

### 6.1 Automated, completed

- **Contrast (AC11), measured from rendered pixels** in Chromium, with WCAG 2.x relative luminance (`e2e/art.spec.ts`):
  - Face ink on face background, all ten themes: 7.87:1 to 8.34:1 (minimum 4.5:1).
  - Badge cue on face background, all ten themes: 7.87:1 to 8.34:1 (minimum 3:1). The cue uses the ink color.
  - Logo cream ring (`#f3e6cc`, fixed in `logo.svg`) on the navy card back: 10.43:1 (minimum 3:1).
  - Not measured here: the focus ring and secondary-button tokens, which carry the §2.2 values unchanged; the activity art's internal fills, which are not required to understand the card because the name is visible text.
- **Axe (AC13):** all tests in `e2e/app.spec.ts` pass with the full WCAG 2.2 AA, best-practice and all-impact filter and no accepted exceptions. This includes the new **two-player winner** and **two-player tie** states, which were previously missing. The existing states listed in that file (greeting, splash, options with fill, live board, reveal, confirm, single-player end, narrow board) still pass.
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
| AC11 | Done (partial scope) | Measured values in 6.1. Focus-ring tokens carried from §2.2, not re-measured. |
| AC12 | Done | Slider and option label targets measured at 44 px. Cards are 52 px or larger, per existing layout tests. |
| AC13 | Done (one gap) | Winner and tie states added. Generic splash axe is not run in the default build; it only appears in the dated build, which the e2e suite does not run. |
| AC14 | Blocked | Real screen reader required. |
| AC15 | Regression | Existing keyboard and focus tests pass. Real-device keyboard not run. |
| AC16 | Regression | Existing reduced-motion tests pass. Confetti absent under reduced motion. |
| AC17 | Blocked | Needs real phone and tablet, portrait and landscape, 40 cards. |
| AC18 | Blocked | Needs real devices. Emulated rotation test passes (`layout.spec.ts`). |
| AC19 | Blocked (Chromium only) | Persistence tests pass on Chromium. Safari and Firefox pending. |
| AC20 | Blocked | Safari and Firefox private modes. |
| AC21 | Done | `knc-memory.v1.options` and its schema are unchanged. No storage file touched. |
| AC22 | Done | Unit coverage for cancelled "Start over?" and storage failure passes. No new e2e path needed. |
| AC23 | Blocked | Product Owner confirms repository and base path. `build:subfolder` uses `/kira-n-calvin-memory/`, the only place it is set. |
| AC24 | Done (local) | `verify:subfolder` covers direct load, refresh, art and no root-relative leaks under the subfolder. |
| AC25 | Blocked | Real static host and the Moderator/Product Owner routing decision. |
| AC26 | Done | Section 5 results, Node v26.0.0. E2E result in section 5. |
| AC27 | Partial | Default build covered by e2e. Dated-build splash checked by one screenshot (generic splash with logo). Dated-build e2e is not run. |
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
