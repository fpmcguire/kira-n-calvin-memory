# Architecture - Kira-n-Calvin Memory Game

**Date:** 2026-10-12
**Tech Lead:** Codex
**Status:** Revised for the approved slot-based variant design; ready for Development

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved Tech Lead architecture handoff work for STEP-01 planning.

## Slot-Variant Revision Record

- **Date:** 2026-10-12
- **Approved inputs:** product baseline `8265eb3`; Designer revision `024bae8`; Moderator art-package approval `d899e8b`; Product Owner allow-list confirmation `7da2ee0`; Moderator confirmation approval `43cffb4`.
- **Decision:** The typed edition contract, trusted inline-SVG boundary, deal-time presentation selection, diamond-medallion ownership and test hooks below supersede the former flat-asset and fixed circle/star integration plan. Product requirements and visual treatment are unchanged.

## Stack and Delivery

- Angular 22 project, satisfying the Angular 21+ constraint (R34). Use standalone components without explicit `standalone: true`.
- Static build only: no backend, no server state, no accounts, no remote API calls.
- Host under a subfolder of `kira-n-calvin.com`; the exact base href and folder name remain a Product Owner/site-repo question (R34).
- Use Angular signals for game, options and UI state. Use RxJS only where Angular platform APIs require it.
- Use Vitest/Angular unit tests for domain logic and component behavior. Use browser-based accessibility and layout checks for WCAG evidence.

## Application Boundaries

- `src/app/greeting/`: separate birthday greeting route/page for R1. It links to the game but is not part of the game state machine.
- `src/app/game/`: production game shell, overlays, board, cards and header.
- `src/app/domain/`: pure TypeScript rules for options, cutoff, deck building, matching, scoring and game-progress checks.
- `src/app/content/`: generic TypeScript contracts, edition loading/validation and the selected edition entry point. The engine consumes only validated `EditionContent`; it does not import gift-edition constants from presentation components (R35).
- `public/content/kira-calvin/`: one self-contained edition package: `edition.json`, the ten structured activity SVGs, logo and other static assets. `edition.json` is the runtime source of truth for activity-to-file mapping, declared SVG slots/defaults, the confirmed eligible-slot allow-list and each slot's approved alternate treatment. `resources/art/manifest.json` remains the source-package structural inventory; Development copies and augments that information into `edition.json` rather than changing the Designer/Moderator-owned resource package.
- A different edition can replace the directory and entry URL without engine changes. No reusable engine or presentation file may hard-code child names, activity filenames, slot names, treatment colors or edition palettes.

## Data Model

- `ChildId`: `kira | calvin`.
- `ThemeId`: one ID per approved activity.
- `VariantId`: `base | alternate`.
- `FaceId`: `{ themeId, variantId }`; two cards match only when both fields match (R12).
- `Card`: `{ id, faceId, state }`, where state is `down | up | gone | peeked`.
- `GameOptions`: player count, variants flag, fill flag, fill card count and selected themes.
- `CssVariableName`: a validated CSS custom-property name beginning `--`; it is opaque to the engine.
- `ArtSlot`: `{ id, groups, defaults }`, where `defaults` maps declared CSS variables to their manifest colors. Group IDs exist for package validation only and are never runtime selectors.
- `EligibleSlotTreatment`: `{ slotId, treatmentId, properties }`. `properties` must cover exactly the variables declared by that slot. There is exactly one approved treatment record for each eligible slot in this edition; excluded slots have none.
- `ActivityArtContent`: `{ assetPath, viewBox, slots, eligibleSlotTreatments }`. `eligibleSlotTreatments` is the confirmed allow-list and must contain at least two entries.
- `EditionContent`: schema version, children, brand, cutoff record, themes and their `ActivityArtContent`. It owns personal likeness/activity data and all edition palettes; domain rules do not.
- `ThemePresentation`: `{ slotId, treatmentId, properties, cueId: 'diamond-medallion' }`, selected once for each dealt theme when variants are on.
- `GamePresentation`: a theme-keyed map of `ThemePresentation`. It belongs to the live game record but is presentation data, not match identity and not persisted as an option or score key.

## State Model

Use one top-level signal-backed state with explicit sub-states:

- `splash`: birthday or generic, derived from the build-time `permanentBirthday` flag or, in the `dated-birthday` build, from the data-driven cutoff (R2, R38).
- `options`: a non-destructive overlay with `draftOptions` and optional `returnTo`.
- `play`: live game record with deck, scores, turn, timer, flipped indices and turn state.
- `end`: completed game record and result.

Transient overlays are modeled as stackable UI state: `options`, `confirm`, `reveal`, `end`. The options popup is an overlay over a preserved live or completed game, not a replacement for the game record (R37, DS-025, DS-026). Opening it pauses the single-player timer by recording a pause instant; closing shifts elapsed time so the live timer resumes unchanged.

Header New Game and Restart stay disabled while input is locked, during a reveal, or during Show All. This follows the prototype and avoids pending transition conflicts under the options popup.

## Domain Rules

Deck building is a pure function:

1. Build available pair identities from selected themes and variants (R9).
2. Without fill, use all available pair identities.
3. With fill and enough supply, randomly choose themes and include both variant pair identities for a chosen theme when variants are on until the exact pair count is met (R10).
4. With fill and insufficient supply, repeat the full pair-identity supply round-robin, then choose a shuffled remainder so no pair identity appears more than one extra time than another (R11).
5. Double each pair identity into two cards and shuffle cards.

The R10 wording is theme-oriented while R12 is face-oriented. Production tests will enforce whole pairs and repeated face identity matching; if Product Owner wants remainder balancing by theme rather than pair identity, that is a product clarification before Step 03.

## Edition Art Contract and Validation (R27, R28, R35)

Load `public/content/kira-calvin/edition.json` as `unknown` before a game can be dealt, validate it at the content boundary, and expose an immutable `EditionContent`. Invalid content fails the edition load with a controlled error; it must never be passed to the sanitizer or partially interpreted by the engine.

Validation must prove:

- unique theme, slot and treatment IDs; relative same-origin asset paths only; the declared square `viewBox`;
- every eligible slot exists in the activity's declared slots, has exactly one approved treatment, and each treatment supplies exactly the slot's declared CSS variables with valid CSS color values;
- at least two eligible slots per activity; a QA removal that would leave fewer than two is not published and returns to the Product Owner and Designer;
- no engine-known child name, filename, slot name or palette value is required to interpret the record.

The Development Team should add a build/test validator that cross-checks `edition.json` against each SVG's `data-group`, `data-slot` and CSS-variable usage. Runtime rendering selects groups by `data-slot`, never by group ID or DOM position, and never reorders or reparents the SVG's paint-order groups.

## Inline SVG Rendering and Trust Boundary

Activity art is structured presentation markup, not an `<img>` resource: CSS custom properties cannot recolor an SVG loaded through `<img>`. The shared `card-face` presentation therefore renders the activity SVG inline for both the board and reveal.

Use one root-provided, single-responsibility `ActivitySvgRepository` service. It accepts only validated edition asset paths, fetches them from the same origin, deduplicates concurrent requests, and caches the sanitized immutable result by asset path. It must:

1. Parse with `DOMParser` as `image/svg+xml` and reject parse errors, non-`svg` roots, a mismatched `viewBox`, or package metadata that disagrees with the validated edition contract.
2. Sanitize with an SVG-aware allow-list sanitizer (for example DOMPurify's SVG profile) configured to reject `script`, `foreignObject`, `iframe`, `object`, `embed`, `style`, `metadata`, animation elements, event-handler attributes, external URLs/references and unsafe CSS. Only the package contract's elements/attributes and inline `fill:var(--declared-name,#hex)` form are permitted.
3. Call Angular `DomSanitizer.bypassSecurityTrustHtml` only inside this service, only after steps 1-2 succeed. Components never accept arbitrary markup, never call a bypass API, and never compose trusted HTML from slot/treatment values.
4. Apply validated treatment CSS custom properties to the card-face art wrapper (custom properties inherit into the inline SVG). Do not rewrite SVG markup per card. The base face applies none and therefore uses manifest defaults.

The cached trusted markup is safe to reuse; each card supplies only validated custom-property values. A load or validation failure shows a non-identifying presentation fallback and records an error without weakening the shared face-down back.

This is a narrow exception to the repository rule to use `NgOptimizedImage` for static images. Inline activity SVGs are structured, dynamically treated markup and cannot satisfy R28 through `<img>`. Continue to use `NgOptimizedImage` for static image resources such as the logo, greeting photos and any non-structured illustration. Inline base64 remains prohibited.

## Deal-Time Presentation Selection (R9, R12, R28)

After deck pair identities are chosen, create `GamePresentation` once per distinct dealt theme when variants are on:

1. Read that theme's `eligibleSlotTreatments` from the validated edition.
2. Select an index uniformly with the injected game random source. No entry is preferred or weighted.
3. Store the complete immutable `ThemePresentation` in the live game record and render every alternate face for that theme from it. Base faces always use manifest defaults.

Both cards of a face and all repeated copies read the same theme selection. Go and Restart build a new `GamePresentation`; flips, reveal, resize, Show All and rerender do not. Variants-off games create no theme selections. `FaceId` remains exactly `{ themeId, variantId }`; selection data never enters matching, card IDs, persistence keys or score keys.

## Variant Cue and Test Hooks (R29, R30)

The shared card-face component owns the Designer-approved diamond medallion. It is conditionally created only for a visible `alternate` face in a variants-on game, and the board and reveal use the same component/presentation input. Base faces and variants-off games create no cue.

When a card is `down` or `gone`, do not instantiate the front presentation subtree: no activity SVG, medallion, slot/treatment hooks, cue hook, accessible text or hidden placeholder remains in the DOM or accessibility tree. This is stricter than merely hiding the front with CSS. The shared back is a separate subtree and receives no presentation inputs. During a flip back, remove the front subtree when the approved transition completes; reduced motion removes it immediately.

Canonical test hooks are:

- card button: `data-testid="board-card-button-{index}"`, `data-state="down|up|peeked|gone"`, `data-variant="base|alternate"`;
- visible face root only: `data-variant-slot="{slotId}"` and `data-treatment-id="{treatmentId}"` on alternate faces; both attributes are absent on base faces;
- visible face root only: `data-cue-present="true"` on alternate faces and `data-cue-present="false"` on base faces. The medallion itself is decorative and `aria-hidden="true"`.

The reveal uses the same visible-face hook semantics. Retire `data-difference` completely. Hooks are test-only state and must not change visible output, accessible names or the accessibility tree; because the visible-face root does not exist face down, the selected slot, treatment and cue hooks cannot leak onto the back.

## Cutoff and Time

The cutoff is content data: `{ localDateTime: "2026-10-11T00:00", timeZone: "America/Denver" }` (R3). Since 2026-10-11 it holds no player. A clock service/function supplies `now`, making both sides of the cutoff testable. The production comparison may use platform `Intl` time-zone support; if browser support proves weak, add a small time-zone utility rather than hard-coding the UTC instant.

The cutoff affects the splash only, and only in the `dated-birthday` build. Players come from `GameOptions.players`, the checked Kira and Calvin boxes: `assignPlayers(selected, children, random)` in `src/app/domain/players.ts` returns single-player for one child and two-player with a random first player for both, rolled on each Go and Restart (R4, DS-020). `canGo` needs at least one player and one theme; `cardCount` depends on themes only, so the preview board does not change with players.

## Build-Time Feature Flags (R38)

- `src/app/config/feature-flags.ts` exports `FEATURE_FLAGS.permanentBirthday`, default `true`. It is the default build.
- `angular.json` configuration `dated-birthday` replaces that file with `src/app/config/feature-flags.dated.ts`, which sets the flag to `false`. Build with `npm run build:dated-birthday` (`ng build --configuration production,dated-birthday`).
- The flag is read once, in `GameState.birthdaySplash`, through the pure helper `showsBirthdaySplash(now, cutoff, permanent)` in `src/app/domain/cutoff.ts`. The domain does not import the config.
- The flag changes the splash only. Player assignment reads neither the flag nor the cutoff.
- Test coverage: unit tests for the pure helper run in both modes. Component tests that depend on the build flag use `it.skipIf`. Browser tests in `e2e/cutoff.spec.ts` use `test.skip` on the same flag, and they run only against the default build. Running the browser suite against the dated build is not wired up.

## Device Persistence and Sound

STEP-05 adds client-only persistence for R36. Store only non-sensitive game preferences and scores in browser storage:

- Last-used options: `GameOptions`, including `players` as an array of child IDs, `variants`, `fill`, `fillCount` and selected `themes`.
- Best scores: single-player only, keyed by player, card count and variants on/off, matching DS-024. Store attempts as the primary score and optionally the elapsed time as supporting display data. Do not store two-player results unless a later Product Owner decision changes DS-016.
- Sound preference: boolean on/off state for the header sound toggle.

Persistence belongs behind a small game storage service/helper that validates parsed data before using it. If stored data is absent, malformed, stale, or references unknown players/themes, fall back to current defaults rather than blocking game startup. Storage failures, including private-mode quota/security errors, must degrade silently to in-memory behavior.

Sound feedback for STEP-05 should use a small, injectable sound service. Placeholder tones generated through Web Audio are acceptable until final sound assets arrive in STEP-06. The service respects the persisted sound preference and never becomes the only feedback channel: flip, match and win already have visible state changes. Tests should use a stub/fake sound service rather than real audio playback.

## Accessibility and Testing

WCAG 2.2 AA is a baseline, not a polish pass. Each overlay must move focus in, trap focus while open, and restore focus on close. Enter and Space are handled by the focused control where possible; page-level handlers must not double-fire when the target is a button, addressing OBS-012.

Evidence owners:

- Step 01: greeting page accessibility, link behavior and axe pass.
- Step 02: shell/options/splash focus, keyboard and axe pass.
- Step 03: deck-building unit-test matrix for R9-R12.
- Step 04: board/reveal keyboard, focus and reduced-motion behavior.
- Step 05: storage behavior, best-score display, persisted sound preference and stubbed sound cue calls. Timer, popup return and confirm already have STEP-04 evidence.
- Step 06: real-device or browser-matrix layout evidence, rendered contrast checks and screen-reader smoke tests.

For the slot-based art handoff, QA additionally owns the DS-009 §3.9.4 matrix: every eligible default/treatment combination at minimum board size, representative boards through 40 cards and reveal size; exact-one-slot integrity; unchanged non-variant/other-slot content; normal and simulated protanopia, deuteranopia, tritanopia and achromatopsia/grayscale review; two unfamiliar reviewers; identical board/reveal presentation; repeated-copy consistency; variants-off absence; and face-down DOM/accessibility absence. Give special attention to the included Drones `drone` slot because it is the thinnest included slot. A rejected slot is removed without weighting the remainder; fewer than two remaining eligible slots returns the activity to the Product Owner and Designer.

## Decisions That Diverge From Prototype

- The greeting page is built first and separately because R1 is the earliest Must-have and is not prototyped.
- Personal content moves out of the engine into typed static content and asset files; the prototype keeps theme and child data inline.
- Deck building becomes pure domain logic with exhaustive tests before full game UI, rather than embedded in the page object.
- The options popup is modeled as an overlay over a preserved game record; the prototype approximates this with `phase` plus `returnTo`.
- Card face rendering is a shared Angular presentation component for grid and reveal; the prototype duplicates markup.
- Structured activity art is sanitized and rendered inline so approved CSS-variable treatments work. `NgOptimizedImage` remains required for applicable static image resources; inline base64 images are disallowed.
- Confetti should run finitely or be cheap to disable, rather than looping indefinitely by default.
- Runtime tweak controls such as `cutoffMode` and `matchPauseMs` are test/dev fixtures only, not product UI.

## Open Architecture Questions

- Which repository and subfolder serve the greeting page and game?
- What exact greeting page copy/assets are approved for R1?
- Are likenesses based on real photos or described traits?
- What is the final K-n-C logo asset path and format?
- Should R11 remainder balancing be defined by pair identity or by theme when variants are on?
- Which real devices/browsers are required for layout and screen-reader evidence?

