# STEP-06 - Content, Art, Device QA and Release Hardening

**Status:** Approved by Moderator for Development; external-input gates remain as named below
**Development Team interface:** Claude Code
**Step type:** Implementation and release verification

---

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the STEP-06 first SVG integration plan for Claude Code implementation. Use the supplied activity SVGs unchanged, render a filled circle for `base` and a filled star for `alternate`, and evaluate the result before any more elaborate SVG editing. This is an explicit first-integration limitation against the broader randomized color/pattern/accessory/orientation behavior in R28 and DS-009; do not claim that broader behavior as satisfied by this integration. The Designer-owned specification correction remains separate.

### Superseding Slot-Variant Handoff

- **Date:** 2026-10-12
- **Basis:** product baseline `8265eb3`; Designer revision `024bae8`; Moderator art-package approval `d899e8b`; Product Owner allow-list confirmation `7da2ee0`; Moderator confirmation approval `43cffb4`.
- **Decision:** The first-integration flat-SVG and fixed circle/star limitation above is historical and is superseded for all remaining STEP-06 work. Development implements the approved structured inline SVGs, uniform eligible-slot selection, approved treatments and alternate-only diamond medallion defined by DS-008/DS-009 and `architecture.md`. This revision changes no product requirement or visual design.
- **Moderator approval:** Approved 2026-10-12. Tech Lead commits `5719e9c` and `4d2fccf` authorize this revised STEP-06 handoff for Development. Named external gates remain in force; C2PA publication handling remains undecided.

---

## Goal

Replace the remaining placeholders with approved production content, prove the game on its target devices and assistive technology, and produce a release build whose subfolder routing, accessibility, storage and sound behavior are verified without weakening the accepted STEP-04 and STEP-05 flows.

The work is split into independently executable content integration, accessibility, device/browser and hosting workstreams. Missing external inputs block only their dependent checks while the Dev Team completes the rest. STEP-06 cannot pass its final gate until every required acceptance check has evidence or the Moderator explicitly changes the scope.

---

## Related Requirements

- R1 - The separate permanent birthday greeting page uses Product Owner-approved copy/photos and links to the game.
- R21 - The end screen keeps the approved result and celebration, including reduced-motion behavior and no birthday message.
- R27 - Card faces use final SVG illustrations that reflect each child's approved likeness and activity.
- R28 - Each dealt theme uniformly selects one eligible slot and its approved treatment once per game; every alternate copy uses it and Go/Restart reroll it.
- R29 - The alternate-only diamond medallion supplies the non-color cue on board and reveal, and leaves no trace on the shared back or in variants-off games.
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
| DS-009 | Slot treatments and variant cue | Uniformly select exactly one allow-listed slot per dealt theme, apply its approved treatment to every alternate copy, and render the alternate-only diamond medallion consistently on board and reveal. | R28, R29, R35 |
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

- Integrate the ten child-prefixed structured SVGs from `resources/art` through the edition-content boundary without editing the Designer/Moderator-owned source package. Preserve top-level paint order and select runtime groups by `data-slot`, never group ID or position.
- Create the validated `public/content/kira-calvin/edition.json` contract defined by `architecture.md`. It owns activity asset paths, structural slots/defaults, the confirmed DS-009 §3.9.1 allow-list and DS-009 §3.9.2 treatments. Keep engine code free of child names, activity filenames, slot names and palette values.
- Load, SVG-sanitize, explicitly trust and cache structured activity markup only through `ActivitySvgRepository`; render it inline in the shared card-face component so validated CSS custom properties can reach the SVG. Use `NgOptimizedImage` for applicable static logo/greeting assets, not the structured activity markup.
- At deal time, uniformly select one eligible slot/treatment per distinct dealt theme and store it in immutable `GamePresentation`. Both cards and every repeated copy of an alternate face use the same selection; base uses defaults; Go and Restart reroll. Preserve `{ themeId, variantId }` as the complete matching identity.
- Render the DS-009 diamond medallion only for visible alternate faces. Board and reveal share the same face presentation. Base, variants-off, face-down and gone cards have no medallion; a face-down/gone board card does not instantiate the front SVG, cue or slot/treatment/cue hook subtree.
- Integrate `resources/art/logo.svg` as the shared card back and generic-splash brand asset. The back must be identical for every card and must not reveal face identity visually or to assistive technology.
- Replace placeholder Web Audio tones with Designer-owned final flip, match and win assets while keeping the existing `Sound` service interface and cue names stable. Audio loading, decoding, autoplay/unlock and playback failures must not interrupt gameplay.
- Listen to the final cues on at least one phone and one tablet at normal volume. Verify that flip is audible but not harsh and that match/win cues are distinct.
- Put iOS Safari audio unlock first in the real-device matrix. Verify the first eligible user interaction enables later cues when Sound is on; if audio remains unavailable, verify non-fatal silent continuation through completion.
- Verify last-used options, sound preference and best-score storage on Safari and Firefox, including their private modes. When browser storage is rejected or unavailable, verify the existing in-memory fallback without changing the versioned `knc-memory.v1.options` schema.
- Complete the accessibility pass: rendered contrast against the final assets and surfaces, keyboard/focus behavior, the fill-slider target-size follow-up, automated axe coverage including the two-player tie screen, and a real screen-reader smoke test of the primary flow and overlays.
- Capture real-device layout evidence on a phone and tablet in portrait and landscape with 40 cards, including card ratio/minimum size, scroll fallback, order preservation on rotation, incomplete-row alignment, empty slots and large-reveal legibility.
- Confirm the production repository and base path. Verify the selected static host serves `/kira-n-calvin-memory/` and direct `/kira-n-calvin-memory/game` navigation/refresh, or obtain a Moderator/Product Owner decision to use hash routing or publish only folder-root links and test the chosen behavior.
- Integrate Product Owner-approved greeting copy and photos for R1 when supplied, keeping the greeting separate from the game state.
- Add focused automated regression coverage needed to protect final asset mapping, audio failure behavior, accessibility and production-base-path behavior. The cancelled "Start over?" no-save and storage-failure e2e paths are optional unless implementation changes make them necessary; existing unit coverage remains required.

### Open Dependencies and Gated Checks

| Dependency | Owner | Checks blocked until supplied/decided | Work that proceeds independently |
| ---------- | ----- | ------------------------------------- | -------------------------------- |
| Final flip, match and win sounds | Designer | AC10-AC13 final-audio integration/listening | Art, accessibility, storage and hosting checks |
| Greeting page copy and photos | Product Owner | AC14 greeting content approval | All game and hosting checks; existing greeting route remains intact |
| Production site repository and exact base path | Product Owner; Moderator chooses the routing fallback if deep-link support is unavailable | AC29-AC31 deployed/static-host checks and final release artifact | Local subfolder build and all non-host checks |
| Acceptance of removed C2PA blocks in the child-prefixed activity SVGs | Moderator | Publication approval only | Contract, implementation and QA; this decision does not block Development |

No placeholder may be presented as final evidence for an asset-dependent check. Record a blocked result against the exact dependency while continuing the other workstreams.

---

## Out of Scope

- Inventing likeness details, approving photos, designing the K-n-C logo, writing greeting copy or choosing final sounds on behalf of their owners.
- Editing the source SVGs or resource manifest; inventing new slots, treatments, palettes, cues, patterning, mirroring, movement, semantic layers or activity-specific accessories. Implement only the approved edition data and presentation treatment.
- The STEP-05 N2 follow-up for partial saved-options fallback after edition content changes. Record it in the roadmap for later edition work; do not implement it in STEP-06.
- Changing the storage schema or reusing `knc-memory.v1.options` for a different shape. Any necessary schema change requires a new versioned key or an explicit migration and a newly approved plan.
- New gameplay rules, new themes, more players, two-player best-score history, accounts, backend services or public-edition work.
- Changing the accepted birthday/player behavior, confirm semantics, scoring, timer or deck rules. The obsolete `data-difference` hook is removed and only the hooks named in `architecture.md` are added.
- Editing `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md`, `mod-w/product.md` or `mod-w/sign-off.md` during Dev Team implementation. The Designer owns the separate design-spec section 3.6 test-ID correction.

---

## Inputs

- `mod-w/product.md` (R1, R9, R12, R15, R21, R27-R31, R33-R36, R38; Assumptions, acceptance checks and Open Questions)
- `mod-w/design-spec.md` (section 2 accessibility baseline, section 2.2 contrast, DS-008, DS-009 §§3.9.1-3.9.5, DS-012, section 5.9 and traceability)
- `mod-w/architecture.md` (edition-content/assets boundary, static delivery, persistence/sound and accessibility evidence owners)
- `mod-w/domain-language.md` (Edition content, Face identity, Last-used options, Sound preference)
- `mod-w/roadmap.md` (STEP-06 and carry-forwards)
- `mod-w/step-05.md`, `mod-w/sign-off.md`, `mod-w/qa.md` and `mod-w/review.md` (accepted behavior, N-items, D3 and hosting follow-up)
- `resources/art/manifest.json`, `README.md`, `card-art-format.md`, the ten child-prefixed activity SVGs and `logo.svg`; README/format prose is stale and is not implementation authority where it conflicts with the approved product/design records
- Product Owner-approved greeting copy/photos, repository and production base path when available
- Designer-approved final flip, match and win sounds when available
- Existing implementation and automated suites under `src/**` and `e2e/**`

---

## Likely Affected Files

- `public/content/kira-calvin/**` for approved SVG, logo, sound and greeting assets
- `public/content/kira-calvin/edition.json` plus the child-prefixed structured SVG copies and other approved edition assets
- `src/app/content/edition.ts`, the edition loader/validator, selected-edition entry point and focused specs for the generic typed contract
- `src/app/game/card-face/**`, `src/app/game/board/**`, `src/app/game/pair-reveal/**`, `src/app/game/activity-svg-repository.ts` (or an equivalently focused service) and specs for inline art, treatment and medallion rendering
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

The prototype contains placeholder presentation intent but no implementation for the approved structured slot contract, inline-SVG trust boundary, final logo/audio assets, production-host configuration or real-device evidence. Preserve the approved DS behavior through the production architecture; do not port prototype runtime code or its retired difference types.

---

## Acceptance Checks

- [ ] AC1: Every approved activity renders its assigned child-prefixed structured SVG from validated edition content in both the board and large reveal; no placeholder illustration or former flat activity file remains in the release build.
- [ ] AC2: Final SVG assets preserve the 3:4 card composition without stretching, clipping important content or causing layout shift at the verified phone/tablet sizes.
- [ ] AC3: `edition.json` validates against the generic typed contract and every structured SVG: unique IDs, same-origin relative paths, square viewBox, exact slot/group/default-variable coverage, exact treatment-variable coverage and at least two eligible slots per activity. The reusable engine contains no Kira, Calvin, activity filename, slot-name or palette branching.
- [ ] AC4: With variants on, deal time selects exactly one eligible slot uniformly per distinct dealt theme and stores its approved treatment in `GamePresentation`. Both cards and all repeated copies of each face render identically; Go and Restart reroll. With variants off, no selection exists. Matching and persistence continue to use `FaceId { themeId, variantId }` without slot/treatment fields.
- [ ] AC5: Every base face uses manifest defaults. Every alternate face changes exactly its selected allow-listed slot, including all variables of a multi-variable slot; every non-variant group, other slot, outline and fixed detail remains unchanged. Excluded slots are never selected.
- [ ] AC6: Every visible alternate face has the approved diamond medallion in the specified board/reveal position and size. Base faces and variants-off games have none. Down/gone board cards instantiate no front SVG, medallion, slot/treatment/cue hooks or accessible front content; every card still uses the identical K-n-C logo back.
- [ ] AC7: The shared card-face implementation preserves `board-card-button-{index}`, `data-state` and `data-variant`; removes `data-difference`; and exposes `data-variant-slot`, `data-treatment-id` and `data-cue-present` only on the visible face root with the semantics in `architecture.md`. The hooks do not alter visible or accessible output.
- [ ] AC8: Inline SVG is accepted only from validated same-origin edition paths, parsed and sanitized with the approved SVG allow-list, cached after sanitization, and passed through Angular explicit trust only inside `ActivitySvgRepository`. Tests reject scripts, event attributes, `foreignObject`, external references, undeclared variables and malformed/mismatched SVGs. No component calls a bypass API.
- [ ] AC9: The approved K-n-C logo is used in the generic splash where specified. Applicable static images use `NgOptimizedImage`; structured inline activity SVGs and no assets use inline base64.
- [ ] AC10: The approved final flip, match and win files replace generated placeholder tones behind the existing `Sound` service and `SoundCue` contract; the Sound toggle, preference and stable header test ID/state behavior do not regress.
- [ ] AC11: With Sound on, a valid flip requests only the flip cue, a match requests match, and completion requests win; Sound off requests no cues. Every cue retains its visible equivalent.
- [ ] AC12: On real iOS Safari, sound unlock is attempted from an eligible user gesture and final cues play when the platform permits. If context creation, resume, asset loading, decoding or playback fails, a game can still be completed with no uncaught error, blocked input or missing visual feedback.
- [ ] AC13: A phone and a tablet listening check at normal volume records device/browser, result and reviewer: flip is audible and not harsh, and flip/match/win are distinguishable.
- [ ] AC14: When the Product Owner supplies and approves R1 copy/photos, the permanent greeting route renders them accessibly, uses optimized static images where applicable and still links to the game. Until then, this check is explicitly blocked rather than filled with invented content.
- [ ] AC15: DS-009 §3.9.4 passes for every eligible default/treatment combination at 52 × 69 px, representative fitted boards through 40 cards and reveal size: exact-one-slot integrity, required region dimensions/delta/contrast, normal color and protanopia/deuteranopia/tritanopia/achromatopsia simulations, two unfamiliar reviewers, board/reveal fidelity and repeated-copy consistency. Give the included Drones `drone` slot particular attention as the thinnest included slot.
- [ ] AC16: A rejected slot is removed from edition content without weighting the remaining eligible slots. If an activity would have fewer than two eligible slots, implementation stops for Product Owner and Designer review.
- [ ] AC17: Rendered text, controls, focus indicators, final SVG treatments/cues and meaningful non-text boundaries meet WCAG 2.2 AA contrast requirements; evidence includes measured values or an equivalent repeatable method, not visual judgment alone.
- [ ] AC18: Every interactive control, including the fill-slider/range input and cards, has an effective pointer target of at least 44 by 44 CSS px; cards remain at least 52 px wide. D3 is resolved in code or documented with evidence that the effective target meets the requirement.
- [ ] AC19: Automated axe checks report zero undocumented findings for the greeting, splash, options (including fill), live board, reveal, confirm, single-player end, two-player winner and two-player tie states, with existing widened WCAG 2.2/best-practice coverage and no silent impact filtering.
- [ ] AC20: A real screen-reader smoke test records platform, browser and screen reader and verifies: splash skip; options labels/state; card face-down/up names; reveal title/hint and dismissal; confirm cancellation; end result; overlay focus entry/containment/return. No hidden face identity, front subtree or variant cue is announced from a face-down card.
- [ ] AC21: Keyboard-only operation completes the primary game flow using Tab/Shift-Tab, Enter, Space and Escape as specified, with visible focus and no focus loss or double activation across stacked overlays.
- [ ] AC22: Reduced-motion mode keeps all state changes understandable, effectively removes transitions/animations and shows no confetti; normal motion retains the approved flip/reveal/disappear behavior and end celebration. The static diamond medallion remains present for visible alternate faces in both modes.
- [ ] AC23: A real phone in portrait and landscape and a real tablet in portrait and landscape each render a 40-card game with 3:4 cards, no distorted final art, minimum card size, vertical scrolling only as fallback, and a readable large reveal. Evidence identifies devices, OS/browser and orientation.
- [ ] AC24: Rotating each real device preserves card order, IDs, face states, empty slots, selected theme presentations, active player, scores, attempts and timer; only wrapping changes. Incomplete final rows remain left-aligned.
- [ ] AC25: On Safari and Firefox normal modes, valid last-used options, Sound preference and single-player best score persist across reload as accepted in STEP-05.
- [ ] AC26: On Safari and Firefox private modes, storage either persists for the browser-defined private session or fails safely; unavailable/rejected reads or writes use in-memory behavior, surface no uncaught error and never prevent game completion.
- [ ] AC27: The stored options key remains `knc-memory.v1.options` with its accepted schema. Per-game slot/treatment selections are not stored in options or best-score keys. If integration reveals a schema change is unavoidable, implementation stops for a new-key/migration decision rather than silently changing the value shape.
- [ ] AC28: Existing cancelled "Start over?" and storage-failure unit coverage passes. A committed browser e2e for either path is added only if needed to cover changed release code; otherwise the STEP-05 QA browser probe remains documented evidence and the omission is recorded as intentional.
- [ ] AC29: The Product Owner identifies the production site repository and exact game subfolder/base path before the final release build. The chosen value is represented once in build/deployment configuration or a documented release command.
- [ ] AC30: The production-style build loads the greeting, lazy game route, edition contract, child-prefixed structured SVG/logo/audio assets and refresh navigation correctly from the approved subfolder with no root-relative asset leak or console/network error.
- [ ] AC31: The real static host serves a direct refresh/deep link under `/kira-n-calvin-memory/game`; if it cannot, the Moderator/Product Owner explicitly choose and document hash routing or folder-root-only links, and automated/manual checks prove the selected behavior.
- [ ] AC32: `npm test -- --watch=false`, `npm run build`, `npm run build:subfolder`, `npm run build:dated-birthday` and `npm run test:e2e` pass under a compatible Node version, with no production budget warnings or unexpected skips.
- [ ] AC33: Final release verification preserves R21/R38 behavior: no birthday copy in gameplay or end screens, default versus dated-birthday splash behavior remains correct, and player selection is independent of cutoff/build mode.
- [ ] AC34: Dev Team implementation does not edit prototype files or the MOD-W records owned by Designer, QA, Tech Lead or Product Owner. Any Tech Lead review, QA evidence and Product Owner sign-off are separate gate records/commits.

---

## Test Expectations

- Unit/component tests validate every edition activity/slot/treatment, prove both domain variants share the same sanitized SVG, prove uniform selection with deterministic random boundary cases, assert exact-one-slot custom properties and repeated-copy consistency, verify diamond-medallion conditions and one shared back/logo, and keep asset-loading/audio failures non-fatal through fakes rather than audible playback.
- Sanitizer tests use hostile fixtures and mutation-sensitive assertions: removing rejection of scripts, event attributes, external references, undeclared CSS variables or contract mismatches must fail a test. Assert explicit Angular trust is called only with sanitizer output and that concurrent requests for one asset share a cached result.
- Component/e2e hooks use `data-variant-slot`, `data-treatment-id` and `data-cue-present` on the visible face root; `data-difference` must not exist. Face-down/gone assertions query the DOM and accessibility snapshot for absence of the front SVG, medallion and all three presentation hooks.
- Automated accessibility tests retain the widened axe helper and add the two-player tie state. Component/e2e checks cover effective slider target dimensions, focus behavior and reduced motion.
- Browser e2e runs the accepted regression suite plus final-asset requests and a production-base-path smoke path. It must not replace real-device or real-screen-reader evidence.
- The device matrix records exact device, OS version, browser version, viewport/orientation, 40-card outcome, rotation outcome, audio outcome and storage outcome. At minimum it includes one phone and one tablet; iOS Safari audio is first priority, and Firefox plus Safari/private-mode storage are explicit rows.
- Screen-reader evidence records the tested screen reader/browser pairing, primary-flow steps, announcements/focus behavior and any limitation. Automated accessibility-tree snapshots alone do not satisfy AC20.
- Contrast evidence is recalculated against rendered final colors/assets. The prototype token table is an input, not sufficient evidence for changed production assets.
- Hosting evidence uses the selected production-equivalent server/host and verifies direct navigation plus refresh, asset URLs and lazy chunks beneath the approved base path.
- The full verification command set in AC32 is run after final assets and hosting configuration are integrated, not only before blocked inputs arrive.

---

## Plan

1. Confirm the child-prefixed resource files, structural manifest and DS-009 allow-list/treatments without changing those owned records. Product Owner supplies greeting copy/photos plus the production repository/base path; Designer supplies final sound assets. Record unavailable inputs against the dependency table and continue independent work.
2. Implement the generic edition types and unknown-to-validated loader, then create `public/content/kira-calvin/edition.json` and a build/test cross-validator against all ten SVGs. Keep `FaceId` and storage schemas unchanged.
3. Implement `ActivitySvgRepository`: same-origin path enforcement, strict SVG parsing/sanitization, the sole Angular trust call, request/result caching and hostile-fixture tests.
4. Add deal-time `GamePresentation` selection with deterministic random tests, then render validated CSS properties and the diamond medallion through the shared board/reveal card-face component. Remove `data-difference`; add the canonical visible-face hooks and prove the complete front subtree is absent face down/gone.
5. Execute the full DS-009 §3.9.4 matrix, including exact-one-slot and repeated-copy checks, all named color-vision simulations, two unfamiliar reviewers and focused scrutiny of Drones `drone`. Route any slot removal through the approved no-reweight/fewer-than-two rule.
6. Integrate the static logo/greeting assets with `NgOptimizedImage` where applicable and re-run contrast checks. Replace generated tones with approved static sound playback behind `Sound`; preserve mute/persistence/error handling and add deterministic failure/loading tests.
7. Resolve the fill-slider effective target and extend automated accessibility coverage to the tie screen and changed face states. Run the full axe, keyboard, focus, face-down accessibility-tree and reduced-motion regression set.
8. Execute the real screen-reader smoke test and real-device phone/tablet matrix, starting with iOS Safari audio unlock, then 40-card portrait/landscape/rotation and normal-volume listening.
9. Execute Safari and Firefox storage checks in normal and private modes, recording whether the browser persists for the session or exercises the in-memory fallback.
10. Resolve the repository/base-path/deep-link decision. Build and serve/deploy the production-subfolder artifact, verify direct refresh, lazy chunks, edition JSON and all final asset URLs, and implement only the approved routing fallback if required.
11. Run all AC32 commands after integration, assemble traceable release evidence for AC1-AC34, and hand off to Tech Lead review, QA and Product Owner acceptance. Do not tag in the Development Team or planning session.

---

## Change Notes

| Date | Change | Reason |
| ---- | ------ | ------ |
| 2026-10-11 | Initial STEP-06 planning draft. | Plan final content integration, accessibility/device evidence and production hosting hardening after STEP-05 completion. |
| 2026-10-11 | Recorded the supplied `resources/art` activity SVGs and logo as implementation inputs. | The files became visible after the initial planning inventory; they are inputs to validate and integrate, not open content to invent. |
| 2026-10-11 | Moderator approved the first SVG integration: unchanged activity art with filled-circle `base` and filled-star `alternate` cues. | Evaluate the supplied art in the production card composition before undertaking more elaborate SVG edits; explicitly do not claim broader R28/DS-009 behavior. |
| 2026-10-12 | Superseded the first-integration limitation with the approved structured slot-based package, edition contract, trusted inline-SVG boundary, uniform per-theme selection, diamond medallion, canonical hooks and DS-009 QA gate. | Align STEP-06 with approved inputs `8265eb3`, `024bae8`, `d899e8b`, `7da2ee0` and `43cffb4` without changing product or visual decisions. |
| 2026-10-12 | Recorded Moderator approval of the Tech Lead slot-variant architecture, terminology, roadmap and revised STEP-06 handoff. | Authorize Development against commits `5719e9c` and `4d2fccf`; retain named external gates and the separate C2PA publication decision. |

---

## Review Notes

---

## QA Notes

---

MOD-W v5.0.1
