# Design Spec - Kira-n-Calvin Memory Game

**Date:** 2026-10-10
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

- **Status:** Pending
- **Reviewer:**
- **Date:**
- **Conditions or findings:**

### Tech Lead feasibility pre-review

- **Status:** Pending
- **Reviewer:**
- **Date:**
- **Feasibility concerns:**
- **Architecture questions:**

### Moderator gate

- **Status:** Pending
- **Moderator:**
- **Date:**
- **Conditions:**

Product Owner and Moderator approval are required before this spec becomes authoritative within its boundary. Tech Lead pre-review is advisory and does not transfer architecture authority. Approval of this spec does not make the prototype authoritative.

---

## DESIGN.md Policy

`design-spec.md` is the canonical MOD-W design artifact. A separate `DESIGN.md` is optional project documentation for broader design-system foundations, brand language, or durable visual principles.

When both exist, `DESIGN.md` contains reusable principles and global design-system guidance; `design-spec.md` contains product-specific screens, components, states, interactions, traceability, and approval. Reference `DESIGN.md` instead of duplicating token catalogues here.

No `DESIGN.md` exists for this project. The token values in §1 live here until one is created.

---

## Design Principles

- **Clear:** one obvious action at a time. During a reveal the only thing to do is look, then tap.
- **Consistent:** one card composition, scaled from the grid up to the large reveal.
- **Minimal:** no tutorial, no in-game birthday messages, no decoration on the table.
- **Accessible:** large tap targets, keyboard play, and a non-color cue for variant differences.
- **Made for looking:** the design invites close inspection, through the large side-by-side reveal and small, deliberate variant differences.

---

## 1. Visual Identity

All colors are given in OKLCH, the values used in the prototype.

### 1.1 Color Palette

**Surfaces and ink**

| Role | Value | Use |
| ---- | ----- | --- |
| Table / page background | `oklch(0.95 0.03 85)` | Warm cream table; also stat tiles on the end screen. |
| Header surface | `oklch(0.98 0.015 85)` | Header bar. |
| Dialog surface | `oklch(0.99 0.01 85)` | Options popup, end screen, confirm. |
| Ink | `oklch(0.27 0.03 60)` | Primary text. |
| Line / control border | `oklch(0.88 0.04 80)` (header rule, inactive player block), `oklch(0.85 0.04 80)` (secondary buttons) | 2 px borders. |
| Divider | `oklch(0.92 0.03 80)` | Section rules inside the options popup. |
| Secondary button fill | `#fff` | Show All, Sound, Restart, Reset, stepper buttons. |

**Brand**

| Role | Value | Use |
| ---- | ----- | --- |
| K-n-C Navy | `oklch(0.32 0.09 275)` | Card back, logo mark, splash background, primary "New Game" button, checkbox accent. |
| Navy dot | `oklch(0.40 0.10 275)` | Dot texture on card backs. |
| Cream on navy | `oklch(0.95 0.03 85)` / `oklch(0.96 0.03 85)` / `oklch(0.97 0.02 85)` | Text and logo strokes on navy; the card-back inner frame uses `oklch(0.9 0.05 85)` at 55%. |
| Kira | `oklch(0.62 0.17 35)` (red-panda orange) | Kira's name chip, player name, Go and "Start over" buttons, Kira checkbox accent. |
| Kira heading | `oklch(0.55 0.17 35)` | "Kira" column heading in the popup. |
| Kira active tint | `oklch(0.93 0.06 35)` | Active player block background. |
| Calvin | `oklch(0.55 0.13 240)` (blue) | Calvin's name chip, player name, Calvin checkbox accent. |
| Calvin heading | `oklch(0.50 0.13 240)` | "Calvin" column heading. |
| Calvin active tint | `oklch(0.93 0.06 240)` | Active player block background. |
| Birthday eyebrow | `oklch(0.80 0.12 35)` | "Saturday, October 10" on the splash. |

**Scrims**

| Role | Value |
| ---- | ----- |
| Reveal scrim | `oklch(0.22 0.04 60 / .72)` |
| Popup / confirm scrim | `oklch(0.25 0.04 60 / .45)` |
| End-screen scrim | `oklch(0.25 0.04 60 / .5)` |

**Theme hues (card faces)**

Card face background: `oklch(0.86 0.09 H)`. Card face ink: `oklch(0.32 0.09 H)`.

| Theme | Child | Hue H |
| ----- | ----- | ----- |
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

Confetti uses `oklch(0.75 0.15 H)` for each of the ten theme hues.

### 1.2 Typography

| Role | Family | Weight | Size / line-height |
| ---- | ------ | ------ | ------------------ |
| Splash headline (birthday) | Baloo 2 | 800 | `clamp(52px, 11vw, 120px)` / 0.95, −0.02em |
| Splash title (generic) | Baloo 2 | 800 | `clamp(32px, 6vw, 60px)` / 1 |
| Splash eyebrow | Nunito | 800 | `clamp(18px, 3vw, 24px)`, uppercase, +0.14em |
| End title | Baloo 2 | 800 | 40px / 1 |
| Reveal title | Baloo 2 | 800 | `clamp(22px, 4vw, 34px)` / 1 |
| Dialog titles ("New game", "Start over?") | Baloo 2 | 800 | 28px / 1 |
| Header title "Memory Game" | Baloo 2 | 800 | 20px / 1 |
| Player name | Baloo 2 | 800 | 17px / 1.1 |
| Timer value | Baloo 2 | 800 | 20px / 1, tabular numerals |
| Stat value (end screen) | Baloo 2 | 800 | 32px / 1, tabular numerals |
| Buttons | Baloo 2 | 700 (Go 800) | 15px header, 17px dialog, 18px end, 19px Go |
| Option labels | Nunito | 700 | 17px (game options), 16px (themes) |
| Body / hints / summaries | Nunito | 700 | 13–18px |
| Card name chip | Baloo 2 | 800 | 9 cqw (scales with card width) |
| Card activity name | Baloo 2 | 800 | 11.5 cqw / 1.02, balanced wrap |
| Placeholder art label | system monospace | 600 | 6.5 cqw (placeholder only; removed with real art) |

Both families are loaded from Google Fonts with weights 500/700/800. Numbers in scores and times use tabular figures.

### 1.3 Spacing & Layout System

- Base rhythm is 2 px multiples. Common steps: 2, 6, 8, 10, 12, 14, 16, 18, 20, 24 px.
- Header: padding 10 px × 16 px, row gap 10 px, column gap 16 px. Wraps onto several lines on narrow screens.
- Table: 16 px padding on all sides. The grid is centered horizontally and vertically within it.
- Grid gap: 6 px when the table is narrower than 520 px, else 10 px.
- Card: 3:4 portrait. Minimum width 52 px (table < 520 px) or 64 px; maximum 220 px. Internal padding 7 cqw, internal gap 4 cqw.
- Reveal card width: `min(42vw, 52vh, 340px)`. Gap between the two cards `clamp(12px, 3vw, 32px)`.
- Dialogs: max width 560 px (options), 440 px (end), 360 px (confirm); padding 24 px (end: 28/24/24); internal gap 18 px (options, confirm) or 14 px (end).
- Tap targets: every button and checkbox row is at least 44 px tall. Primary dialog buttons are 48–52 px.

### 1.4 Borders, Radius & Elevation

| Element | Radius | Border | Elevation |
| ------- | ------ | ------ | --------- |
| Card (back and face) | 8 cqw | Face: inset 1 px `rgba(0,0,0,.08)`. Back: inner frame 1.2 cqw cream at 55%, inset 6 cqw. | Back: `0 2px 0 oklch(0.22 0.07 275), 0 4px 10px rgba(40,30,80,.18)`. Face: `0 4px 10px rgba(60,40,20,.18)`. |
| Reveal card | 8 cqw | — | `0 12px 40px rgba(0,0,0,.35)` |
| Options popup / end screen | 24 px | — | `0 20px 60px rgba(60,40,20,.3)` |
| Confirm | 22 px | — | same as above |
| Player block / timer | 14 px | 2 px | none |
| Stat tile | 16 px | — | none |
| Buttons | pill (99 px) | 2 px on secondary | none |
| Logo mark | circle | Splash: 6 px cream. Card back: 1.2 cqw cream. | none |

### 1.5 Tone & Personality

Warm, playful and personal, with the calm of a family table game rather than an arcade. Copy is short and spoken to the child: "Match!", "Not a match", "Tap a card to continue", "Well done, Kira!", "Kira wins!", "It's a tie!", "Start over?", "Keep playing". The product is always called a "memory game". There are no birthday messages after the splash.

---

## 2. Accessibility Baseline

### 2.1 Requirements

- WCAG 2.2 AA compliance for all text, controls and focus indicators.
- Keyboard navigation required: Tab moves through cards and controls. Enter or Space selects a card, skips the splash and dismisses a mismatch reveal (R33).
- Visible focus states: a **custom** focus ring of at least 3:1 against both the table and the card is required. The prototype uses browser defaults only, so this is a gap to close.
- Tap targets of at least 44 × 44 px. Cards are at least 52 px wide (≈69 px tall).
- Variant differences must never rely on color alone. When the difference type is color, a secondary pattern cue is applied (R29).
- When a dialog or the reveal opens, focus must move into it, stay inside it while it is open, and return to a sensible element afterward. (Not in the prototype; required.)
- Cards announce state through their accessible name: face down → "Card N, face down"; face up → "{Child}: {Activity}". Matched cards leave the tab order.
- Motion: flip, reveal and confetti animations should respect `prefers-reduced-motion` with an instant or fade alternative. (Not in the prototype; required.)
- Sound is never the only feedback channel. Every sound has a matching visual state.

### 2.2 Known contrast risks (to be measured before approval)

- White text on Kira orange `oklch(0.62 0.17 35)`: the card name chip, the Go button and the "Start over" button. Suspected below 4.5:1. Go and "Start over" use bold text of 17–19 px, which may qualify as large text (3:1), but the card name chip is small.
- Placeholder art label at 65% opacity (goes away with real art).
- "Tap to start" at 60% opacity on navy.
- Disabled controls at 40–45% opacity. WCAG exempts disabled controls, but they should still be legible.

---

## 3. Component Library

**data-testid convention:** `{feature}-{component}-{element}-{modifier?}`, kebab-case. The modifier is used for indexes and variants, for example `board-card-button-12` and `options-theme-checkbox-snowboard`. The prototype does not include data-testids; the values below are proposed.

### 3.1 Splash (DS-001)

- **Purpose:** Brief opening moment (~3 s) before the board; birthday greeting before the cutoff, brand title after.
- **States:** Showing (auto-advance timer running); dismissed (tap, Enter or Space).
- **Variants:** `birthday`: "Saturday, October 10" eyebrow, "Happy Birthday Kira!" (placeholder content per R2), "Tap to start". `generic`: K-n-C logo mark and "Kira-n-Calvin Memory Game", "Tap to start".
- **data-testid:** `splash-screen-root-{birthday|generic}`, `splash-screen-skip`.

### 3.2 Game Header (DS-002)

- **Purpose:** Persistent top bar with brand, scores and game actions.
- **States:** Default; wraps to several rows on narrow screens.
- **Variants:** Single-player (one player block + timer); two-player (Kira and Calvin blocks, no timer).
- **Contents, left to right:** logo mark (40 px navy circle, "K-n-C" 13 px) + "Memory Game"; player blocks; timer; action buttons (Show All, Sound, Restart, New Game).
- **data-testid:** `header-bar-root`, `header-logo-mark`.

### 3.3 Player Score Block (DS-003)

- **Purpose:** Shows a player's name, attempts and pairs matched.
- **States:** Inactive (white fill, 2 px line border); active (child tint fill, 2 px child-color border; two-player during play only).
- **Variants:** Kira, Calvin. Always named Kira and Calvin. In two-player the order is always Kira then Calvin.
- **data-testid:** `header-player-block-{kira|calvin}`, `…-attempts`, `…-pairs`, modifier `-active`.

### 3.4 Timer (DS-004)

- **Purpose:** Running time in single-player (R20).
- **States:** Running (during play, including reveals and Show All); frozen (end screen shows final time).
- **Variants:** Single-player only. Hidden in two-player and before the first game.
- **Format:** `m:ss`, tabular numerals. "TIME" label in 12 px uppercase.
- **data-testid:** `header-timer-value`.

### 3.5 Header Action Button (DS-005)

- **Purpose:** Pill buttons for Show All, Sound, Restart and New Game.
- **States:** Default; disabled (45% opacity, no action); focus (custom ring required); pressed (`aria-pressed` on Sound).
- **Variants:** Secondary (white fill, 2 px border): Show All, Sound, Restart. Primary (navy fill, cream text): New Game.
- **Disabled rules:** Show All is disabled unless play is between turns. Restart is disabled before the first game and while the options popup is open.
- **data-testid:** `header-action-button-{show-all|sound|restart|new-game}`.

### 3.6 Sound Toggle (DS-006)

- **Purpose:** Turns flip, match and win sounds on or off (R31).
- **States:** On ("Sound on", `aria-pressed=true`); Off ("Sound off").
- **Variants:** none.
- **data-testid:** `header-action-button-sound-{on|off}`.

### 3.7 Board / Table (DS-007)

- **Purpose:** The play area that lays cards out in a responsive grid.
- **States:** Empty (no cards); preview (face-down backs behind the options popup, `dealt` mode); in play; with empty slots; scrolling (when the minimum card size cannot fit every card).
- **Variants:** none.
- **data-testid:** `board-grid-root`.

### 3.8 Card (DS-008)

- **Purpose:** One playing card: shared K-n-C back, illustrated face.
- **States:**
  - Face down (default): navy back, dot texture, cream inner frame, centered K-n-C mark.
  - Face up: shown with a 3D flip.
  - Peeked: face up during Show All.
  - Locked: no visual change; input ignored.
  - Matched/gone: fades out and scales to 0.85, then hidden. Its slot stays in place with no border.
  - Focus: custom ring required.
- **Variants:** Face content per theme × variant (see 3.9). The back is identical for every card (R30).
- **Face composition, top to bottom:** child name chip (Kira orange or Calvin blue, white text); illustration area (placeholder: dashed frame with diagonal stripes); activity name. Corner flag at the bottom; optional badge.
- **data-testid:** `board-card-button-{index}`, modifier `-down|-up|-gone`.

### 3.9 Card Face Variant Cues (DS-009)

- **Purpose:** Make the two variants of an activity differ slightly so matching needs careful looking (R9, R28, R29).
- **Difference types** (one is picked at random per theme for each game):
  - **Color:** variant 2 hue = theme hue + 55°. When the secondary cue is on, variant 2 also gets a white dot pattern.
  - **Pattern:** variant 1 has diagonal white stripes; variant 2 has white dots.
  - **Accessory:** variant 1 has a circle badge; variant 2 has a star badge (top corner).
  - **Orientation:** variant 2 mirrors the layout. The name chip moves right, the corner flag moves right, the stripe direction flips and the badge side flips. With real art the illustration itself should mirror.
- **States:** Variants off → every face uses variant 1 with no difference cues.
- **data-testid:** expose on the card as `data-variant="{1|2}"` and `data-difference="{type}"` for tests only. Never shown visually.

### 3.10 Options Popup (DS-010)

- **Purpose:** Choose players, variants, fill the grid and themes before each game (R6).
- **Structure:** Title "New game". Three checkboxes (Two players, Variants, Fill the grid); stepper when fill is on; divider; two theme columns headed "Kira" and "Calvin"; divider; summary, Reset and Go.
- **States:** First open (themes per open question, prototype default all); reopened by New Game (current settings filled in, R24); no themes checked (Go disabled, summary "Pick at least one theme"); valid (summary "N cards · N/2 pairs").
- **Variants:** none.
- **data-testid:** `options-dialog-root`, `options-toggle-checkbox-{two-players|variants|fill}`, `options-theme-checkbox-{themeId}`, `options-action-button-{reset|go}`, `options-summary-text`.

### 3.11 Fill-the-Grid Stepper (DS-011)

- **Purpose:** Set an exact card count from 4 to 40 in steps of 4 (R8).
- **States:** Hidden (fill off); visible; at minimum (−); at maximum (+). The prototype clamps silently at the ends; disabled end buttons are recommended.
- **Variants:** none. Combines −/+ buttons (44 px circles), a range slider and the current value (22 px).
- **data-testid:** `options-fill-stepper-{decrement|slider|increment|value}`.

### 3.12 Card Count Summary (DS-019)

- **Purpose:** Tells the player how big the board will be before pressing Go.
- **States:** Valid ("20 cards · 10 pairs"); empty ("Pick at least one theme").
- **data-testid:** `options-summary-text`.

### 3.13 Pair Reveal Overlay (DS-012)

- **Purpose:** Shows the two flipped cards large and side by side on every turn (R15).
- **States:**
  - Match: title "Match!", no hint, default cursor; auto-dismisses after the match pause.
  - Mismatch: title "Not a match", hint "Tap a card to continue". Clicking either card, or pressing Enter or Space, dismisses it. Clicking the scrim does nothing.
- **Variants:** none.
- **data-testid:** `reveal-overlay-root-{match|mismatch}`, `reveal-card-button-{1|2}`, `reveal-hint-text`.

### 3.14 End Screen (DS-016)

- **Purpose:** Shows the result with celebration and offers next steps (R21, R22).
- **States/variants:**
  - Single-player: title "Well done, {Player}!" in the player's color; stats "attempts" and "time"; note "New best for this board!" or "Best on N cards: X attempts".
  - Two-player winner: "{Winner} wins!" in the winner's color; stats "Kira's pairs" and "Calvin's pairs". When pairs are equal and the tie is broken by turns, the note reads "Same pairs — {Winner} took fewer turns (N)."
  - Two-player tie: "It's a tie!" in navy.
- **Actions:** Restart (secondary) and New Game (primary), 52 px tall, side by side.
- **data-testid:** `end-dialog-root-{single|winner|tie}`, `end-stat-tile-{n}`, `end-action-button-{restart|new-game}`.

### 3.15 Confetti (DS-017)

- **Purpose:** Celebration behind the end card (R21).
- **States:** Falling (loops while the end screen is open). Reduced-motion alternative required.
- **Variants:** 70 pieces in theme colors; round or slightly rounded rectangles 8–16 × 12–22 px; falls over 2.6–5 s with a staggered start of 0–2 s and rotates 720°.
- **data-testid:** `end-confetti-root`.

### 3.16 Start Over Confirm (DS-018)

- **Purpose:** Prevents losing a game in progress (R25).
- **States:** Shown only when a game is in progress (at least one attempt made and the game not ended).
- **Actions:** "Keep playing" (secondary) and "Start over" (Kira orange). "Start over" carries out the original Restart or New Game.
- **data-testid:** `confirm-dialog-root`, `confirm-action-button-{cancel|confirm}`.

---

## 4. Screen Layouts

### 4.1 Splash (DS-001)

Full-viewport navy layer above everything. Content is centered in a column with a 24 px gap and 24 px padding. "Tap to start" sits 28 px from the bottom. The whole surface is the tap target. Type scales with `clamp()` from phone to tablet. No responsive layout changes beyond that.

### 4.2 Game Shell (DS-002, DS-007)

Full-viewport column: header (auto height) above the table (fills the rest). The page itself never scrolls; only the table scrolls, and only as a last resort.

**Header responsive behavior:** three flex groups (brand, scores, actions) wrap independently. On phone portrait the header typically takes 2–3 rows: brand, then scores, then actions.

**Grid responsive behavior (R13, R14):**

1. The available table width W and height H are measured (minus 16 px padding).
2. For each column count c from 1 to n: card width = min((W − gaps) / c, ((H − gaps) / rows) × 3/4). The largest width wins.
3. If that width is below the minimum (52 or 64 px), use the minimum and as many columns as fit. The table then scrolls vertically.
4. Card width is capped at 220 px.
5. Cards are placed in source order. An incomplete last row is left-aligned and the grid block is centered.
6. On resize or rotation, steps 1–5 run again. The order never changes; only the wrapping does. Empty slots keep their positions in the order.

### 4.3 Options Popup (DS-010)

Centered over the board on a light scrim. Width `min(560px, 100%)`, max height viewport − 32 px, and scrolls internally if needed. Theme columns stay side by side at every width (two equal columns), each label at least 44 px tall. The footer wraps on narrow screens: summary on the left, then Reset and Go on the right.

### 4.4 Pair Reveal (DS-012)

Full-viewport dark scrim. Column: title, the two cards in a row, hint line (28 px reserved height so the layout does not jump). Card size is limited by width (42vw), height (52vh) and a 340 px cap, so the pair stays side by side in both orientations.

### 4.5 End Screen (DS-016)

Centered card `min(440px, 100%)` over a scrim, with confetti falling behind the card across the full viewport. Stat tiles wrap at 110 px minimum width.

### 4.6 Confirm (DS-018)

Centered card `min(360px, 100%)`, two equal buttons.

### 4.7 Greeting page (R1)

Not designed. Depends on open question "What does the website greeting page say, and does it include photos?" and the site's existing folder-per-occasion pattern.

---

## 5. Interaction Patterns

### 5.1 Flow

Splash (~3 s or tap) → board + options popup → Go → play → end screen → Restart (same options, fresh deal, no popup) or New Game (popup with current settings).

### 5.2 Turn (DS-013, DS-014)

1. Tap a face-down card: it flips (0.4 s) and plays the flip sound.
2. Tap a second card: it flips, the attempt is counted for the current player, and input locks.
3. After ~0.42 s the reveal opens (pop-in 0.28 s).
4. **Match:** match sound plays. After the match pause (default 1.5 s) the reveal closes, both cards fade out and shrink (0.35 s), pairs +1, and the same player goes again. When the table is empty, the end screen opens after ~0.55 s with the win sound.
5. **Mismatch:** the reveal stays until a revealed card is tapped (or Enter/Space). The cards turn face down and, in two-player, the turn passes to the other player.

### 5.3 Show All (DS-015)

Allowed only between turns (no card flipped, no reveal). Every remaining card flips face up for ~3 s, the current player's attempts go up by 1, the turn does not change, the timer keeps running and input is locked until the cards flip back.

### 5.4 Players and cutoff (DS-020)

Before the cutoff (2026-10-11 00:00 America/Denver): the single player is Kira and Kira goes first in two-player. After: the single player and the first player are random. This is rolled at each Go and each Restart, along with the deck and the difference types.

### 5.5 Selection, hover, focus

- Cards are buttons. Selection is shown only by the flip; no extra highlight.
- Custom focus ring required on cards and all controls (see §2).
- No hover effects are specified for touch-first play. Pointer cursor on interactive elements.

### 5.6 Keyboard navigation (DS-023)

- Tab / Shift-Tab move through header actions and cards in grid order. Matched cards are skipped.
- Enter / Space: select the focused card, skip the splash, dismiss a mismatch reveal.
- Focus moves into each dialog on open and returns afterward (required, not in the prototype).

### 5.7 Transitions (DS-022)

| Motion | Duration / easing |
| ------ | ----------------- |
| Card flip | 0.4 s, `cubic-bezier(.3,.7,.3,1)`, 3D Y-axis rotation, 900 px perspective |
| Card disappear | 0.35 s opacity → 0 and scale → 0.85 |
| Reveal open | scrim fade 0.2 s; cards pop 0.28 s with slight overshoot |
| Dialog open | fade 0.15–0.3 s; card pop 0.25–0.35 s |
| Active player highlight | 0.25 s background/border |
| Confetti | 2.6–5 s linear loop |

### 5.8 Sound (DS-021)

Flip: short high tone. Match: three-note rising arpeggio. Win: four-note rising arpeggio. All muted when Sound is off. Final sound design is open.

### 5.9 Memory on the device (DS-024)

Last-used options are saved when Go is pressed and restored the next time the popup opens. The single-player best (fewest attempts) is saved per board and shown on the end screen. How best scores are keyed is open.

---

## 6. Design Traceability

| Design ID | Design element | Product requirement | Prototype evidence | First implementation Step | Notes |
| --------- | -------------- | ------------------- | ------------------ | ------------------------- | ----- |
| DS-001 | Splash screen (birthday / generic) | R2, R3 | Load page; `cutoffMode` before/after | TBD | Birthday content is placeholder per R2. |
| DS-002 | Game header | R19, R20, R31 | Header bar on every screen after the splash | TBD | |
| DS-003 | Player score block | R19, R4 | Header; two-player game shows active highlight | TBD | |
| DS-004 | Single-player timer | R20, R26 | Header in single-player; keeps running in Show All | TBD | |
| DS-005 | Header action buttons | R22, R23, R24, R26, R31 | Header right group | TBD | |
| DS-006 | Sound toggle | R31 | "Sound on/off" button | TBD | Placeholder tones. |
| DS-007 | Board and responsive grid | R5, R13, R14 | Resize preview; 4 and 40 card boards | TBD | Scroll fallback per Assumptions. |
| DS-008 | Card (back, face, states) | R12, R16, R27, R30, R32 | Any game | TBD | Face art is placeholder (R27 open). |
| DS-009 | Variant difference cues | R9, R28, R29 | Variants on; play several games | TBD | Four types, random per theme per game. |
| DS-010 | Options popup | R5, R6, R7, R24 | After splash; New Game | TBD | |
| DS-011 | Fill-the-grid stepper | R8 | Check "Fill the grid" | TBD | |
| DS-012 | Pair reveal overlay | R15, R17, R18 | Flip any two cards | TBD | |
| DS-013 | Match resolution | R12, R16 | Flip a matching pair | TBD | |
| DS-014 | Mismatch and turn handoff | R17, R4 | Flip a non-matching pair in two-player | TBD | |
| DS-015 | Show All | R26 | Show All between turns | TBD | |
| DS-016 | End screen | R21, R22 | Clear a 4-card board | TBD | No birthday message (Non-Goal 5). |
| DS-017 | Confetti | R21, R32 | End screen | TBD | Needs reduced-motion alternative. |
| DS-018 | "Start over?" confirm | R25 | Restart/New Game after ≥1 attempt | TBD | |
| DS-019 | Card count summary | R8, R9 | Options popup footer | TBD | |
| DS-020 | Cutoff-driven player assignment | R3, R4 | `cutoffMode` before/after, single and two-player | TBD | |
| DS-021 | Sound cues | R31 | Flip, match, win | TBD | Final sounds open. |
| DS-022 | Motion set | R32 | Flip, disappear, reveal, dialogs | TBD | |
| DS-023 | Keyboard interaction and focus | R33 | Tab + Enter/Space | TBD | Focus ring and focus management not in prototype. |
| DS-024 | Remembered options and best score | R36 | Reload after Go; finish two single-player games | TBD | Nice to have. |

**Requirements without design coverage in this spec:** R1 (greeting page, not designed), R10–R11 (deck-building rules; the visible result is DS-007/DS-019, the rules themselves are product logic), R34 (hosting), R35 (content separation; structural, no UI). R27 is only partly covered: the face layout is designed, but the art is pending.

---

## 7. Domain Language Proposals

No `domain-language.md` exists yet. All terms below are proposals for the Tech Lead.

| Proposed term | Form (type / value / both) | Definition | Rationale | First appearance |
| ------------- | -------------------------- | ---------- | --------- | ---------------- |
| Theme | both | One of the ten activities, owned by Kira or Calvin. | Used in product.md and on screen. | Options popup |
| Variant | both | Variant 1 or 2 of a theme's face; only variant 1 when variants are off. | product.md R9. | Card face |
| Difference type | value | How two variants differ: color, pattern, accessory, orientation. Picked per theme per game. | product.md R28. | Card face |
| Face | type | The visible identity of a card (theme + variant). Two cards match when their faces are equal. | product.md R12 "face identity". | Matching |
| Pair | type | Two cards with the same face. | Common game term; on screen ("pairs"). | Header, summary |
| Attempt | value | Turning over two cards (or one Show All). | On screen; product.md R19, R26. | Header |
| Reveal | type | The large side-by-side display of the two flipped cards. | product.md R15. | Overlay |
| Show All | value | Timed peek at every remaining card. | product.md R26. | Header |
| Fill the grid | value | Option that sets an exact card count from 4 to 40. | product.md R8. | Options popup |
| Table | value | The play area that holds the board. | product.md R13, R16. | Game shell |
| Cutoff | type | The data-driven instant that switches birthday behavior off. | product.md R3. | Splash, players |
| Empty slot | value | The grid position left by a matched card. | product.md R16. | Board |

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
| Which themes are checked on first open: all or none? Prototype default: all. | Product Owner | Open |
| Starting value of fill the grid? Prototype: 20. | Product Owner | Open |
| Cards dealt face down behind the popup, or empty until Go? Prototype default: dealt (count preview). | Product Owner | Open |
| Minimum card size: prototype uses 52 px (narrow) / 64 px. Confirm on real devices with 40 cards. | Designer | Proposed |
| Difference type list: color, pattern, accessory, orientation. Confirm, and confirm that color always carries the secondary cue. | Designer / Product Owner | Proposed |
| Likeness source (photos or described traits) and art direction for Squishies and Red Pandas. | Product Owner / Designer | Open |
| K-n-C logo design. | Product Owner | Open |
| Final flip, match and win sounds. | Designer | Open |
| Best score key: card count only (prototype), or full option set and/or player? | Product Owner | Open |
| Does one flipped card (no attempt yet) count as "game in progress" for R25? | Product Owner | Open |
| Two-player header order: fixed Kira/Calvin (prototype), or first player first? | Product Owner | Open |
| Greeting page (R1) copy, photos and layout. | Product Owner | Open |
| Is the "Saturday, October 10" eyebrow on the birthday splash acceptable placeholder content? | Product Owner | Open |
| Should the end screen show the best score in two-player? (Not currently.) | Product Owner | Open |

---

MOD-W v5.0.1
