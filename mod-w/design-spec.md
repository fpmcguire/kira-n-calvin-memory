# Design Spec - Kira-n-Calvin Memory Game

**Date:** 2026-10-12 (slot-based SVG variant revision; proposed for Moderator approval)
**Designer:** Claude (Designer + Prototyper)
**Authored in:** CLAUDE_DESIGN
**Prototype:** `prototype/Memory Game.dc.html`

---

## Authority Boundary

After Product Owner and Moderator approval, this spec is authoritative for user-facing visual behavior, interaction intent, screen composition, component states and variants, accessibility expectations, and approved user-facing terminology and content presentation.

It is not independently authoritative for production file paths, service or module boundaries, framework or library choices, canonical domain types, internal implementation names, test implementation strategy, or technical component decomposition. Those decisions remain under Tech Lead authority in `architecture.md`, `domain-language.md`, and `step-xx.md`.

The prototype is evidence for this spec, not an authoritative production source.

---

## Approval Record

### Product Owner review

- **Status:** Approved
- **Reviewer:** Product Owner (validation mode, revision 2 re-review)
- **Date:** 2026-10-10
- **Conditions or findings:**
  - B1, B2, C1–C6 and the three notes from the revision 1 review are resolved in the spec and implemented in the prototype (code review; prototype not executed).
  - Contrast ratios in §2.2 spot-checked and reproduced.
  - Moderator confirmed the §10 decisions. product.md was updated to match the approved design: R25 wording, R37 timer and Escape detail, accessibility constraint (§2.3 accepted), assumed defaults, resolved Open Questions, Change Log.
  - Non-blocking (resolved at Moderator request): the §3.16 secondary button is now labelled "Back to options" when the confirm is raised by Go, and "Keep playing" when raised by Restart. Aligned in prototype (`confirmNoLabel` in `Memory Game.dc.html`; README screens table updated).
  - Deferred to QA (not blocking design approval): deck-building across option combinations, repeated-pair matching, 40-card layout on real devices, variant legibility for color-blind users, real-display contrast, screen-reader testing.
  - Scope: no Non-Goal violations; terminology consistent with product.md. R1, R10–R11, R34, R35 and R27 (partial) remain noted as uncovered.
- **Designer response (revision 2):** All findings addressed; see "Revision 2 change map" at the end of this document.

### Tech Lead feasibility pre-review

- **Status:** Complete - feasible with noted follow-up evidence
- **Reviewer:** Codex (Tech Lead)
- **Date:** 2026-10-10
- **Feasibility concerns:** R1 is the earliest Must-have and is not designed; sequence it before the game. R10-R11 require pure domain tests because there is no UI. R35 requires static content packages separated from the engine. Contrast, screen-reader behavior and real-device 40-card layout remain unverified and should be owned by implementation/QA Steps.
- **Architecture questions:** Confirm greeting copy/assets and hosting subfolder. Confirm whether R11 remainder balancing is by pair identity or by theme when variants are on. Confirm likeness source, final logo and target device/browser matrix.

### Moderator gate

- **Status:** Approved
- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Conditions:** Approves the Product Owner's work (review, product.md update) and the current edits to design-spec.md, prototype/ and architecture-notes.md. The Tech Lead pre-review remains advisory and does not block this approval. Items deferred to QA stay deferred.

Product Owner and Moderator approval are required before this spec becomes authoritative within its boundary. Tech Lead pre-review is advisory and does not transfer architecture authority. Approval of this spec does not make the prototype authoritative.

### Slot-based SVG variant revision

- **Status:** Proposed for Moderator approval
- **Designer:** Codex, acting as Designer for this revision
- **Date:** 2026-10-12
- **Basis:** Moderator-approved Product Owner revision at commit `8265eb3`; the structured activity SVG review in `review.md`; the ten child-prefixed activity SVGs and `resources/art/manifest.json`.
- **Scope:** DS-008, DS-009 and their dependent accessibility, reveal, traceability, terminology, open-item and change-log text. The earlier prototype still demonstrates the card and reveal composition, but its four difference types are superseded and are not evidence for the slot recoloring treatment.

---

## DESIGN.md Policy

`design-spec.md` is the canonical MOD-W design artifact. A separate `DESIGN.md` is optional project documentation for broader design-system foundations, brand language, or durable visual principles.

When both exist, `DESIGN.md` contains reusable principles and global design-system guidance; `design-spec.md` contains product-specific screens, components, states, interactions, traceability, and approval. Reference `DESIGN.md` instead of duplicating token catalogues here.

No `DESIGN.md` exists for this project; token values live in §1 until one is created.

---

## Design Principles

- **Clear:** one obvious action at a time; during a reveal the only thing to do is look, then tap.
- **Consistent:** one card composition, scaled from grid to the large reveal.
- **Minimal:** no tutorial, no in-game birthday messages, no table decoration.
- **Accessible:** large tap targets, keyboard play, managed focus, non-color variant cues.
- **Nothing lost by looking:** opening the options never changes the game until Go is pressed.

---

## 1. Visual Identity

All colors are OKLCH (values used in the prototype). sRGB hex equivalents are given for the measured pairs in §2.2.

### 1.1 Color Palette

**Surfaces and ink**

| Role | Value | Hex | Use |
| ---- | ----- | --- | --- |
| Table / page background | `oklch(0.95 0.03 85)` | `#f8edd8` | Cream table; end-screen stat tiles. |
| Header surface | `oklch(0.98 0.015 85)` | `#fdf8ed` | Header bar. |
| Dialog surface | `oklch(0.99 0.01 85)` | `#fffbf4` | Options popup, end screen, confirm. |
| Ink | `oklch(0.27 0.03 60)` | `#312317` | Primary text. |
| Line / control border | `oklch(0.88 0.04 80)` (header rule, inactive player block), `oklch(0.85 0.04 80)` (secondary buttons) | — | 2 px borders (decorative; see §2.2). |
| Divider | `oklch(0.92 0.03 80)` | — | Rules inside the options popup. |
| Secondary button fill | `#fff` | `#ffffff` | Show All, Sound, Restart, Reset, stepper, Close. |

**Brand**

| Role | Value | Hex | Use |
| ---- | ----- | --- | --- |
| K-n-C Navy | `oklch(0.32 0.09 275)` | `#272d60` | Card back, logo mark, splash, primary "New Game", checkbox accent, focus ring on light surfaces. |
| Navy dot | `oklch(0.40 0.10 275)` | — | Card-back dot texture. |
| Cream on navy | `oklch(0.95–0.97 0.02–0.03 85)` | — | Text and logo strokes on navy; focus ring on dark surfaces. |
| Kira | `oklch(0.52 0.17 35)` | — | Kira name chip, player name, Go, "Start over", Kira column heading, Kira checkbox accent. **Changed from 0.62 lightness in rev. 2 (C5).** |
| Kira active tint | `oklch(0.93 0.06 35)` | — | Active player block fill. |
| Calvin | `oklch(0.50 0.13 240)` | — | Calvin name chip, player name, Calvin column heading, Calvin checkbox accent. **Changed from 0.55 lightness in rev. 2 (C5).** |
| Calvin active tint | `oklch(0.93 0.06 240)` | — | Active player block fill. |

**Scrims**

| Role | Value |
| ---- | ----- |
| Reveal scrim | `oklch(0.22 0.04 60 / .72)` |
| Popup / confirm scrim | `oklch(0.25 0.04 60 / .45)` |
| End-screen scrim | `oklch(0.25 0.04 60 / .5)` |

**Theme hues (card faces)** — face background `oklch(0.86 0.09 H)`, face ink `oklch(0.32 0.09 H)`. These presentation-frame colors stay the same for base and alternate; only the approved SVG slot treatment in DS-009 differs.

| Theme | Child | H |
| ----- | ----- | - |
| Dance | Kira | 350 |
| Snowboard | Kira | 235 |
| Red Pandas | Kira | 45 |
| Squishies | Kira | 320 |
| Art | Kira | 290 |
| Video games | Calvin | 265 |
| Archery | Calvin | 140 |
| Rock climbing | Calvin | 75 |
| Drones | Calvin | 200 |
| Gymnastics | Calvin | 15 |

Confetti: `oklch(0.75 0.15 H)` for each theme hue.

### 1.2 Typography

| Role | Family | Weight | Size / line-height |
| ---- | ------ | ------ | ------------------ |
| Splash headline (birthday) | Baloo 2 | 800 | `clamp(52px, 11vw, 120px)` / 0.95, −0.02em |
| Splash title (generic) | Baloo 2 | 800 | `clamp(32px, 6vw, 60px)` / 1 |
| End title | Baloo 2 | 800 | 40px / 1 |
| Reveal title | Baloo 2 | 800 | `clamp(22px, 4vw, 34px)` / 1 |
| Dialog titles | Baloo 2 | 800 | 28px / 1 |
| Header title "Memory Game" | Baloo 2 | 800 | 20px / 1 |
| Player name | Baloo 2 | 800 | 17px / 1.1 |
| Timer value | Baloo 2 | 800 | 20px / 1, tabular |
| Stat value | Baloo 2 | 800 | 32px / 1, tabular |
| Buttons | Baloo 2 | 700 (Go 800) | 15px header · 17px dialog · 18px end · 19px Go · 26px Close glyph |
| Option labels | Nunito | 700 | 17px game options · 16px themes |
| Body / hints / summaries | Nunito | 700 | 13–18px |
| Card name chip | Baloo 2 | 800 | 9 cqw |
| Card activity name | Baloo 2 | 800 | 11.5 cqw / 1.02, balanced wrap |
| Placeholder art label | system monospace | 600 | 6.5 cqw (placeholder only) |

Both families from Google Fonts, weights 500/700/800. Scores and times use tabular figures.

### 1.3 Spacing & Layout System

- 2 px rhythm; common steps 2, 6, 8, 10, 12, 14, 16, 18, 20, 24 px.
- Header: padding 10 × 16 px, row gap 10 px, column gap 16 px; wraps.
- Table: 16 px padding; grid centered.
- Grid gap: 6 px when table width < 520 px, else 10 px.
- Card: 3:4; min width 52 px (table < 520 px) or 64 px; max 220 px; padding 7 cqw; inner gap 4 cqw.
- Reveal card: `min(42vw, 52vh, 340px)`; pair gap `clamp(12px, 3vw, 32px)`.
- Dialogs: max width 560 / 440 / 360 px (options / end / confirm); padding 24 px; gap 18 / 14 px.
- Tap targets ≥ 44 px for all buttons, checkbox rows, stepper and Close; dialog primaries 48–52 px.

### 1.4 Borders, Radius & Elevation

| Element | Radius | Border | Elevation |
| ------- | ------ | ------ | --------- |
| Card | 8 cqw | Face: inset 1 px `rgba(0,0,0,.08)`. Back: inner frame 1.2 cqw cream @ 55%, inset 6 cqw. | Back `0 2px 0 oklch(0.22 0.07 275), 0 4px 10px rgba(40,30,80,.18)`; face `0 4px 10px rgba(60,40,20,.18)` |
| Reveal card | 8 cqw | — | `0 12px 40px rgba(0,0,0,.35)` |
| Options / end dialog | 24 px | — | `0 20px 60px rgba(60,40,20,.3)` |
| Confirm | 22 px | — | same |
| Player block / timer | 14 px | 2 px | none |
| Stat tile | 16 px | — | none |
| Buttons | pill | 2 px on secondary | none |
| Close button | circle 44 px | 2 px | none |
| Focus ring | follows element | 3 px solid, 3 px offset | — |

### 1.5 Tone & Personality

Warm, playful and personal — a family table game, not an arcade. Copy is short and spoken to the child: "Match!", "Not a match", "Tap a card to continue", "Well done, Kira!", "Kira wins!", "It's a tie!", "Start over?", "Keep playing", "Back to options". Always a "memory game". No birthday messages after the splash.

---

## 2. Accessibility Baseline

### 2.1 Requirements

- WCAG 2.2 AA for text, non-text contrast and focus indicators.
- Keyboard: Tab / Shift-Tab through controls and cards; Enter / Space select a card, skip the splash and dismiss a mismatch (R33); Escape closes the options popup when it was opened from a game (R37) and cancels "Start over?".
- Visible focus: 3 px solid ring, 3 px offset, shown for keyboard focus only (`:focus-visible`). Navy on light surfaces, cream on the reveal scrim. Measured in §2.2.
- Focus management for every overlay (splash, reveal, end, options, confirm): focus moves into the overlay when it opens, Tab is contained within the topmost overlay, and on close focus returns to the element that opened it. If that element no longer exists or is disabled, focus goes to the first control of the overlay now on top.
- Tap targets ≥ 44 × 44 px; cards ≥ 52 px wide (≈ 69 px tall).
- Variant differences never rely on color alone: every alternate face has the diamond medallion defined in DS-009 in addition to its one slot recoloring (R29). Base faces and variants-off games have no variant medallion.
- Accessible names: face-down card "Card N, face down"; face-up in a variants-on game "{Child}: {Activity}, base" or "{Child}: {Activity}, alternate"; face-up with variants off "{Child}: {Activity}"; matched cards leave the tab order; Close button "Close options and return to the game"; overlays are labelled dialogs (`aria-modal`). The selected slot and treatment are not spoken because they are presentation data, not face identity.
- Reduced motion: with `prefers-reduced-motion: reduce`, transitions and animations complete in effectively zero time and confetti is not shown. All state changes remain visible.
- Sound is never the only feedback channel.

### 2.2 Measured contrast (revision 2, resolves C5)

Method: OKLCH values converted to sRGB (OKLab → linear sRGB, gamut-clipped), WCAG 2.x relative-luminance contrast ratio. Translucent layers composited over the surface beneath. Values computed from the prototype tokens, not from screenshots.

**Text**

| Pair | Ratio | Requirement | Result |
| ---- | ----- | ----------- | ------ |
| Ink on table cream | 13.10 | 4.5 | Pass |
| Ink on header surface | 14.31 | 4.5 | Pass |
| Ink on dialog surface | 14.73 | 4.5 | Pass |
| Ink on white (secondary buttons) | 15.16 | 4.5 | Pass |
| Ink @ 75% on dialog (summary, end note) | 6.59 | 4.5 | Pass |
| Ink @ 70% on white ("TIME" label) | 5.68 | 4.5 | Pass |
| Cream on navy (New Game, card back, splash) | 11.52–11.87 | 4.5 | Pass |
| "Tap to start" (cream @ 60% on navy) | 5.18 | 4.5 | Pass — **risk resolved** |
| White on Kira, rev. 1 `0.62 0.17 35` | 3.93 | 4.5 | **Fail** (chip, Go, Start over) |
| White on Kira, rev. 2 `0.52 0.17 35` | 5.98 | 4.5 | Pass — **risk resolved** |
| Kira name on white / active tint (rev. 2) | 5.98 / 4.62 | 4.5 | Pass (rev. 1 was 3.93 / 3.03 — fail) |
| Kira column heading on dialog (rev. 2) | ≥ 5.11 | 4.5 | Pass |
| White on Calvin, rev. 2 `0.50 0.13 240` | 5.81 | 4.5 | Pass |
| Calvin name on white / active tint (rev. 2) | 5.81 / 4.72 | 4.5 | Pass (rev. 1 on tint was 3.86 — fail) |
| Calvin column heading on dialog | 5.65 | 4.5 | Pass |
| Card face ink on face background, approved base face tokens | min 7.88 | 4.5 | Pass |
| Placeholder art label | = card face ink (opacity removed in rev. 2) | 4.5 | Pass — **risk resolved** |
| Reveal title (white) on reveal scrim over cream | 7.48 | 3.0 (large) | Pass |
| Reveal hint (cream) on reveal scrim over cream | 6.46 | 4.5 | Pass |
| Variant medallion navy `#17233f` on cream `#fff7e8` | 14.62 | 3.0 non-text / 4.5 if read as a glyph | Pass |

**Non-text (WCAG 1.4.11)**

| Pair | Ratio | Requirement | Result |
| ---- | ----- | ----------- | ------ |
| Focus ring navy on table / header / dialog | 11.19 / 12.22 / 12.58 | 3.0 | Pass |
| Focus ring cream on reveal scrim | 6.46 | 3.0 | Pass |
| Checkbox accent navy on dialog | 12.58 | 3.0 | Pass |
| Active player border (Kira / Calvin) on header surface | > 4.5 | 3.0 | Pass |
| Secondary button border on white | 1.58 | n/a | Decorative. Buttons are identified by their text label (≥ 15:1), so 1.4.11 does not require the boundary to contrast. |

**Exempt:** disabled controls (40–45% opacity) are exempt under WCAG 1.4.3; they remain legible but are not measured as passes.

All §2.2 risks from revision 1 are resolved. The Kira and Calvin colors were darkened; hue and chroma are unchanged.

### 2.3 Accepted product.md accessibility constraint

Accepted in `product.md` under "Assumptions and Constraints → Constraints":

> - Accessibility target is WCAG 2.2 AA. Beyond R33, this includes: visible keyboard focus on every control and card; focus moves into each popup, reveal and end screen when it opens, stays within it while open, and returns to the control that opened it when it closes; Escape closes the options popup when it was opened from a game (R37) and cancels "Start over?"; animations are reduced or removed when the device asks for reduced motion; variant differences are never shown by color alone; and every sound has a visual equivalent.

The Product Owner accepted this constraint in `product.md`. For slot variants, DS-009 makes the non-color diamond medallion mandatory and non-animated; reduced-motion mode therefore does not remove or weaken it.

---

## 3. Component Library

**data-testid convention:** `{feature}-{component}-{element}-{modifier?}`, kebab-case. Modifier for index, variant or state (e.g. `board-card-button-12`, `options-theme-checkbox-snowboard`). Proposed; not present in the prototype.

### 3.1 Splash (DS-001)

- **Purpose:** A ~3 s opening before the board: birthday greeting on every visit in the default build (R38), or before the cutoff and the brand title after it in the `dated-birthday` build.
- **States:** Showing (auto-advance running); dismissed (tap, Enter or Space).
- **Variants:** `birthday` — "Happy Birthday Kira!" (placeholder per R2) and "Tap to start". `generic` — K-n-C logo mark, "Kira-n-Calvin Memory Game", "Tap to start". **Rev. 2: the date eyebrow is removed (C3).** No date text appears anywhere in the game.
- **data-testid:** `splash-screen-root-{birthday|generic}`.

### 3.2 Game Header (DS-002)

- **Purpose:** Persistent bar with brand, scores and actions.
- **States:** Default; wraps on narrow screens.
- **Variants:** Single-player (one block + timer); two-player (Kira and Calvin blocks).
- **Contents:** logo mark (40 px navy circle, "K-n-C" 13 px) + "Memory Game"; player blocks; timer; Show All, Sound, Restart, New Game.
- **data-testid:** `header-bar-root`, `header-logo-mark`.

### 3.3 Player Score Block (DS-003)

- **Purpose:** Name, attempts and pairs matched for one player.
- **States:** Inactive (white, line border); active (child tint, child-color border) in two-player while the game is live, including while the popup is open over it.
- **Variants:** Kira, Calvin. **Two-player order is always Kira, then Calvin (C6)**; the first player is shown by the active highlight.
- **data-testid:** `header-player-block-{kira|calvin}`, `…-attempts`, `…-pairs`, modifier `-active`.

### 3.4 Timer (DS-004)

- **Purpose:** Running time in single-player (R20).
- **States:**
  - Running during play, including reveals and Show All (R26).
  - **Paused while the options popup is open over an active game; resumes from the same value when the popup is closed (C2, R37).** Paused time is not counted.
  - If Go starts a new game from the popup, the new game's timer starts at 0:00.
  - Frozen at the final time on the end screen and while the popup is open over a completed game.
- **Variants:** Single-player only.
- **Format:** `m:ss`, tabular.
- **data-testid:** `header-timer-value`, modifier `-paused`.

### 3.5 Header Action Button (DS-005)

- **Purpose:** Pill buttons for Show All, Sound, Restart, New Game.
- **States:** Default; disabled (45% opacity); keyboard focus (ring); pressed (`aria-pressed` on Sound).
- **Variants:** Secondary (white, 2 px border): Show All, Sound, Restart. Primary (navy): New Game.
- **Disabled rules:** Show All — unless play is between turns. Restart — before the first game, while the popup is open, and while input is locked (flip-to-reveal delay, reveal, Show All). New Game — while the popup is open and while input is locked.
- **data-testid:** `header-action-button-{show-all|sound|restart|new-game}`.

### 3.6 Sound Toggle (DS-006)

- **Purpose:** Sound on/off for flip, match and win (R31).
- **States:** On ("Sound on", `aria-pressed=true`); Off ("Sound off").
- **data-testid:** `header-action-button-sound-{on|off}`.

### 3.7 Board / Table (DS-007)

- **Purpose:** The play area holding the card grid.
- **States:**
  - **Preview — first open only (C6, B2):** before any game has been dealt this session, face-down backs are shown behind the popup; their count follows the draft options live. The preview is not the deck that will be dealt.
  - **Live board behind the popup (B2, R37):** when the popup is opened from an active or completed game, the table shows that game's actual cards, unchanged: same order, face-up/face-down state, empty slots and wrapping. The preview never replaces a live board.
  - In play; with empty slots; scrolling fallback (minimum card size cannot fit).
  - Empty: no cards (first open with no theme checked; a completed game shows an empty table).
- **data-testid:** `board-grid-root`, modifier `-preview|-live`.

### 3.8 Card (DS-008)

- **Purpose:** One playing card: shared K-n-C back, illustrated face.
- **States:** Face down (default); face up (3D flip); peeked (Show All); locked (input ignored, no visual change); matched/gone (fade to 0 and scale to 0.85, then hidden; slot kept, no border); keyboard focus (navy ring, 3 px offset).
- **Variants:** Face content per theme × domain variant (DS-009). The back is identical for every card and exposes no theme, domain variant, selected slot, treatment or cue visually or to assistive technology (R30).
- **Face composition and art placement:** A compact top band holds the child name chip at upper left and reserves the upper-right badge area for the DS-009 medallion. The activity SVG remains a square, is centered below that band and is contained without cropping or stretching; its 1:1 aspect ratio is preserved inside the 3:4 card. The activity name sits below the art. The decorative corner flag remains in the lower corner, behind and clear of the activity label, and is identical for base and alternate. The flag, name chip, art position and label never mirror, move or recolor to indicate a variant.
- **Cue clearance:** The medallion does not overlap the child chip, square art, activity label or corner flag. Its reserved badge area remains empty on base faces and whenever variants are off; no placeholder outline is shown.
- **data-testid:** `board-card-button-{index}` (index only; the id does not change when the card flips). State hook: `data-state="down|up|peeked|gone"` on the card (tests only, never displayed).

### 3.9 Card Face Variant Cues (DS-009)

- **Purpose:** Make the `base` and `alternate` faces of an activity slightly but clearly different through one allow-listed slot recoloring plus one consistent non-color cue (R9, R15, R27, R28, R29).
- **Selection and stability:** With variants on, each theme receives one eligible slot and its listed treatment when the game is dealt. Selection is uniform across that theme's allow-list. The choice is stable for both cards of the face and every repeated copy; Go and Restart reroll it. With variants off, only the `base` pair is dealt. The selected slot and treatment are presentation data and do not change face identity `{themeId, variantId}` (R12).
- **Base state:** Manifest default colors, no variant medallion. The SVG therefore retains its approved default appearance.
- **Alternate state:** Exactly one eligible slot uses its approved treatment, including every variable listed for a multi-variable slot. Every non-variant group, every other variant slot and all fixed outlines/details remain unchanged. The diamond medallion is always present.
- **Prohibited differences:** No pattern substitution, accessory-presence change, mirroring, movement, hiding, scaling or recoloring of likeness, skin, head, hair, glasses, shadow or scene content. The former H + 55° rule and the former color/pattern/accessory/orientation difference types are superseded.

#### 3.9.1 Per-activity slot allow-list

The judgment point is the minimum 52 × 69 px board card as well as the large reveal. An included slot has a coherent area that remains locatable at board size. An excluded slot is too small, thin, scattered, ambiguous, or too visually dominant for a slight difference.

| Activity | Included slots | Excluded slots and reason |
| -------- | -------------- | ------------------------- |
| Kira — Dance | `outfit`, `skirt` | `note-1`, `note-2`, `sparkle`: isolated small marks; `shoes`: two very small regions at board size. |
| Kira — Art | `easel`, `bottoms`, `top`, `palette` | `shoes`: too small; `brush`: thin and partly hand-adjacent, so its change is ambiguous at board size. |
| Kira — Snowboard | `board`, `bottoms`, `top`, `helmet` | `sparkle-1`, `sparkle-2`: isolated small marks; `shoes`, `gloves`: too small at board size. |
| Kira — Red Pandas | `bottoms`, `top` | `shoes`, `heart`: too small; `red-panda`: recolors most of the defining animal and is too dominant for a slight difference. |
| Kira — Squishies | `top`, `bottoms`, `squishy-pink` | `sparkle-1`, `sparkle-2`, `shoes`: too small; `squishy-blue`, `squishy-mint`: small edge props whose change is easily missed at board size. |
| Calvin — Video games | `bottoms`, `top` | `pixel-heart`, `pixel-star`: isolated marks that become too small on a dense board; `shoes`, `controller`: too small at board size. |
| Calvin — Archery | `target`, `bottoms`, `top`, `cap` | `shoes`: too small; `sleeves`: narrow, split regions; `bow`, `arrow`: thin linear shapes whose recoloring is ambiguous at board size. |
| Calvin — Rock climbing | `bottoms`, `top` | `hold-1`–`hold-8`: each is a single small hold and they are not one combined slot; `rope`: thin line; `shoes`, `harness`: too small. |
| Calvin — Drones | `drone`, `bottoms`, `top` | `shoes`, `controller`: too small at board size. |
| Calvin — Gymnastics | `mat`, `bottoms`, `top` | `sparkle-1`, `sparkle-2`, `sparkle-3`: isolated small marks. |

**Preferred-slot recommendation for Product Owner confirmation:** Mark no slot preferred. Every included slot must pass the same legibility gate, so uniform random choice best preserves the product's unpredictability. If QA rejects an included slot, remove or revise that slot's treatment rather than silently weighting other slots.

#### 3.9.2 Approved alternate color treatments

These colors are presentation treatments, not changes to the SVG files. Fixed outlines, highlights, facial/prop details and all variables outside the selected slot remain at their manifest defaults. A slot with two variables changes both as one slot so its internal two-tone relationship remains intentional.

| Activity | Eligible slot | Manifest default(s) | Approved alternate treatment |
| -------- | ------------- | ------------------- | ---------------------------- |
| Dance | `outfit` | `--outfit #f3a3c8` | `--outfit #087f8c` (deep teal) |
| Dance | `skirt` | `--skirt #c9a8f0` | `--skirt #9b3f70` (deep berry) |
| Art | `easel` | `--easel #a8743f` | `--easel #1f6f8b` (ocean blue) |
| Art | `bottoms` | `--bottoms #8fb7dd` | `--bottoms #a33f73` (berry) |
| Art | `top` | `--top #8d70d0` | `--top #e1a21a` (gold) |
| Art | `palette` | `--palette #e8c99a` | `--palette #b44358` (deep coral) |
| Snowboard | `board` | `--board #6b4fc4` | `--board #f2b84b` (sunflower) |
| Snowboard | `bottoms` | `--bottoms #6e5bb8` | `--bottoms #f0a51a` (golden orange) |
| Snowboard | `top` | `--top #3fa7b5` | `--top #7a3e9d` (plum) |
| Snowboard | `helmet` | `--helmet #8d70d0`; `--helmet-2 #f3a3c8` | `--helmet #1f7a75`; `--helmet-2 #ffd166` (teal + warm yellow) |
| Red Pandas | `bottoms` | `--bottoms #8fb7dd` | `--bottoms #a33f73` (berry) |
| Red Pandas | `top` | `--top #8d70d0` | `--top #e1a21a` (gold) |
| Squishies | `top` | `--top #8d70d0` | `--top #e1a21a` (gold) |
| Squishies | `bottoms` | `--bottoms #8fb7dd` | `--bottoms #a33f73` (berry) |
| Squishies | `squishy-pink` | `--squishy-pink #ffb3c8` | `--squishy-pink #167c80` (deep teal) |
| Video games | `bottoms` | `--bottoms #4b79c0` | `--bottoms #f2b84b` (sunflower) |
| Video games | `top` | `--top #6f6866` | `--top #67cdbd` (mint) |
| Archery | `target` | `--target #ef4b5c` | `--target #2468b4` (clear blue) |
| Archery | `bottoms` | `--bottoms #2c2c38` | `--bottoms #f2b84b` (sunflower) |
| Archery | `top` | `--top #f4f2ee` | `--top #2468b4` (clear blue) |
| Archery | `cap` | `--cap #2c2c38` | `--cap #f2b84b` (sunflower) |
| Rock climbing | `bottoms` | `--bottoms #4b79c0` | `--bottoms #f2b84b` (sunflower) |
| Rock climbing | `top` | `--top #4fa3e0` | `--top #7a3e9d` (plum) |
| Drones | `drone` | `--drone #3d4466`; `--drone-2 #7cc58a` | `--drone #e1a21a`; `--drone-2 #a33f73` (gold + berry) |
| Drones | `bottoms` | `--bottoms #4b79c0` | `--bottoms #f2b84b` (sunflower) |
| Drones | `top` | `--top #6f6866` | `--top #67cdbd` (mint) |
| Gymnastics | `mat` | `--mat #4a8fe0` | `--mat #f2b84b` (sunflower) |
| Gymnastics | `bottoms` | `--bottoms #2d3a6b` | `--bottoms #f2b84b` (sunflower) |
| Gymnastics | `top` | `--top #e5484d` | `--top #67cdbd` (mint) |

#### 3.9.3 Final non-color cue

- **Treatment:** Alternate faces carry a cream circular medallion (`#fff7e8`) with a 2 px navy ring (`#17233f`) and a solid navy diamond centered inside it. Presence plus the circle/diamond geometry is the cue; it does not depend on its color. Base faces have no medallion.
- **Board:** 12 × 12 px at the 52 px minimum card width, growing with the card without crowding the top band. The ring remains at least 2 px and the diamond at least 5 × 5 px.
- **Reveal:** Same medallion, geometry and upper-right relationship, sized 28 × 28 px with a 3 px ring and a diamond at least 12 × 12 px. It is not redesigned, moved or given a different symbol in the reveal.
- **Placement:** Upper-right reserved badge area, horizontally opposite the upper-left child name chip and outside the square art. It never overlaps the art or lower corner flag. The cue does not encode theme, selected slot or treatment.
- **Face-down and variants-off behavior:** No medallion, reserved outline, shadow, animation or other trace appears on the shared back. Variants-off faces also show no medallion.
- **Motion:** Static. If a future approved revision animates it, reduced-motion mode must retain the final visible medallion and remove the motion only.

#### 3.9.4 Legibility and color-blind verification gate

- Test every eligible default/treatment combination on a 52 × 69 px card, representative fitted layouts through 40 cards, and the large reveal. Do not approve from a magnified SVG alone.
- At minimum board size, the selected slot must have at least one recolored region 4 × 4 CSS px or larger and the full slot must span at least 15% of the square art's width or height. In the reveal, one region must be at least 12 × 12 CSS px. Split groups count together only when they read as one object (for example `top` or `bottoms`).
- Default and alternate colors for every changed variable must have CIEDE2000 `ΔE00 ≥ 20`. The recolored shape must keep a clear boundary and its fixed internal details; where that boundary is needed to understand the object, it must retain at least 3:1 non-text contrast through its unchanged outline or against its immediate background.
- Review normal color plus protanopia, deuteranopia and tritanopia simulations. In each, the changed region must remain locatable side by side and the medallion must remain unmistakable. Also review achromatopsia/grayscale: the medallion must still distinguish the alternate even if the hue change loses salience.
- Use at least two reviewers unfamiliar with the slot choice. At board and reveal sizes, each must correctly identify the alternate in every approved pair without coaching; any miss rejects that slot/treatment combination pending a Designer revision.
- Verify both copies and all repeated copies of a face are visually identical, exactly one eligible slot changes, all non-variant groups and other slots remain unchanged, and variants-off has neither recoloring nor cue.

#### 3.9.5 Test semantics and hook ownership

- Preserve `board-card-button-{index}`, `data-state="down|up|peeked|gone"` and `data-variant="base|alternate"` where still valid.
- Retire `data-difference`: there is no longer a set of difference types, so a constant `color` or `slot-color` value would add no useful distinction.
- Tests need inspectable semantics for the selected manifest slot, approved treatment and cue presence, but exact attribute names and placement remain Tech Lead authority. Suggested meanings, not mandated names, are `variant slot`, `treatment ID` and `cue present`. Whatever hooks are approved must not alter the visible or accessible face-down back.

### 3.10 Options Popup (DS-010, DS-025)

- **Purpose:** Choose players, variants, fill the grid and themes before a game (R6); return to the current game unchanged (R37).
- **Structure:** Title row: "New game" and, when opened from a game, a Close button (×, 44 px circle, top-right). Then a "Players" group with one checkbox per child (Kira, Calvin; rev. 3, C8); then two checkboxes (Variants, Fill the grid); stepper when fill is on; divider; two theme columns "Kira" and "Calvin"; divider; footer with summary, Reset and Go.
- **Opening contexts:**
  - **After the splash (first open, R5):** no Close button (there is no game to return to). Escape does nothing. Defaults (C6, C8): **all ten themes checked**, Kira checked and Calvin unchecked, variants off, fill off — unless options saved on this device (R36) exist, which are used instead.
  - **From New Game during an active game, or from a completed game (R24, R37):** filled in with the current game's options. Close button present. The live board, scores, turn, timer value and any face-up card stay exactly as they were behind the popup (B2).
- **Close (DS-025, R37):** Close button or Escape. Dismisses the popup and returns to the game exactly as it was: draft changes are discarded, options are not changed, the deck is not rebuilt, scores and turn are unchanged, the timer resumes from its paused value (active game) or stays frozen (completed game, end screen shown again). Focus returns to the control that opened the popup.
- **Go:** applies the draft and deals a new game. If the popup was opened from a game in progress (definition in 5.4), "Start over?" is asked first (DS-018). Nothing is destroyed before Go is confirmed (C1).
- **Reset (C4, R7):** clears every option in the draft: both player checkboxes, Variants and Fill the grid are unchecked, all ten themes are unchecked, and the fill value is discarded (it is recalculated the next time Fill the grid is checked). Go becomes disabled and the summary reads "Pick at least one player and one theme". With only players missing it reads "Pick at least one player"; with only themes missing, "Pick at least one theme". Reset changes only the draft: it does not affect the live game behind the popup, does not close the popup and does not change saved options; options are saved only when a game is started with Go.
- **States:** First open; reopened from a game; no themes checked (Go disabled); valid (summary "N cards · N/2 pairs").
- **data-testid:** `options-dialog-root`, `options-dialog-close`, `options-players-group`, `options-player-checkbox-{kira|calvin}`, `options-toggle-checkbox-{variants|fill}`, `options-theme-checkbox-{themeId}`, `options-action-button-{reset|go}`, `options-summary-text`.

### 3.11 Fill-the-Grid Stepper (DS-011)

- **Purpose:** Exact card count 4–40 in steps of 4 (R8).
- **Start value (C6):** when Fill the grid is checked, the value is set to the current draft's card count (checked themes × 1 or 2 pairs × 2), rounded up to the next multiple of 4 and kept within 4–40. With no themes checked it starts at 4.
- **States:** Hidden (fill off); visible; at min; at max. The prototype clamps silently at the ends; disabled end buttons are recommended.
- **Parts:** −/+ buttons (44 px circles), range slider, value (22 px).
- **data-testid:** `options-fill-stepper-{decrement|slider|increment|value}`.

### 3.12 Card Count Summary (DS-019)

- **Purpose:** Board size before Go.
- **States:** "20 cards · 10 pairs"; "Pick at least one theme".
- **data-testid:** `options-summary-text`.

### 3.13 Pair Reveal Overlay (DS-012)

- **Purpose:** The two flipped cards large and side by side, every turn (R15).
- **States:** Match — "Match!", no hint, auto-dismiss after the match pause. Mismatch — "Not a match", "Tap a card to continue"; a revealed card tap, Enter or Space dismisses; scrim tap does nothing.
- **Variant fidelity:** Each revealed card uses the same square-art placement, selected slot treatment and medallion state as its board card. It does not substitute a larger-detail design. At reveal size, the recolored slot and medallion meet DS-009's legibility gate.
- **Focus:** focus moves to the first revealed card; cream focus ring; Tab stays within the two cards.
- **data-testid:** `reveal-overlay-root-{match|mismatch}`, `reveal-card-button-{1|2}`, `reveal-hint-text`.

### 3.14 End Screen (DS-016)

- **Purpose:** Result with celebration and next steps (R21, R22, R36).
- **Variants:**
  - Single-player: "Well done, {Player}!" in the player's color; stats "attempts" and "time"; best-score note (R36): "New best for {Player} on this board!" or "{Player}'s best on this board: N attempts". **Board = card count + variants on/off; bests are kept per player (C6).**
  - Two-player winner: "{Winner} wins!"; "Kira's pairs", "Calvin's pairs"; tie-break note "Same pairs — {Winner} took fewer turns (N)." when applicable.
  - Two-player tie: "It's a tie!" in navy.
- **Actions:** Restart (no confirm; game is complete) and New Game (opens the popup over the completed game; Close returns to this end screen).
- **data-testid:** `end-dialog-root-{single|winner|tie}`, `end-stat-tile-{n}`, `end-best-note`, `end-action-button-{restart|new-game}`.

### 3.15 Confetti (DS-017)

- **Purpose:** Celebration behind the end card (R21).
- **States:** Falling (loops while the end screen is shown); not shown under reduced motion.
- **Variants:** 70 pieces in theme colors, 8–16 × 12–22 px, 2.6–5 s fall, 0–2 s stagger, 720° rotation.
- **data-testid:** `end-confetti-root`.

### 3.16 Start Over Confirm (DS-018)

- **Purpose:** Prevent losing a game in progress (R25).
- **When shown (C1):**
  - **Restart** from the header while a game is in progress → ask immediately; "Start over" restarts with the same options.
  - **New Game** → never asks; the popup opens directly (nothing is lost by opening it).
  - **Go** in a popup opened from a game in progress → ask; "Start over" deals the new game with the draft options; "Back to options" or Escape returns to the popup with the draft intact (the popup, not the game, because the player came from there; its Close button then returns to the game).
  - From the end screen, or when no game is in progress → never asks.
- **Actions:** a secondary button and "Start over" (Kira color). The secondary button is labelled by context: **"Keep playing"** when the confirm was raised by Restart (it returns to the game), **"Back to options"** when raised by Go (it returns to the popup with the draft intact). Focus starts on the secondary button.
- **data-testid:** `confirm-dialog-root`, `confirm-action-button-{cancel|confirm}`.

---

## 4. Screen Layouts

### 4.1 Splash (DS-001)

Full-viewport navy layer above everything; centered column, 24 px gap and padding; "Tap to start" 28 px from the bottom. Whole surface is the tap target and receives focus. Type scales with `clamp()`.

### 4.2 Game Shell (DS-002, DS-007)

Full-viewport column: header (auto) above table (remaining height). The page never scrolls; only the table scrolls, as a last resort.

**Header:** three flex groups (brand, scores, actions) wrap independently; phone portrait typically 2–3 rows.

**Grid (R13, R14):**

1. Measure table width W and height H (minus 16 px padding).
2. For c = 1…n: width = min((W − gaps) / c, ((H − gaps) / rows) × 3/4); keep the largest.
3. If below the minimum (52 / 64 px), use the minimum and as many columns as fit; the table scrolls vertically.
4. Cap at 220 px.
5. Source order; incomplete last row left-aligned; grid centered.
6. Recompute on resize or rotation; order never changes; empty slots keep their positions.

### 4.3 Options Popup (DS-010, DS-025)

Centered over the board on a light scrim (the board, live or preview, stays visible behind it). Width `min(560px, 100%)`, max height viewport − 32 px, scrolls internally.

- **Title row:** "New game" left; Close (×) right, 44 px, only when opened from a game. Title and Close stay on one row at all widths.
- Game options stacked, each row ≥ 44 px; stepper indented 36 px under Fill the grid.
- Theme columns two equal columns at all widths.
- Footer wraps: summary left; Reset and Go right.
- Opening moves focus to the first control (Close when present, otherwise the Kira player checkbox). Tab is contained. Escape = Close (when present). On Close, focus returns to the opener (header New Game or end-screen New Game).

### 4.4 Pair Reveal (DS-012)

Full-viewport dark scrim; title, two cards in a row, 28 px reserved hint line. Card size bound by 42vw, 52vh and 340 px, so the pair stays side by side in both orientations.

### 4.5 End Screen (DS-016)

Centered `min(440px, 100%)` card over a scrim; confetti full-viewport behind. Stat tiles wrap at 110 px.

### 4.6 Confirm (DS-018)

Centered `min(360px, 100%)`, two equal buttons. Stacks above the options popup when triggered by Go.

### 4.7 Greeting page (R1)

Not designed. Depends on the open greeting-page content question and the site's folder-per-occasion pattern.

---

## 5. Interaction Patterns

### 5.1 Flow (DS-025 added)

```
Splash (~3 s, or tap / Enter / Space)
  → Board (preview) + Options popup [first open, no Close]
      → Go → Play
Play
  → New Game → Options popup over the live game [Close available, timer paused]
      → Close / Escape → Play, exactly as it was (timer resumes)
      → Go → (game in progress? "Start over?") → new Play
  → Restart → (game in progress? "Start over?") → new Play, same options
  → last pair → End screen
End screen
  → Restart → new Play, same options (no confirm)
  → New Game → Options popup over the completed game [Close available]
      → Close / Escape → End screen, exactly as it was
      → Go → new Play (no confirm)
```

**Rule (C1):** opening the options popup never changes the game. Only Go (after confirmation where required) or Restart replaces it.

### 5.2 Turn (DS-013, DS-014)

1. Tap a face-down card → flips (0.4 s), flip sound.
2. Tap a second card → flips; attempt counted; input locked.
3. After ~0.42 s the reveal opens (0.28 s pop).
4. **Match:** match sound; after the pause (default 1.5 s) the reveal closes, cards fade and shrink (0.35 s), pairs +1, same player again. Empty table → end screen after ~0.55 s, win sound.
5. **Mismatch:** reveal stays until a revealed card is tapped (or Enter / Space); cards turn face down; two-player turn passes.

New Game and Restart are unavailable while input is locked (steps 2–5 and Show All), so the popup can only open between selections or with one card face up.

### 5.3 Show All (DS-015)

Between turns only. All remaining cards face up for ~3 s; current player's attempts +1; turn unchanged; timer keeps running; input locked until cards flip back.

### 5.4 "Game in progress" (C6, R25)

A game is in progress when it has been dealt, has not ended, and **at least one card has been flipped or Show All has been used**. A freshly dealt, untouched board is not in progress (no confirm). A completed game is not in progress.

### 5.5 Players (DS-020)

The player checkboxes decide who plays (rev. 3, C8). Only one child checked: single-player with that child, and Restart keeps that child. Both checked: two-player, and the first player is random, rolled on each Go and Restart together with the deck and each theme's slot/treatment selection. None checked: Go disabled. The date and the cutoff play no part, in every build. Header order stays Kira, Calvin.

### 5.6 Selection, hover, focus

- Selection is shown only by the flip.
- Keyboard focus ring per §2.1; no ring on mouse/touch focus.
- No hover effects; pointer cursor on interactive elements.

### 5.7 Keyboard navigation (DS-023, DS-026)

| Key | Context | Result |
| --- | ------- | ------ |
| Tab / Shift-Tab | Board | Header actions and cards in grid order; matched cards skipped. |
| Tab / Shift-Tab | Any overlay | Cycles within the topmost overlay only. |
| Enter / Space | Card | Select. |
| Enter / Space | Splash | Skip. |
| Enter / Space | Mismatch reveal | Dismiss (once; a focused button's own activation is not doubled). |
| Escape | Options popup opened from a game | Close (R37). |
| Escape | "Start over?" | Cancel (same as the secondary button: "Keep playing" or "Back to options"). |
| Escape | Elsewhere | No effect. |

Overlay focus behavior (DS-026): on open, focus moves to the first control; on close, focus returns to the opener when it still exists and is enabled, otherwise to the first control of the overlay now on top.

### 5.8 Transitions (DS-022)

| Motion | Duration / easing |
| ------ | ----------------- |
| Card flip | 0.4 s `cubic-bezier(.3,.7,.3,1)`, Y rotation, 900 px perspective |
| Card disappear | 0.35 s opacity → 0, scale → 0.85 |
| Reveal open | scrim fade 0.2 s; pop 0.28 s, slight overshoot |
| Dialog open | fade 0.15–0.3 s; pop 0.25–0.35 s |
| Active player highlight | 0.25 s |
| Confetti | 2.6–5 s linear loop |
| Reduced motion | all of the above effectively instant; confetti hidden |

### 5.9 Sound (DS-021)

Flip: short high tone. Match: rising three-note arpeggio. Win: rising four-note arpeggio. Muted when Sound is off. Final sounds open.

### 5.10 Memory on the device (DS-024)

Last options are saved when Go starts a game and are used the next time the popup opens for the first time in a session. Single-player best (fewest attempts) is saved per **card count + variants on/off + player** (C6) and shown on the end screen.

---

## 6. Design Traceability

| Design ID | Design element | Product requirement | Prototype evidence | First implementation Step | Notes |
| --------- | -------------- | ------------------- | ------------------ | ------------------------- | ----- |
| DS-001 | Splash (birthday / generic) | R2, R3, R38 | Load; default build shows birthday on both sides of the cutoff; `dated-birthday` build before/after | TBD | Rev. 2: date eyebrow removed (C3). Rev. 3 (2026-10-11): permanent birthday flag (C7). |
| DS-002 | Game header | R19, R20, R31 | Header after splash | TBD | |
| DS-003 | Player score block | R19, R4 | Two-player game | TBD | Fixed Kira/Calvin order (C6). |
| DS-004 | Single-player timer | R20, R26, R37 | Single-player; open/close popup mid-game | TBD | Pauses under popup (C2). |
| DS-005 | Header action buttons | R22, R23, R24, R26, R31 | Header right group | TBD | |
| DS-006 | Sound toggle | R31 | "Sound on/off" | TBD | Placeholder tones. |
| DS-007 | Board, responsive grid, preview vs live board | R5, R13, R14, R37 | Resize; first open vs New Game mid-game | TBD | Preview only on first open (B2). |
| DS-008 | Card, square-art placement and shared back | R9, R12, R16, R27, R29, R30, R32 | Any game; variants off/on; face down/up/peeked | TBD | Art centered and unstretched in 3:4 card; back exposes no face presentation. |
| DS-009 | Slot allow-lists, alternate treatments, non-color cue and legibility gate | R9, R12, R15, R27, R28, R29, R30, R35 | Every eligible base/alternate combination at minimum board and reveal sizes | TBD | One slot only; diamond medallion always on alternate; no preferred slots proposed. |
| DS-010 | Options popup | R5, R6, R7, R24 | After splash; New Game | TBD | Reset defined (C4). |
| DS-011 | Fill-the-grid stepper | R8 | Check Fill the grid | TBD | Start value rule (C6). |
| DS-012 | Pair reveal overlay | R15, R17, R18, R28, R29 | Any two cards, including each eligible base/alternate treatment | TBD | Same art, treatment and cue as board cards. |
| DS-013 | Match resolution | R12, R16 | Matching pair | TBD | |
| DS-014 | Mismatch and turn handoff | R17, R4 | Non-matching pair, two-player | TBD | |
| DS-015 | Show All | R26 | Show All between turns | TBD | |
| DS-016 | End screen incl. best-score note | R21, R22, R36 | Clear a 4-card board twice | TBD | R36 added (PO note). |
| DS-017 | Confetti | R21, R32 | End screen | TBD | Hidden under reduced motion. |
| DS-018 | "Start over?" confirm | R25, R37 | Restart after a flip; Go from popup mid-game | TBD | Rules per C1. |
| DS-019 | Card count summary | R8, R9 | Popup footer | TBD | |
| DS-020 | Player assignment from the Kira and Calvin checkboxes | R4, R6, R7 | One child, both children, none | TBD | Rev. 3 (2026-10-11): replaces the cutoff-driven rule (C8). |
| DS-021 | Sound cues | R31 | Flip, match, win | TBD | |
| DS-022 | Motion set incl. reduced motion | R32 | Flip, disappear, reveal, dialogs | TBD | |
| DS-023 | Keyboard interaction and focus ring | R33 | Tab + Enter/Space/Escape | TBD | |
| DS-024 | Remembered options and best score | R36 | Reload after Go; repeat a board | TBD | Key per C6. |
| DS-025 | Return to game: popup Close + Escape | R37, R24 | New Game mid-game or from end screen → × or Escape | TBD | **New (B1).** |
| DS-026 | Overlay focus management (move in, contain, return) | R33, R37 | Open/close popup with keyboard; reveal; confirm | TBD | **New (B1).** |

**Requirements without design coverage in this spec:** R1 (greeting page; not designed), R10–R11 (deck-building rules; visible result via DS-007/DS-019, rules are product logic), and R34 (hosting). R35's edition-owned allow-list and treatments are covered visually by DS-009; its package and engine boundaries remain structural Tech Lead authority. R27's face layout and protected visual groups are covered; likeness approval remains outside this revision.

---

## 7. Domain Language Proposals

`domain-language.md` exists and remains Tech Lead-owned. The rows below are design-context proposals; the Tech Lead must reconcile the superseded "Difference type" entry and ratify the new slot/treatment terms.

| Proposed term | Form (type / value / both) | Definition | Rationale | First appearance |
| ------------- | -------------------------- | ---------- | --------- | ---------------- |
| Theme | both | One of the ten activities, owned by Kira or Calvin. | product.md wording. | Options popup |
| Variant | both | The `base` or `alternate` face of a theme. | R9; align with the existing canonical term. | Card face |
| Difference type | value | **Retire.** The former color/pattern/accessory/orientation choice is superseded by one slot recoloring plus the required cue. | R28 revision of 2026-10-12. | Card face |
| Variant slot | value | One manifest-declared, Designer-allow-listed recolorable part of an activity SVG; it may span several paint-order groups. | Separates SVG slot language from domain `Variant`. | Card face |
| Alternate color treatment | value | The approved replacement color set for one eligible slot; multi-variable slots use one coordinated treatment. | R28 and R35. | Card face |
| Variant medallion | value | The alternate-only circle-and-diamond non-color cue supplied by the card presentation. | R29. | Card face |
| Face | type | Theme + variant; equal faces match. | R12. | Matching |
| Pair | type | Two cards with the same face. | On screen. | Header, summary |
| Attempt | value | Turning over two cards, or one Show All. | R19, R26. | Header |
| Reveal | type | Large side-by-side display of the two flipped cards. | R15. | Overlay |
| Show All | value | Timed peek at all remaining cards. | R26. | Header |
| Fill the grid | value | Option for an exact card count, 4–40. | R8. | Options popup |
| Table | value | The play area. | R13, R16. | Game shell |
| Cutoff | type | Data-driven instant ending the birthday splash in the `dated-birthday` build. Does not affect players. | R3, R38. | Splash |
| Empty slot | value | Grid position left by a matched card. | R16. | Board |
| Draft options | value | The popup's unsaved selections; applied only by Go. | Needed to express R37 and Reset. | Options popup |
| Game in progress | value | Dealt, not ended, with a card flipped or Show All used. | R25 (C6 decision). | Confirm |
| Preview board | value | Face-down count preview shown behind the first-open popup. | R5, B2. | Board |

---

## 8. Scope Rules

- Only define components required for current or near-term Steps
- Do not design beyond approved PRODUCT scope
- Each in-scope screen, major component, and significant interaction must have a Design ID and Product requirement mapping
- When `roadmap.md` exists, connect Design IDs to the first implementation Step

---

## 9. UI Scope Rules

- Only implement UI elements in current `step-xx.md`
- Future states must not be implemented early
- Design supports incremental delivery

---

## 10. Open Questions

| Question | Owner | Status |
| -------- | ----- | ------ |
| Themes checked on first open. | Product Owner | **Decided 2026-10-10:** all ten. |
| Fill the grid start value. | Product Owner | **Decided 2026-10-10:** current card count rounded up to a multiple of 4, within 4–40. |
| Board behind the popup. | Product Owner | **Decided 2026-10-10:** face-down preview on first open; live board when opened from a game. |
| Definition of "game in progress" (R25). | Product Owner | **Decided 2026-10-10:** a card flipped or Show All used, game not ended. |
| Two-player header order. | Product Owner | **Decided 2026-10-10:** always Kira, then Calvin. |
| Best-score key (R36). | Product Owner | **Decided 2026-10-10:** card count + variants on/off + player. |
| R25/R37 interaction. | Product Owner | **Decided 2026-10-10:** New Game opens the popup without a confirm; "Start over?" on Go when a game is in progress; Close returns unchanged. |
| Timer while the popup is open. | Product Owner | **Decided 2026-10-10:** paused; resumes on Close. |
| Splash date eyebrow. | Product Owner | **Decided 2026-10-10:** removed. |
| Player selection (replaces Two players). | Product Owner | **Decided 2026-10-11:** Kira and Calvin checkboxes; one is single-player with that child, both is two-player with a random first player; none disables Go; first open checks Kira; Reset clears both; no theme filtering; every build (R4, R6, R7). |
| Permanent birthday screens (STEP-04 N7). | Product Owner | **Decided 2026-10-11:** birthday splash on every visit in the default build, behind the build-time flag `permanentBirthday` (R38). Player rules unchanged. |
| Minimum card size: 52 px (narrow) / 64 px. Confirm on real devices with 40 cards. | Designer | Proposed; QA evidence deferred. |
| Difference type list (color, pattern, accessory, orientation). | Designer / Product Owner | **Superseded 2026-10-12:** one allow-listed slot recoloring plus the diamond medallion. |
| Confirm the DS-009 per-activity allow-list and the recommendation that no slot is preferred. | Product Owner | Open — required before this revision is authoritative. |
| Confirm exact hook names/placement for selected slot, treatment and cue semantics; retire `data-difference`; align the canonical domain language and downstream architecture/Step records. | Tech Lead | Open — design semantics are defined; technical names and implementation remain Tech Lead authority. |
| Validate every eligible treatment at minimum board and reveal sizes, including protanopia, deuteranopia, tritanopia and achromatopsia/grayscale simulations, exact-one-slot integrity and repeated-copy consistency. | QA | Open — criteria in §3.9.4. |
| Approve this slot-based Designer revision after Product Owner and Tech Lead/QA handoff review. | Moderator | Open. |
| Decide whether removal of prior activity-SVG C2PA blocks is acceptable for publication. | Moderator | Open; outside Designer authority. |
| Likeness source; Squishies and Red Pandas art direction. | Product Owner / Designer | Open |
| K-n-C logo design. | Product Owner | Open |
| Final flip, match and win sounds. | Designer | Open |
| Greeting page (R1) copy, photos, layout. | Product Owner | Open |
| Should the end screen show a best score in two-player? (Not currently.) | Product Owner | Open |
| Accept the proposed accessibility constraint (§2.3) into product.md? | Product Owner | **Resolved:** accepted in `product.md`; slot-specific treatment added in §2.1 and §3.9. |

---

## Revision 2 change map

| Finding | Change | Sections |
| ------- | ------ | -------- |
| B1 | DS-025 (Close + Escape) and DS-026 (focus management) added and demonstrated | §3.10, §4.3, §5.1, §5.7, §6 |
| B2 | Preview limited to first open; live board kept behind the popup | §3.7, §3.10, §4.3 |
| C1 | No confirm on New Game; confirm on Go when in progress; nothing destroyed before Go | §3.10, §3.16, §5.1 |
| C2 | Timer pauses under the popup and resumes on Close | §3.4, §3.10 |
| C3 | Splash date eyebrow removed | §3.1 |
| C4 | Reset defined | §3.10 |
| C5 | Contrast measured; Kira/Calvin darkened; placeholder opacity removed | §1.1, §2.2 |
| C6 | Decisions recorded and applied | §3.3, §3.10, §3.11, §3.14, §5.4, §5.10, §10 |
| C7 | Permanent birthday splash behind the build-time flag `permanentBirthday` (R38); default build on, `dated-birthday` build restores the cutoff for the splash | §3.1, §5.5, §10 |
| C8 | Two players checkbox replaced by Kira and Calvin player checkboxes; player assignment no longer uses the cutoff | §3.10, §4.3, §5.5, §6, §10 |
| Note: R36 | Added to DS-016 | §3.14, §6 |
| Note: accessibility | Proposed product.md constraint text | §2.1, §2.3 |
| Note: R29 | Historical revision-2 decision; superseded 2026-10-12 by the required diamond medallion for every alternate slot recoloring | §2.1, §3.9 |

---

## Post-approval amendments

| Date | Change | Sections | Authority |
| ---- | ------ | -------- | --------- |
| 2026-10-12 | Proposed the slot-based SVG variant design: conservative allow-lists for all ten activities, exact alternate treatments (including multi-variable slots), an alternate-only diamond medallion, centered unstretched square-art placement, board/reveal legibility and color-blind gates, updated test semantics, traceability and role-owned open items. Retires the four difference types, H + 55° rule and `data-difference`. | §2.1–§2.3, DS-008, DS-009, DS-012, §5.5, §6, §7, §10 | Designer revision based on Moderator-approved Product Owner baseline; proposed for Moderator approval. |
| 2026-10-11 | Card test hooks aligned with the STEP-04 build: the card testid is `board-card-button-{index}` with state in `data-state="down\|up\|peeked\|gone"` (adds `peeked`, drops the state suffix on the id); `data-variant` is `base\|alternate`, the domain `VariantId` values, not `1\|2`. No user-facing change. | §3.8, §3.9 | Moderator decision on QA STEP-04 N2. Test-hook names and domain type names are Tech Lead authority (Authority Boundary above); no code change needed. |

---

MOD-W v5.0.1
