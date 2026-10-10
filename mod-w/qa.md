# QA

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
