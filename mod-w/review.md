# Technical Reviews

## Tech Lead Review - Structured Activity SVG Format

**Date:** 2026-10-12
**Reviewer:** Codex Tech Lead
**Material reviewed:** the working-tree activity-art package under `resources/art/`, including `README.md`, `card-art-format.md`, `manifest.json`, and the ten child-prefixed activity SVGs
**Review boundary:** Format and ramifications only. This is not an implementation review and does not approve changes to runtime code, product requirements, design specifications, architecture, or STEP-06 acceptance status.

### Verdict

**Approved as the proposed art contract, subject to the required product and downstream role-owned updates below.**

The new package is coherent and materially different from the first STEP-06 integration. Each activity remains one square SVG, but its top-level paint-order groups now distinguish immutable likeness/scene content from recolorable variant slots. `manifest.json` provides the machine-readable contract for groups, slots, CSS variables and default colors. The intended base face uses the approved defaults; the alternate face recolors an approved slot while preserving all non-variant groups.

All ten activity SVGs passed a structural cross-check against the documented contract and manifest: valid XML; `viewBox="0 0 200 200"`; root owner/activity metadata; top-level groups only; unique group IDs; required `data-group`, `data-part` and `data-slot` attributes; exact manifest group membership; exact CSS-variable coverage; and no unmanifested activity SVG. This validation does not substitute for the documented pixel-diff claim or visual, color-blindness and real-device review.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-12
- **Decision:** Approved the Tech Lead's review of the structured activity SVG format and its recorded ramifications. The structured slot-based format is accepted as the proposed product direction and may proceed to Product Owner review using the Tech Lead's recommended prompt.
- **Limits:** This decision does not itself amend `product.md`, approve final per-activity slot allow-lists or palettes, choose the final non-color cue, authorize runtime implementation, accept the removal of C2PA provenance for publication, or close/reopen STEP-06 acceptance checks. Those decisions remain with their named owners and gates.

### Required product requirement updates

- **R9:** State that variants-off deals only the default `base` pair, while variants-on adds an `alternate` pair that differs through one approved slot recoloring plus the required non-color cue.
- **R15:** Require the selected slot change and non-color cue to remain clearly distinguishable in the large reveal.
- **R27:** Preserve the approved child/activity illustration and immutable likeness groups while allowing controlled changes only through declared variant slots.
- **R28:** Replace random choice among color, pattern, accessory and orientation with per-game selection of an approved variant slot and Designer-approved alternate color treatment. The base uses manifest defaults; exactly one approved slot changes; the selection is stable for every copy of that face and rerolls on Go and Restart.
- **R29:** Require every color-based slot difference to carry an approved non-color cue rendered consistently by the card presentation on the board and in the reveal, without revealing identity face down.
- **R35:** Treat SVGs, the manifest, slot allow-lists and approved palettes as edition content. The reusable engine consumes a generic typed contract and does not hard-code child names, activity filenames, slot names or edition palettes.
- **R12 remains unchanged:** matching identity stays `{ themeId, variantId }`; the per-game presentation selection does not create another face identity.

Product scenarios, acceptance criteria, risks, assumptions, open questions and the change log must be aligned with those revisions. The Product Owner owns the product wording and must not be bypassed by direct implementation.

### Technical ramifications after Product Owner approval

1. **Architecture:** `architecture.md` currently plans static SVG references through `NgOptimizedImage`. CSS-variable slot recoloring cannot work through an `<img>` element, so the Tech Lead must approve a safe inline-SVG loading/rendering boundary, sanitizer/trust policy, caching strategy and typed manifest interface before development.
2. **Domain language:** add distinct definitions for domain `Variant`, SVG `variant group`, and SVG `variant slot`. Preserve `Face identity` as theme plus domain variant.
3. **Design:** DS-008/DS-009 must define eligible slots, approved alternate treatments, the final non-color cue and legibility requirements. Pattern, accessory-presence and orientation differences are not supplied by this format and must not remain silently required.
4. **STEP-06:** the approved first-integration rule—unchanged SVG through `<img>`, with fixed circle/star as the only difference—does not describe the proposed slot-recoloring implementation. The Tech Lead must revise or supersede the Step only after the product and design gates.
5. **Edition boundary:** copy `manifest.json` with the edition assets and expose it through typed content. Runtime logic must select by `data-group`/`data-slot`, never group ID or DOM position, and must never reorder or re-parent paint-order groups.
6. **Current implementation:** `src/app/content/kira-calvin.ts` and public assets still use the former filenames and static-image model. The new resource package is not integrated and must not be treated as release evidence yet.
7. **Accessibility and QA:** verify every approved base/alternate combination without relying on color alone, including board and reveal sizes. Tests must prove non-variant markup is unchanged, only the chosen allow-listed slot changes, repeated copies render identically and variants-off has no variant cue.

### Items still requiring explicit decisions

- Product Owner and Designer: the eligible slot allow-list for every activity and whether any slot is preferred rather than uniformly random.
- Designer: approved alternate colors/palettes and final non-color cue treatment.
- Tech Lead: inline SVG security, sanitization, caching and component/content boundaries.
- QA: pixel-diff confirmation, variant legibility, color-blindness checks and device evidence.
- Moderator: whether removal of the prior activity-SVG C2PA blocks is acceptable for publication. The logo still retains its C2PA manifest, so provenance handling is currently inconsistent.

### Recommended next action

Send the approved Product Owner prompt to revise `product.md`. After Moderator approval of that product revision, route the design changes to the Designer, then return to the Tech Lead for architecture, domain-language, roadmap/Step and acceptance-plan updates before any Development Team implementation.

## Tech Lead Review - STEP-06 First SVG Integration

**Date:** 2026-10-11
**Reviewer:** Codex Tech Lead
**Diff reviewed:** `265b563..9727e1e` (`9eb9e73..9727e1e`) on `master`
**Review boundary:** Review only. No implementation, QA, Product Owner, prototype, design-specification or sign-off file was edited. No tag was created.

### Verdict

**Changes required.**

The first SVG integration is technically sound in its central implementation: all eleven public SVGs are byte-identical to `resources/art`; asset paths remain in edition content; the board, reveal, shared back, preview, generic splash and Moderator-approved header use `NgOptimizedImage` correctly with positioned fill containers, empty alternative text and lazy loading; and the fixed circle/star variant limitation is honestly represented and unreachable alternatives are not selected by this edition. The timer correction is well placed and the looping confetti remains absent under reduced motion.

The gate cannot pass yet. AC13 has a non-external, automatable gap (no axe run for the generic splash), and the implementation evidence overstates AC11, AC24 and AC27. In addition, the Step still has the explicitly blocked final-sound, greeting, real-device/browser, real-screen-reader and production-host checks. Those blocked checks are not passed by this review.

### Scope check

Every commit is within `step-06.md` or a recorded Moderator override:

- `9eb9e73`, `640ecdc`, `e3e56f9`, `793719e` and `3106a8e` implement the approved asset, presentation, accessibility-test and local subfolder work.
- `410e803` records Dev Team evidence in the permitted evidence location.
- `898cef9` is O1, the Moderator-requested header-logo addition.
- `92d1a18` contains O2, the Moderator-requested looping confetti reversal, and O3, the pre-deal timer defect fix.
- `9727e1e` records those overrides and the Moderator's approval to hand the work to review.

The diff does not touch `sound.ts`, `sound.spec.ts`, storage, options schema, deck building, matching, scoring or player assignment. The only `game-state.ts` change is the pre-deal timer guard. `prototype/**`, `mod-w/design-spec.md`, `mod-w/product.md`, `mod-w/qa.md`, `mod-w/review.md` and `mod-w/sign-off.md` were untouched by the Dev Team range except for the separate evidence record under `mod-w/evidence/`.

The dormant color, pattern and orientation paths in `src/app/game/card-face/face-presentation.ts:43-68` and `src/app/domain/difference.ts:8-42` are not reachable from production edition content: `src/app/content/kira-calvin.ts:42-45` supplies only `['accessory']`, and `src/app/game/game-state.ts:415` passes that list into the deal. The implementation does not claim broader R28/DS-009 behavior.

### Findings, ranked by severity

#### (a) Defects - must correct before QA handoff

1. **Medium - AC13 is marked Done without the required generic-splash axe run.** `e2e/app.spec.ts:52-55` checks whichever splash the default permanent-birthday build renders; the generic branch exists only in the dated build, whose relevant e2e remains skipped. `mod-w/evidence/step-06/implementation-evidence.md:126` acknowledges the gap but still labels AC13 Done. Add an axe run against the dated-birthday build (a dedicated Playwright project/web server or equivalent repeatable run), and change AC13 to Partial until it passes. This is not blocked by an external input.

2. **Medium - AC24 is only partially verified.** `scripts/verify-subfolder.mjs:74-97` opens `/game`, reloads it, starts one board and decodes only the first activity image. It does not visit the greeting route, prove the generic logo path, enumerate all activity assets, or verify final audio assets; moreover, AC23 has not established that `/kira-n-calvin-memory/` is the approved production base. Keep AC24 Partial (and final-audio/base-path portions blocked) rather than Done. After the missing inputs arrive, extend the verifier to exercise the greeting and lazy game routes and assert every final logo/art/audio request. The script correctly avoids claiming AC25: its own SPA fallback proves application behavior, not real-host routing.

3. **Low - AC11 is useful but incomplete contrast evidence.** `e2e/art.spec.ts:194-239` resolves computed CSS colors through a canvas and applies the WCAG formula. That is adequate, repeatable evidence for face text, fixed badge cues and the known logo-ring fill in Chromium, but it is not a rendered-pixel/screenshot measurement and does not measure focus indicators or internal art fills. `mod-w/evidence/step-06/implementation-evidence.md:124` must therefore say Partial, not Done. Re-measure the required focus-indicator pairs against the final surfaces; document why decorative/redundant SVG fills are exempt or measure any meaningful non-text boundaries. Do not present the current method as coverage of the entire AC11 wording.

4. **Low - AC27 is Partial, not release-complete.** The default build is exercised by e2e and the dated build compiles, but `e2e/cutoff.spec.ts` skips the generic dated-build case. A screenshot cited by Dev Team evidence does not establish the repeatable final verification required by AC27. The same dated-build run added for finding 1 should verify the generic splash, absence of birthday copy in gameplay/end screens, and build-independent player selection.

No test assertion reviewed is structurally incapable of failing. The SHA-256, variant mapping, accessible-name, identical-back, target-size, tie/winner axe and timer assertions all fail on meaningful regressions.

#### (b) Follow-ups for later STEP-06 work

1. **Slider/browser evidence:** `src/app/game/options-popup/options-popup.scss:63-71` makes the range input's CSS box 44 px high, so the effective pointer target is technically sound; `e2e/art.spec.ts:166-180` proves it in Chromium. Confirm the computed hit box in Safari and Firefox during the already-blocked browser/device matrix because native range rendering varies by engine.

2. **Dormant variant implementation:** the unused color/pattern/orientation branches are isolated and harmless, but comments in `edition.ts:14-25`, `face-presentation.ts:32-35` and `difference.ts:4-6` still describe the broader R28 behavior as current. When the post-evaluation variant strategy is approved, either restore those modes with assets/evidence or remove/scope the dormant paths and update their tests. Do not activate them merely by expanding edition data.

3. **Architecture record:** O2 matches `design-spec.md` section 3.15/DS-017, uses a bounded 60-element CSS effect, stops when the end screen is not displayed, and renders no confetti under reduced motion (`end-screen.html:1-16`). It nevertheless reverses the default finite behavior described by `architecture.md:112`. The Tech Lead should update that line in a separate architecture-owned commit after the Moderator accepts this review; this review was restricted to `review.md`.

4. **Unreproduced e2e flake:** the Dev Team could not name the single uncaptured failure after O2/O3. Two independent full reruns here both passed 74 with one expected skip, so there is no failing test name to report. Monitor rather than guessing at a cause.

#### (c) Items needing a Moderator decision

1. **Embedded C2PA manifests:** all eleven copied public SVGs retain the supplied `<c2pa:manifest>` data and are byte-identical to their sources. Decide explicitly whether publishing those manifests is acceptable; removing them would conflict with the current unchanged-asset instruction and requires a new decision.

2. **Header-logo legibility and font portability (O1):** `src/app/game/game-header/game-header.scss:22-27` displays the logo at 44 px. The SVG uses non-embedded font families, so lettering can vary by device and may be too small. Keep O1 conditional on real-device review; if it is not reliably legible, the Moderator/Designer should approve a different header treatment or a portable logo asset rather than having the Dev Team alter approved artwork unilaterally.

3. **Looping confetti (O2):** accept it as the Moderator's deliberate DS-017 choice only with the architecture update above. Reduced-motion behavior is sound and tested.

4. **External gates:** final flip/match/win assets, approved greeting copy/photos, the production repository/base path/host routing decision, real phone/tablet evidence, Safari/Firefox normal and private-mode storage, iOS Safari audio, and a real screen-reader pairing remain external inputs or device checks. The Moderator must provide or coordinate them; none is waived by this first-integration review.

### Acceptance check mapping

- **AC1: Met** - all ten mapped activity SVGs render/decode on the board and the shared reveal; placeholder illustration content is removed.
- **AC2: Partial** - `object-fit: contain` and emulated layout checks pass; required real phone/tablet evidence is AC17-blocked.
- **AC3: Met for the approved limitation** - base circle, alternate star, identical per-theme SVG and variants-off base-only behavior are proven; no broader randomization is claimed.
- **AC4: Met** - filenames live in `kira-calvin.ts`; engine/domain presentation flows through `FacePresentation.art` without likeness branching.
- **AC5: Met by automated evidence** - one shared `CardBack` is used for live and preview backs; face-down names remain `Card N, face down`, backs are hidden, and accessibility snapshots expose no face identity. Real screen-reader confirmation remains under AC14.
- **AC6: Blocked** - Designer-owned final sound files are absent; placeholder Web Audio tones remain.
- **AC7: Met as regression evidence** - the unchanged sound contract and cue behavior remain covered; visual equivalents remain present.
- **AC8: Blocked** - needs final sounds and real iOS Safari.
- **AC9: Blocked** - needs final sounds and phone/tablet listening.
- **AC10: Blocked** - Product Owner-approved greeting copy/photos are absent.
- **AC11: Partial** - face text, badge and logo-ring ratios are repeatably checked; focus indicators and the remaining stated scope are not re-measured.
- **AC12: Met in Chromium** - slider, steppers and labels measure at least 44 px; existing layout checks retain cards at least 52 px. Cross-browser confirmation is a follow-up.
- **AC13: Partial; change required** - listed default-build states, including winner and tie, pass widened axe checks; generic splash is not run.
- **AC14: Blocked** - requires the named real screen-reader smoke test.
- **AC15: Met by automated regression evidence** - keyboard flow/focus tests pass; this does not substitute for AC14.
- **AC16: Met** - normal motion retains the celebration and reduced motion removes confetti and collapses transition timing.
- **AC17: Blocked** - requires real phone/tablet portrait/landscape evidence.
- **AC18: Blocked** - emulated rotation passes, but the check explicitly requires real devices.
- **AC19: Blocked** - Safari and Firefox normal-mode persistence is untested.
- **AC20: Blocked** - Safari and Firefox private-mode behavior is untested.
- **AC21: Met** - `knc-memory.v1.options` and its accepted schema are unchanged.
- **AC22: Met** - existing cancellation and storage-failure unit coverage passes; affected release paths were not changed.
- **AC23: Blocked** - production repository and exact base path are not supplied.
- **AC24: Partial** - local `/game` direct load/reload and one art decode pass under the assumed subfolder; the full route/asset wording and approved base are not proven.
- **AC25: Blocked** - no real static-host evidence or routing decision exists.
- **AC26: Met for the prescribed local commands** - all commands pass under Node v26.0.0 with the two documented build-flag skips; command details follow.
- **AC27: Partial; change required** - default behavior is covered and the dated build compiles, but its generic-splash e2e is skipped.
- **AC28: Met** - Dev Team implementation did not edit protected prototype or gate-owner records; the evidence file is separate.

### Command results

Run on 2026-10-11 with `%APPDATA%\fnm\node-versions\v26.0.0\installation` first on `PATH`, Node `v26.0.0`. Initial sandboxed process-launch attempts returned `spawn EPERM`; the same commands were then run with normal process-launch permission and passed.

| Command | Exact result |
| ------- | ------------ |
| `npm test -- --watch=false` | Exit 0; 23 files passed; **317 passed, 1 skipped**; 13.00 s test duration. |
| `npm run build` | Exit 0; initial 240.25 kB raw / 68.05 kB estimated transfer; lazy game 55.32 kB; no budget warning. |
| `npm run build:subfolder` | Exit 0 with `/kira-n-calvin-memory/`; same bundle totals; no budget warning. |
| `npm run verify:subfolder` | Exit 0 after `build:subfolder`; 17 URLs loaded; direct `/game`, refresh and local subfolder checks passed. |
| `npm run build:dated-birthday` | Exit 0; initial 240.25 kB raw / 68.05 kB estimated transfer; lazy game 55.32 kB; no budget warning. |
| `npm run test:e2e` - run 1 | Exit 0; **74 passed, 1 skipped** in 2.5 min. |
| `npm run test:e2e` - run 2 | Exit 0; **74 passed, 1 skipped** in 2.5 min. |

The unit skip and e2e skip are the known dated-build-only cases. The reported earlier uncaptured e2e failure did not recur in either review run.

### Recommended next action

Return to the Development Team for the dated-build generic-splash axe/R38 coverage and evidence-status corrections for AC11, AC13, AC24 and AC27. Then re-review those focused changes. QA may begin planning the external device/browser/screen-reader matrix, but STEP-06 must not enter final acceptance with any blocked check presented as passed.

## Tech Lead Review - STEP-05

**Date:** 2026-10-11  
**Reviewer:** Codex Tech Lead  
**Diff reviewed:** `057835e..b1ce86c` for the Development Team implementation; `21e3949` is the later Moderator handoff record.  
**Status:** Approved by Moderator for QA handoff

### Verdict

Pass.

### Moderator Approval

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Tech Lead review of STEP-05 and the Pass verdict. STEP-05 is approved for QA handoff. The Tech Lead review record was committed separately in `628c6a3` (`docs(mod-w): record Tech Lead review of STEP-05`), satisfying the STEP-04 Moderator process decision.

### Scope check

The implementation stays within STEP-05's approved persistence and sound-feedback scope. The Dev Team changed the expected game/domain/test files plus `angular.json`, `tsconfig.app.json`, and `tsconfig.spec.json` to isolate unit-test device storage through `src/test-providers.ts`; that config work is justified by the new storage boundary and is not unrelated scope creep. `git diff 057835e..b1ce86c -- prototype mod-w/design-spec.md mod-w/qa.md mod-w/review.md mod-w/sign-off.md` is empty. The working tree was clean before this review record was written.

### Findings

#### Must fix now

None.

#### Could fix later

None.

### Design ID mapping

- DS-006: met - the Sound button is now input/output-only, exposes stable `aria-pressed` and `data-state`, persists through the root `Sound` service, and e2e checks its 44 px target and axe state.
- DS-016: met - the single-player end screen shows the literal approved best note text, while two-player winner/tie screens omit the best note and birthday copy.
- DS-020: met - stored options use `players` as child IDs, restore Kira/Calvin checkboxes, and never store the retired `twoPlayers` option or a first player.
- DS-021: met - flip, match and win cue requests are wired through injectable sound services; Show All has no cue; muted and failing audio paths preserve gameplay.
- DS-024: met - last-used options are restored on first open when valid, and single-player best scores are keyed by player plus board key (`card count` and `variants`).

### Acceptance check mapping

- AC1: met - no saved options falls back to Kira alone, all ten themes, variants/fill off and Go enabled; covered in `game-persistence.spec.ts`, `game-storage.spec.ts`, and existing first-open component/e2e coverage.
- AC2: met - successful Go saves only `players`, `variants`, `fill`, `fillCount`, and `themes`; reload restores checkboxes, summary and preview (`e2e/persistence.spec.ts`).
- AC3: met - malformed JSON, unknown players/themes, empty players/themes and bad fill counts fall back without throwing. Unknown theme intentionally discards the whole saved option set, matching the product choice under review.
- AC4: met - Reset clears the draft including both players without overwriting remembered options; the next valid Go replaces storage.
- AC5: met - New Game opens with applied settings; Close, Escape and cancelled "Start over?" do not save dirty drafts; confirmed Go does save.
- AC6: met - storage/player behavior does not read cutoff or feature flags; both default and `dated-birthday` builds compile, and cutoff e2e remains splash-only with the existing default-build skip.
- AC7: met - two-player options restore both checkboxes without first-player storage; Go and Restart continue to roll the first player.
- AC8: met - first single-player completion records a best under `player:cardCount-plain|variants`.
- AC9: met - worse and equal attempt counts keep the existing best. A faster time with equal attempts does not replace a best, by the approved "fewest attempts only" rule.
- AC10: met - Kira and Calvin keep separate bests on the same board.
- AC11: met - different card counts and variants on/off produce separate board keys.
- AC12: met - two-player completions create no single-player best record and show no best note.
- AC13: met - Sound state is service-owned, persisted, exposed with `aria-pressed`/`data-state`, and e2e verifies at least 44 px.
- AC14: met - Sound on requests flip on counted card selections, match when the match reveal opens, and win on completion; Sound off requests no cues; Show All requests none.
- AC15: met - `TonePlayer` and `Sound` swallow Web Audio/player failures, and tests prove gameplay/end-screen completion still succeeds.
- AC16: met - STEP-04 flows are preserved: Restart and Go confirmations, draft/live state, two-player reroll, timer popup behavior, and no birthday copy in gameplay/end screens remain covered.
- AC17: met - axe coverage includes restored first-open options, Sound on/off, single-player end screen with best note, and two-player end screen without best note.
- AC18: met - required verification passed under Node `v26.0.0`; see command results.
- AC19: met - no prototype or forbidden MOD-W files were edited by the Dev Team implementation, and the review record is being committed separately as required from STEP-05 onward.

### Command results

Initial attempts in the default shell showed `node -v` as `v24.13.0`; Angular CLI rejected that version for `ng test` and `build:dated-birthday`. I reran the required commands through `fnm` under Node `v26.0.0`.

- `npm test -- --watch=false`: passed. Test Files 21 passed; Tests 303 passed, 1 skipped.
- `npm run build`: passed. Initial total 234.69 kB; lazy `game` chunk 55.18 kB; no budget warnings.
- `npm run build:dated-birthday`: passed. Initial total 234.69 kB; lazy `game` chunk 55.18 kB; no budget warnings.
- `npm run test:e2e`: passed. 62 passed, 1 skipped. The skip is the existing default-build cutoff case for the `dated-birthday` generic splash.

### Recommended next action

Send STEP-05 to QA. QA should rerun the same command set under Node `v26.0.0`, verify the storage/sound axe states, and then proceed to Product Owner acceptance if no QA defects are found.

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
