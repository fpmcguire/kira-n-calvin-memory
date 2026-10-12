# Roadmap - Kira-n-Calvin Memory Game

**Date:** 2026-10-12
**Tech Lead:** Codex
**Status:** Approved by Moderator for Development

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved Tech Lead roadmap and STEP-01 sequencing.

## Slot-Variant Revision Record

- **Date:** 2026-10-12
- **Approved inputs:** product baseline `8265eb3`; Designer revision `024bae8`; Moderator art-package approval `d899e8b`; Product Owner allow-list confirmation `7da2ee0`; Moderator confirmation approval `43cffb4`.
- **Decision:** STEP-06 now implements the structured slot-based activity package. This supersedes the former flat-SVG and fixed circle/star first-integration plan without reopening product requirements or visual design. Technical details and acceptance checks are authoritative in `architecture.md`, `domain-language.md` and `step-06.md` at commit `5719e9c`.
- **Moderator approval:** Approved 2026-10-12, including Tech Lead roadmap commit `4d2fccf`. STEP-06 may proceed to Development while named external and publication gates remain with their owners.

## Sequencing Decision

R1 is the earliest Must-have and is not designed. Ship the greeting page first as a small static Angular route/page that follows the site folder-per-occasion pattern and links to the game route. The game follows in incremental slices, beginning with shell/options and pure domain rules before full play.

## Step Status

| Step | Status                | Date       | Notes                                                                                                                                                                                                                                                   |
| ---- | --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01   | Approved by Moderator | 2026-10-10 | Greeting route, game placeholder and static base-path assumptions accepted with follow-ups in `review.md`.                                                                                                                                              |
| 02   | Approved by Moderator | 2026-10-10 | Game shell, splash, options draft flow, Playwright e2e and axe coverage. QA: Pass with notes (`qa.md`). Product Owner: Accepted with notes (`sign-off.md`). D1, D2 and D4 deferred to STEP-04, D3 deferred to STEP-06; clock-pinned e2e assigned to STEP-04. |
| 03   | Approved by Moderator | 2026-10-10 | Tech Lead plan for Domain Engine and Deck Rules approved for Development Team implementation. |
| 04   | Completed             | 2026-10-11 | Completed and tagged `step-04-completed`. Play loop, responsive board, reveal/end flow, Restart/New Game flow, STEP-02 carry-forwards, and the approved post-STEP-04 birthday/player changes are accepted. |
| 05   | Completed                                     | 2026-10-11 | Completed and tagged `step-05-complete`. Implementation `b1ce86c`, Tech Lead Pass `628c6a3`, QA Pass with notes `1fce1ac`, Product Owner Accepted with notes `67fb161` (`sign-off.md`). |
| 06   | Slot-variant implementation approved by Moderator for Tech Lead review | 2026-10-12 | Approved structured slot-based SVG direction is fully specified: edition-owned allow-list/treatments, trusted inline rendering, uniform per-theme deal selection, alternate-only diamond medallion and DS-009 QA gate. Implemented by the Development Team in `40a7686` and approved by the Moderator for Tech Lead review. External gates remain for sounds, greeting content, production hosting coordinates and the non-blocking C2PA publication decision. |

## Steps

| Step | Title                                         | Scope                                                                                                                    | R-IDs                               | DS-IDs                                                | Evidence owner                                                  |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| 01   | Greeting Page and Static Hosting Shape        | Build the separate birthday greeting page, route/link to game placeholder, and document base-href/subfolder assumptions. | R1, R34                             | None; design-spec section 4.7 notes not designed      | Greeting accessibility/link checks                              |
| 02   | Game Shell, Splash and Options Draft          | Angular shell, splash cutoff branch, header skeleton, preview board, options popup, draft/reset/go states.               | R2-R8, R19, R20, R24, R30, R33, R37 | DS-001-DS-011, DS-019, DS-020, DS-023, DS-025, DS-026 | Axe, keyboard/focus, cutoff unit tests                          |
| 03   | Domain Engine and Deck Rules                  | Pure game options, cutoff, deck-building and matching rules with exhaustive tests.                                       | R3, R4, R9-R12, R28, R35            | DS-009, DS-020                                        | Unit-test matrix for every themes x variants x fill combination |
| 04   | Play Loop, Board and Reveal                   | Responsive board, card states, selection, match/mismatch reveal, empty slots, Show All, animations/reduced motion, STEP-02 post-Go axe carry-forwards. | R12-R18, R26, R29, R32, R33         | DS-007-DS-015, DS-022, DS-023, DS-026                 | Component tests, browser layout checks, post-Go axe and clock-pinned e2e |
| 05   | Persistence and Sound Feedback                | Remember last-used options, single-player best scores and sound preference; wire the sound toggle to flip/match/win feedback. STEP-04 already implemented end results, Restart/New Game, confirms and timer/popup return. | R31, R36, R4, R6, R7, R21           | DS-006, DS-016, DS-021, DS-024                         | Storage unit/component tests and focused e2e persistence checks |
| 06   | Content, Art, Device QA and Release Hardening | Integrate the validated edition contract and structured inline SVGs; select one eligible slot/treatment uniformly per dealt theme; render the alternate-only diamond medallion; integrate final logo/sounds/greeting content; complete DS-009, accessibility, device/browser and production-base-path verification. | R1, R9, R12, R15, R21, R27-R31, R33-R36, R38 | DS-001-DS-026, especially DS-008, DS-009, DS-012 | Dev Team: implementation and automated/release evidence; QA: DS-009 treatment matrix plus independent device/browser/accessibility verification; Designer/Product Owner/Moderator: named external inputs and gates |

## Carry-Forward Notes

- **2026-10-11 scope change (STEP-04 N7 resolved):** birthday screens are permanent (R38). The default build shows the birthday splash on every visit, behind the build-time flag `permanentBirthday`. The `dated-birthday` build (`npm run build:dated-birthday`) restores the cutoff rule for the splash. STEP-05 persistence planning must treat the splash as flag-based and must not make player or storage behavior date-driven.
- **2026-10-11 scope change (player checkboxes):** the Two players checkbox is replaced by Kira and Calvin checkboxes (R4, R6, R7, DS-020). Players no longer depend on the cutoff. Implemented directly by the Product Owner at the Moderator's direction, bypassing the Dev Team; the Moderator approved the Tech Lead review plus QA/PO gates for this situation only. STEP-05 R36 persistence must remember `players` (an array of children) instead of `twoPlayers`.

- Closed by STEP-04: D1 from STEP-02, the post-Go shell axe failure, is fixed with focusable real cards and widened axe coverage.
- Closed by STEP-04: D2 from STEP-02, the game header landmark issue, is fixed with a banner/header structure.
- Closed by STEP-04: D4 from STEP-02, the narrow axe helper, is fixed so moderate, minor and best-practice findings are reported unless explicitly documented.
- Closed by STEP-04: the clock-pinned e2e residual risk from `qa.md` is covered for both sides of `2026-10-11T00:00 America/Denver` and the session-crossing-midnight case.
- **STEP-06 accessibility, Dev Team/QA:** resolve or document D3 from STEP-02 (fill-slider effective target size); run a real screen-reader smoke test deferred from STEP-04; and add axe coverage for the two-player tie screen (STEP-05 QA N5). The cancelled "Start over?" no-save and storage-failure browser tests from STEP-05 QA N4 are optional committed e2e unless STEP-06 changes those paths.
- **Closed by STEP-05 acceptance:** persistence (R36), Sound toggle and cues (R31) and the end-screen best note (DS-016) are accepted with notes. Sounds are placeholder tones, so final sounds stay in STEP-06.
- **STEP-06 priority, Dev Team/QA:** prove iOS Safari audio unlock on a real device. If audio is unavailable, gameplay must still complete silently with all visual feedback (STEP-05 AC15 behavior).
- **STEP-06 final sounds, Designer/Dev Team/QA:** Designer supplies the final flip, match and win assets; Dev Team replaces placeholder Web Audio tones without changing the `Sound` service interface; QA listens on a phone and tablet at normal volume and records audibility, harshness and distinctness.
- **STEP-06 storage, Dev Team/QA:** verify Safari and Firefox in normal and private modes. Chromium alone currently proves the in-memory fallback.
- **STEP-06 hosting, Product Owner/Moderator/Dev Team:** Product Owner identifies the site repository and production base path. Dev Team confirms deep-link refresh under `/kira-n-calvin-memory/`; if the host cannot serve it, Moderator/Product Owner choose hash routing or folder-root-only links before implementation changes.
- **STEP-06 content inputs/dependencies, Product Owner/Designer:** `resources/art` supplies the structural manifest, ten child-prefixed activity SVGs and `logo.svg`; DS-009 supplies the confirmed allow-list, approved treatments and diamond medallion. Dev Team copies those inputs into a validated edition package without editing the role-owned sources. Product Owner supplies/approves greeting copy and photos. Designer supplies final sounds. Checks dependent on missing inputs remain explicitly blocked while other STEP-06 work proceeds.
- **STEP-06 slot-based SVG integration, approved direction:** the former unchanged-flat-SVG and fixed circle/star limitation is superseded. Development implements the generic `edition.json` contract, strict same-origin SVG sanitizer/trust/cache boundary, uniform per-theme slot selection, approved CSS-variable treatment, shared board/reveal diamond medallion, canonical visible-face hooks and complete face-down front-subtree absence specified in `architecture.md` and `step-06.md`. `FaceId` stays `{ themeId, variantId }`.
- **STEP-06 QA gate:** verify every eligible treatment at minimum board and reveal sizes, exact-one-slot integrity, repeated-copy consistency, normal and simulated color-vision conditions, variants-off absence and face-down DOM/accessibility absence. Give special attention to Drones `drone`. Remove a rejected slot without adding weights; fewer than two eligible slots returns the activity to Product Owner and Designer.
- **Role-owned record alignment:** Product Owner resolves the stale treatment/cue/QA statuses in `product.md`; Designer resolves the stale approval/open-item text in `design-spec.md` and updates `resources/art/README.md` plus `card-art-format.md`; QA appends the prospective slot-variant matrix without rewriting historical results. Moderator approves those alignment commits. None of these clerical corrections reopens the approved requirements.
- **C2PA publication gate, Moderator:** decide whether removal of C2PA blocks from the child-prefixed activity SVGs is acceptable before publication. This does not block Development.
- **Follow-up for edition changes, not STEP-06 (STEP-05 sign-off N2; Product Owner decision before work):** when a saved theme or child ID is removed from edition content, keep valid saved fields and drop only unknown values rather than discarding every saved option. Schedule when an edition change is planned.
- **Docs follow-up, Designer (STEP-05 sign-off N1):** correct `design-spec.md` §3.6 to the build's test ID `header-action-button-sound` plus `data-state`, matching §3.5. Docs-only, no code change.
- **Storage schema guard, Tech Lead/Dev Team:** `knc-memory.v1.options` is versioned. Keep its accepted shape in STEP-06; any schema change requires a new key or an approved migration.

## Reference Implementation Dispositions

| Prototype area         | Disposition              | Rationale                                                                                             |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Splash cutoff behavior | Adopt with modifications | Preserve approved behavior; move cutoff to content data and injectable clock.                         |
| Options popup behavior | Adopt with modifications | Preserve non-destructive draft/Close behavior; implement with Angular overlay/focus utilities.        |
| Deck building          | Adopt with modifications | Use the pair-list approach, but rewrite as pure tested domain logic and clarify R11 balancing.        |
| Responsive grid fit    | Adopt with modifications | Keep measured-container idea; implement via Angular resize handling and test 40-card layouts.         |
| Card face composition  | Adopt with modifications | Keep one scalable face concept; use shared component and static SVG art/content separation.           |
| Focus stack            | Adopt with modifications | Keep stacked-overlay semantics; avoid double key paths and verify with axe/screen-reader smoke tests. |
| Prototype inline data  | Reject                   | Violates R35; content must be separate from engine.                                                   |
| Prototype code/runtime | Reject                   | Claude Design HTML/runtime is non-production and not Angular.                                         |
