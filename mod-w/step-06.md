# STEP-06 - Content, Art, Device QA and Release Hardening

**Status:** Planned; awaiting Moderator approval and the blocking inputs named below
**Development Team interface:** Claude Code
**Step type:** Implementation and release verification

---

## Goal

Replace the remaining placeholders with approved production content, prove the game on its target devices and assistive technology, and produce a release build whose subfolder routing, accessibility, storage and sound behavior are verified without weakening the accepted STEP-04 and STEP-05 flows.

The work is split into independently executable content integration, accessibility, device/browser and hosting workstreams. Missing external inputs block only their dependent checks while the Dev Team completes the rest. STEP-06 cannot pass its final gate until every required acceptance check has evidence or the Moderator explicitly changes the scope.

---

## Related Requirements

- R1 - The separate permanent birthday greeting page uses Product Owner-approved copy/photos and links to the game.
- R21 - The end screen keeps the approved result and celebration, including reduced-motion behavior and no birthday message.
- R27 - Card faces use final SVG illustrations that reflect each child's approved likeness and activity.
- R29 - A non-color cue keeps color variants distinguishable.
- R30 - Every card uses the same final K-n-C logo back without revealing its face.
- R31 - Final flip, match and win sounds respect the Sound preference and never become the only feedback channel.
- R33 - Controls and cards provide large targets, keyboard support and the WCAG 2.2 AA accessibility baseline.
- R34 - The static application is built and verified under its approved production subfolder on `kira-n-calvin.com`.
- R35 - Personal art, activities and edition assets remain separate from the game engine.
- R36 - Last-used options and single-player best scores remain available on supported devices, with graceful in-memory behavior when storage is unavailable.
- R38 - The default and dated-birthday builds preserve the accepted splash-only feature-flag behavior.

## Related Design IDs

| Design ID | Design element | Design intent to preserve | Product requirement |
| --------- | -------------- | ------------------------- | ------------------- |
| DS-001 | Splash | Use the approved birthday or generic brand presentation without changing the R38 build-time behavior. | R30, R38 |
| DS-002-DS-006 | Header, scores, timer and actions | Preserve readable states, focus treatment and the stable Sound control contract while final assets are integrated. | R21, R31, R33 |
| DS-007-DS-008 | Responsive board and card | Prove 3:4 cards, minimum size, order preservation, empty slots and undistorted final SVG faces/back at the target device matrix. | R27, R30, R33 |
| DS-009 | Variant cues | Keep color, pattern, accessory and orientation differences legible; color always has a secondary cue. | R29 |
| DS-010-DS-015 | Options, count, reveal and turn feedback | Preserve popup/reveal behavior, input locking and visible equivalents while checking keyboard and screen-reader use. | R29, R33 |
| DS-016-DS-017 | End screen and confetti | Verify single-player, winner and tie results; confetti is absent under reduced motion. | R21, R33 |
| DS-018-DS-020 | Confirm, summary and players | Preserve existing confirmation, card-count and player behavior during release hardening. | R33, R36 |
| DS-021 | Sound cues | Replace placeholder tones with approved final flip, match and win assets; mute correctly and degrade silently. | R31 |
| DS-022-DS-023 | Motion and keyboard/focus | Preserve reduced motion, visible focus, keyboard operation and target sizes. | R33 |
| DS-024 | Device memory | Preserve versioned persistence and validate supported-browser/private-mode behavior. | R36 |
| DS-025-DS-026 | Return and overlay focus | Verify Close/Escape, focus containment and focus restoration with a real screen reader. | R33 |

---

## Assigned Dev Team Interface

- [x] Claude Code (default)
- [ ] Claude Design (visual / chart / interaction-heavy Step)

---

## Scope

- Integrate the supplied SVG likeness art for all ten activities from `resources/art` through the edition-content boundary. Preserve face identity, randomized difference types and the required secondary cue for color differences; validate how the existing difference-type presentation composes the two variants with each supplied theme asset rather than inventing additional art.
- Integrate `resources/art/logo.svg` as the shared card back and generic-splash brand asset. The back must be identical for every card and must not reveal face identity visually or to assistive technology.
- Replace placeholder Web Audio tones with Designer-owned final flip, match and win assets while keeping the existing `Sound` service interface and cue names stable. Audio loading, decoding, autoplay/unlock and playback failures must not interrupt gameplay.
- Listen to the final cues on at least one phone and one tablet at normal volume. Verify that flip is audible but not harsh and that match/win cues are distinct.
- Put iOS Safari audio unlock first in the real-device matrix. Verify the first eligible user interaction enables later cues when Sound is on; if audio remains unavailable, verify AC15-style silent continuation through completion.
- Verify last-used options, sound preference and best-score storage on Safari and Firefox, including their private modes. When browser storage is rejected or unavailable, verify the existing in-memory fallback without changing the versioned `knc-memory.v1.options` schema.
- Complete the accessibility pass: rendered contrast against the final assets and surfaces, keyboard/focus behavior, the fill-slider target-size follow-up, automated axe coverage including the two-player tie screen, and a real screen-reader smoke test of the primary flow and overlays.
- Capture real-device layout evidence on a phone and tablet in portrait and landscape with 40 cards, including card ratio/minimum size, scroll fallback, order preservation on rotation, incomplete-row alignment, empty slots and large-reveal legibility.
- Confirm the production repository and base path. Verify the selected static host serves `/kira-n-calvin-memory/` and direct `/kira-n-calvin-memory/game` navigation/refresh, or obtain a Moderator/Product Owner decision to use hash routing or publish only folder-root links and test the chosen behavior.
- Integrate Product Owner-approved greeting copy and photos for R1 when supplied, keeping the greeting separate from the game state.
- Add focused automated regression coverage needed to protect final asset mapping, audio failure behavior, accessibility and production-base-path behavior. The cancelled "Start over?" no-save and storage-failure e2e paths are optional unless implementation changes make them necessary; existing unit coverage remains required.

### Open Dependencies and Gated Checks

| Dependency | Owner | Checks blocked until supplied/decided | Work that proceeds independently |
| ---------- | ----- | ------------------------------------- | -------------------------------- |
| Final flip, match and win sounds | Designer | AC6-AC9 final-audio integration/listening | Art, accessibility, storage and hosting checks |
| Greeting page copy and photos | Product Owner | AC10 greeting content approval | All game and hosting checks; existing greeting route remains intact |
| Production site repository and exact base path | Product Owner; Moderator chooses the routing fallback if deep-link support is unavailable | AC23-AC25 deployed/static-host checks and final release artifact | Local subfolder build and all non-host checks |

No placeholder may be presented as final evidence for an asset-dependent check. Record a blocked result against the exact dependency while continuing the other workstreams.

---

## Out of Scope

- Inventing likeness details, approving photos, designing the K-n-C logo, writing greeting copy or choosing final sounds on behalf of their owners.
- The STEP-05 N2 follow-up for partial saved-options fallback after edition content changes. Record it in the roadmap for later edition work; do not implement it in STEP-06.
- Changing the storage schema or reusing `knc-memory.v1.options` for a different shape. Any necessary schema change requires a new versioned key or an explicit migration and a newly approved plan.
- New gameplay rules, new themes, more players, two-player best-score history, accounts, backend services or public-edition work.
- Changing the accepted birthday/player behavior, confirm semantics, scoring, timer, deck rules or DOM-only test-hook decision.
- Editing `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md`, `mod-w/product.md` or `mod-w/sign-off.md` during Dev Team implementation. The Designer owns the separate design-spec section 3.6 test-ID correction.

---

## Inputs

- `mod-w/product.md` (R1, R21, R27, R29-R31, R33-R36, R38; acceptance checks and Open Questions)
- `mod-w/design-spec.md` (section 2 accessibility baseline, section 2.2 contrast, sections 3.6, 3.9, 3.15 and 5.9; DS-001-DS-026)
- `mod-w/architecture.md` (edition-content/assets boundary, static delivery, persistence/sound and accessibility evidence owners)
- `mod-w/domain-language.md` (Edition content, Face identity, Last-used options, Sound preference)
- `mod-w/roadmap.md` (STEP-06 and carry-forwards)
- `mod-w/step-05.md`, `mod-w/sign-off.md`, `mod-w/qa.md` and `mod-w/review.md` (accepted behavior, N-items, D3 and hosting follow-up)
- `resources/art/*.svg`: ten supplied activity files (`dance`, `snowboard`, `redpandas`, `squishies`, `art`, `videogames`, `archery`, `climbing`, `drones`, `gymnastics`) and `logo.svg`
- Product Owner-approved greeting copy/photos, repository and production base path when available
- Designer-approved final flip, match and win sounds when available
- Existing implementation and automated suites under `src/**` and `e2e/**`

---

## Likely Affected Files

- `public/content/kira-calvin/**` for approved SVG, logo, sound and greeting assets
- `src/app/content/edition.ts`, `src/app/content/kira-calvin.ts` and their specs for typed asset references
- `src/app/game/card-face/**`, `src/app/game/board/**`, `src/app/game/splash/**` and focused specs for static art/logo rendering
- `src/app/game/sound.ts` and `src/app/game/sound.spec.ts` for final-asset playback behind the stable `Sound` interface
- `src/app/game/options-popup/**` and/or shared styles for the fill-slider target-size resolution
- `src/app/greeting/**` for approved R1 copy/photos
- `src/app/app.routes.ts`, `angular.json`, `package.json` and deployment documentation/config only as required by the approved hosting decision
- `e2e/**` for final asset, tie-screen axe, accessibility, storage/audio failure and base-path regression coverage
- New release/device evidence under a focused documentation/evidence location chosen by the Moderator or QA; do not place generated screenshots or recordings in production asset folders

---

## Reference Implementation

**Location:** `n/a`

**Disposition:** None - implement from scratch.

The prototype contains placeholder presentation intent but no candidate final SVG likeness art, final logo, final audio assets, production-host configuration or real-device evidence. Preserve the already approved DS behavior through the production architecture; do not port prototype runtime code.

---

## Acceptance Checks

- [ ] AC1: Every approved activity renders its assigned final SVG likeness art from edition content in both the board and large reveal; no placeholder "illustration" content remains in the release build.
- [ ] AC2: Final SVG assets preserve the 3:4 card composition without stretching, clipping important content or causing layout shift at the verified phone/tablet sizes.
- [ ] AC3: For variants on, each difference type remains apparent in the large reveal, orientation affects the illustration where approved, and every color difference includes a non-color pattern/accessory cue.
- [ ] AC4: Personal art and activity references remain under the edition-content/static-asset boundary; game/domain code contains no new likeness-specific branching or embedded personal asset data.
- [ ] AC5: The approved K-n-C logo is the identical back for every card and is used in the generic splash where specified; face-down/gone cards expose no face identity visually, in accessible names or in the accessibility tree.
- [ ] AC6: The approved final flip, match and win files replace generated placeholder tones behind the existing `Sound` service and `SoundCue` contract; the Sound toggle, preference and stable header test ID/state behavior do not regress.
- [ ] AC7: With Sound on, a valid flip requests only the flip cue, a match requests match, and completion requests win; Sound off requests no cues. Every cue retains its visible equivalent.
- [ ] AC8: On real iOS Safari, sound unlock is attempted from an eligible user gesture and final cues play when the platform permits. If context creation, resume, asset loading, decoding or playback fails, a game can still be completed with no uncaught error, blocked input or missing visual feedback.
- [ ] AC9: A phone and a tablet listening check at normal volume records device/browser, result and reviewer: flip is audible and not harsh, and flip/match/win are distinguishable.
- [ ] AC10: When the Product Owner supplies and approves R1 copy/photos, the permanent greeting route renders them accessibly, uses optimized static images where applicable and still links to the game. Until then, this check is explicitly blocked rather than filled with invented content.
- [ ] AC11: Rendered text, controls, focus indicators, final SVG cues and meaningful non-text boundaries meet WCAG 2.2 AA contrast requirements; evidence includes measured values or an equivalent repeatable method, not visual judgment alone.
- [ ] AC12: Every interactive control, including the fill-slider/range input and cards, has an effective pointer target of at least 44 by 44 CSS px; cards remain at least 52 px wide. D3 is resolved in code or documented with evidence that the effective target meets the requirement.
- [ ] AC13: Automated axe checks report zero undocumented findings for the greeting, splash, options (including fill), live board, reveal, confirm, single-player end, two-player winner and two-player tie states, with existing widened WCAG 2.2/best-practice coverage and no silent impact filtering.
- [ ] AC14: A real screen-reader smoke test records platform, browser and screen reader and verifies: splash skip; options labels/state; card face-down/up names; reveal title/hint and dismissal; confirm cancellation; end result; overlay focus entry/containment/return. No hidden face identity is announced from a face-down card.
- [ ] AC15: Keyboard-only operation completes the primary game flow using Tab/Shift-Tab, Enter, Space and Escape as specified, with visible focus and no focus loss or double activation across stacked overlays.
- [ ] AC16: Reduced-motion mode keeps all state changes understandable, effectively removes transitions/animations and shows no confetti; normal motion retains the approved flip/reveal/disappear behavior and end celebration.
- [ ] AC17: A real phone in portrait and landscape and a real tablet in portrait and landscape each render a 40-card game with 3:4 cards, no distorted final art, minimum card size, vertical scrolling only as fallback, and a readable large reveal. Evidence identifies devices, OS/browser and orientation.
- [ ] AC18: Rotating each real device preserves card order, IDs, face states, empty slots, active player, scores, attempts and timer; only wrapping changes. Incomplete final rows remain left-aligned.
- [ ] AC19: On Safari and Firefox normal modes, valid last-used options, Sound preference and single-player best score persist across reload as accepted in STEP-05.
- [ ] AC20: On Safari and Firefox private modes, storage either persists for the browser-defined private session or fails safely; unavailable/rejected reads or writes use in-memory behavior, surface no uncaught error and never prevent game completion.
- [ ] AC21: The stored options key remains `knc-memory.v1.options` with its accepted schema. If integration reveals a schema change is unavoidable, implementation stops for a new-key/migration decision rather than silently changing the value shape.
- [ ] AC22: Existing cancelled "Start over?" and storage-failure unit coverage passes. A committed browser e2e for either path is added only if needed to cover changed release code; otherwise the STEP-05 QA browser probe remains documented evidence and the omission is recorded as intentional.
- [ ] AC23: The Product Owner identifies the production site repository and exact game subfolder/base path before the final release build. The chosen value is represented once in build/deployment configuration or a documented release command.
- [ ] AC24: The production-style build loads the greeting, lazy game route, final SVG/logo/audio assets and refresh navigation correctly from the approved subfolder with no root-relative asset leak or console/network error.
- [ ] AC25: The real static host serves a direct refresh/deep link under `/kira-n-calvin-memory/game`; if it cannot, the Moderator/Product Owner explicitly choose and document hash routing or folder-root-only links, and automated/manual checks prove the selected behavior.
- [ ] AC26: `npm test -- --watch=false`, `npm run build`, `npm run build:subfolder`, `npm run build:dated-birthday` and `npm run test:e2e` pass under a compatible Node version, with no production budget warnings or unexpected skips.
- [ ] AC27: Final release verification preserves R21/R38 behavior: no birthday copy in gameplay or end screens, default versus dated-birthday splash behavior remains correct, and player selection is independent of cutoff/build mode.
- [ ] AC28: Dev Team implementation does not edit prototype files or the MOD-W records owned by Designer, QA, Tech Lead or Product Owner. Any Tech Lead review, QA evidence and Product Owner sign-off are separate gate records/commits.

---

## Test Expectations

- Unit/component tests map every theme and variant to a valid final asset, verify one shared back/logo, protect secondary cues, and keep asset-loading/audio failures non-fatal through fakes rather than audible playback.
- Automated accessibility tests retain the widened axe helper and add the two-player tie state. Component/e2e checks cover effective slider target dimensions, focus behavior and reduced motion.
- Browser e2e runs the accepted regression suite plus final-asset requests and a production-base-path smoke path. It must not replace real-device or real-screen-reader evidence.
- The device matrix records exact device, OS version, browser version, viewport/orientation, 40-card outcome, rotation outcome, audio outcome and storage outcome. At minimum it includes one phone and one tablet; iOS Safari audio is first priority, and Firefox plus Safari/private-mode storage are explicit rows.
- Screen-reader evidence records the tested screen reader/browser pairing, primary-flow steps, announcements/focus behavior and any limitation. Automated accessibility-tree snapshots alone do not satisfy AC14.
- Contrast evidence is recalculated against rendered final colors/assets. The prototype token table is an input, not sufficient evidence for changed production assets.
- Hosting evidence uses the selected production-equivalent server/host and verifies direct navigation plus refresh, asset URLs and lazy chunks beneath the approved base path.
- The full verification command set in AC26 is run after final assets and hosting configuration are integrated, not only before blocked inputs arrive.

---

## Plan

1. Confirm the supplied `resources/art` theme-to-file mapping and logo use without changing the source artwork. Product Owner supplies greeting copy/photos plus the production repository/base path; Designer supplies final sound assets. Confirm required device access, record unavailable inputs against the dependency table and continue independent work.
2. Baseline the existing release behavior and tests, then define a traceable asset manifest in edition content for ten themes, variants, shared logo/back and three sound cues without changing face identity or the `Sound` service interface.
3. Integrate approved SVG/card/logo/greeting assets and focused tests. Re-run contrast and variant-cue checks against the rendered production assets.
4. Replace generated tones with approved static sound playback behind `Sound`; preserve mute/persistence/error handling and add deterministic failure/loading tests.
5. Resolve the fill-slider effective target and extend automated accessibility coverage to the tie screen and any changed states. Run the full axe, keyboard, focus and reduced-motion regression set.
6. Execute the real screen-reader smoke test and real-device phone/tablet matrix, starting with iOS Safari audio unlock, then 40-card portrait/landscape/rotation and normal-volume listening.
7. Execute Safari and Firefox storage checks in normal and private modes, recording whether the browser persists for the session or exercises the in-memory fallback.
8. Resolve the repository/base-path/deep-link decision. Build and serve/deploy the production-subfolder artifact, verify direct refresh, lazy chunks and all final asset URLs, and implement only the approved routing fallback if required.
9. Run all AC26 commands after integration, assemble traceable release evidence for AC1-AC28, and hand off to Tech Lead review, QA and Product Owner acceptance. Do not tag in the Development Team or planning session.

---

## Change Notes

| Date | Change | Reason |
| ---- | ------ | ------ |
| 2026-10-11 | Initial STEP-06 planning draft. | Plan final content integration, accessibility/device evidence and production hosting hardening after STEP-05 completion. |
| 2026-10-11 | Recorded the supplied `resources/art` activity SVGs and logo as implementation inputs. | The files became visible after the initial planning inventory; they are inputs to validate and integrate, not open content to invent. |

---

## Review Notes

---

## QA Notes

---

MOD-W v5.0.1
