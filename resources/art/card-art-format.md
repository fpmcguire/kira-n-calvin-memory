# Card Art Format: non-variant and variant SVG groups

**Audience:** MOD-W roles for the Kira-n-Calvin Memory Game (Product Owner, Designer, Tech Lead, Development team, QA, Reviewer).
**Covers:** the ten card illustrations (5 per child) and the contract between the art and the game engine.
**Related requirements:** R9, R12, R27, R28, R29, R35. Related docs: `design-spec.md` §3.9, `architecture.md`, `domain-language.md`.

---

## 1. What this is

Each activity card is one SVG file. Inside the file, every drawn part belongs to a top-level group that is marked either **non-variant** or **variant**:

- **Non-variant groups** are the same on every copy of the card: the child's skin, head, hair, glasses, ear rings, the ground shadow and any background scene.
- **Variant groups** are the parts that are allowed to differ between the two pairs of an activity (R9): clothing, shoes, hats, props, sparkles.

The engine builds the base face from the file as it is, using the manifest defaults. It builds the alternate face by recoloring exactly one eligible variant slot with that slot's approved treatment from the edition content (R28; `design-spec.md` DS-009 §3.9.1–§3.9.2). It never touches non-variant groups or other slots, so both faces always show the same child doing the same activity.

## 2. Vocabulary (note the collision)

`domain-language.md` already defines **Variant** as one of two faces of a theme: `base` or `alternate`. The SVG format uses the same word for a different thing. To keep them apart in docs and code:

| Term | Meaning | Where it lives |
| --- | --- | --- |
| Variant (domain) | `base` or `alternate` face of a theme, part of `FaceId` | domain model, `data-variant` on a card |
| **Variant group** | A part of the illustration that may be changed to make the alternate face | SVG, `data-group="variant"` |
| **Variant slot** | The name of one changeable part, for example `skirt` or `shoes` | SVG, `data-slot` |
| Non-variant group | A part that never changes | SVG, `data-group="non-variant"` |

"Variant group", "variant slot", "eligible slot", "treatment" and "cue" are canonical terms in `domain-language.md` (Tech Lead `5719e9c`, approved by the Moderator in `45dcefd`). That file is authoritative.

## 3. File contract

```
<svg viewBox="0 0 200 200" data-owner="Kira" data-activity="Dance">
  <g id="head-back" data-group="non-variant" data-part="head-back"> ... </g>
  <g id="shadow"    data-group="non-variant" data-part="shadow">    ... </g>
  <g id="note-1"    data-group="variant"     data-slot="note-1">    ... </g>
  <g id="skin"      data-group="non-variant" data-part="skin">      ... </g>
  <g id="outfit"    data-group="variant"     data-slot="outfit">    ... </g>
  <g id="skirt"     data-group="variant"     data-slot="skirt">     ... </g>
  <g id="head"      data-group="non-variant" data-part="head">      ... </g>
</svg>
```

| Item | Rule |
| --- | --- |
| Root `<svg>` | `viewBox="0 0 200 200"` (square). `data-owner` is Kira or Calvin, `data-activity` is the activity name. No `<metadata>`. |
| Top-level children | Only `<g>` groups. Each has `id` and `data-group`. |
| `data-group` | `non-variant` or `variant`. This is the attribute code should select on. |
| `data-part` | On non-variant groups: `skin`, `head`, `head-back`, `shadow` or `scene`. |
| `data-slot` | On variant groups: the slot name. One slot can span several groups (see paint order below). |
| Group order | **DOM order is paint order (back to front). Never reorder groups.** |
| Group ids | Unique in the file. A slot that spans several groups gets suffixes: `skin-1`, `skin-2`, `top-1`, `top-2`. Select by attribute, never by id. |

### Paint order and split groups

Skin and clothing overlap in the original drawings (for example an arm is painted after the torso, then the sleeve is painted over the arm). To keep every card looking exactly like the Claude Design original, the groups follow the original paint order. Where skin and clothing interleave, one slot or part becomes two or more groups. This is expected. Treat all groups with the same `data-slot` as one slot.

### Slots per card

Common slots on most cards: `top`, `bottoms`, `shoes`. Others are specific to the activity.

| Child | Activity | Variant slots |
| --- | --- | --- |
| Kira | Dance | note-1, note-2, sparkle, outfit, shoes, skirt |
| Kira | Art | easel, bottoms, shoes, top, brush, palette |
| Kira | Snowboard | sparkle-1, sparkle-2, board, bottoms, shoes, top, gloves, helmet |
| Kira | Red Pandas | red-panda, bottoms, shoes, top, heart |
| Kira | Squishies | squishy-blue, sparkle-1, sparkle-2, shoes, top, bottoms, squishy-mint, squishy-pink |
| Calvin | Video games | pixel-heart, pixel-star, bottoms, shoes, top, controller |
| Calvin | Archery | target, bottoms, shoes, top, sleeves, cap, bow, arrow |
| Calvin | Rock climbing | hold-1 to hold-8, rope, bottoms, shoes, top, harness |
| Calvin | Drones | drone, bottoms, shoes, top, controller |
| Calvin | Gymnastics | mat, sparkle-1, sparkle-2, sparkle-3, bottoms, top |

Dance uses a single `outfit` slot because its leotard is one color; the other cards split `top` and `bottoms`.

### Color hooks

Every recolorable shape inside a variant group reads its color from a CSS custom property named after the slot, with the original color as the fallback:

```
style="fill:var(--skirt,#c9a8f0)"
```

- Slot `skirt` uses `--skirt`. A slot with a second color also has `--<slot>-2` (for example `--red-panda-2`).
- Custom properties inherit, so they can be set on the inlined `<svg>` or on an ancestor. The game sets them on the card-face art wrapper (`architecture.md`).
- The properties only work when the SVG is **inlined in the page**. An `<img>` tag ignores them.
- Shapes that carry `var(--...)` are exactly the shapes the engine may recolor. Everything else in the group keeps its fixed color (outlines, eyes on props, highlights).

### Manifest

`manifest.json` has one entry per card: file name, owner, activity, `viewBox`, the non-variant group ids with their part, and the variant slots with their group ids and `vars` (`[name, default color]` pairs). Engine and tests should read slots and defaults from the manifest instead of hard-coding them.

## 4. By role

### Product Owner

- Nothing visible changes: with default colors, each card renders identically to the approved Claude Design art (checked pixel for pixel).
- Decided: the per-activity allow-list in `design-spec.md` DS-009 §3.9.1 is confirmed and no slot is preferred (Product Owner `7da2ee0`, approved by the Moderator in `43cffb4`). The allow-list and treatments are encoded in the edition content, not in these files. QA may still remove an included slot on legibility evidence, without reweighting.
- The open question about photos versus described traits (R27) is unaffected: these illustrations use described traits only.

### Designer

- This format is the hand-off contract for any new or revised card. New art must keep: the square viewBox, top-level groups with `data-group` and `data-slot` or `data-part`, back-to-front order, and `var(--slot, default)` on recolorable shapes.
- The variant design is in `design-spec.md` DS-009: the per-activity allow-list (§3.9.1), one approved treatment per eligible slot (§3.9.2) and the diamond medallion (§3.9.3). The medallion belongs to the card-face component and is not embedded in the activity SVG. Do not add cue groups to the art.
- The legibility and color-blind gate is §3.9.4. A new or revised slot treatment must pass it at board and reveal sizes.

### Tech Lead

- **Rendering boundary (approved; `architecture.md` "Inline SVG Rendering and Trust Boundary" is authoritative):** the activity SVG is loaded, sanitized and explicitly trusted only inside the repository service. It is rendered inline so the validated CSS custom properties reach it. Static images such as the logo still use `NgOptimizedImage`. Inline base64 images are not allowed.
- Keep the files under `public/content/kira-calvin/` as planned (R35), with `manifest.json` next to them. A public edition supplies another package with the same contract.
- Add a typed interface for the manifest (card, group, slot, var) in `src/app/content/`, so the engine depends on the contract, not on file names.
- The glossary (section 2) is aligned in `domain-language.md`.

### Development team

- Select groups by attribute: `svg.querySelectorAll('[data-group="variant"]')` and `[data-slot="shoes"]`. Never by id and never by position.
- Build the alternate face by applying the selected slot's approved treatment from the edition content. Set every variable of that slot, and no other. Do not compute colors. The base face applies none and uses the manifest defaults.
- Never reorder or re-parent groups. Keep the same markup in the grid and in the reveal (one shared card face component, as `architecture.md` plans).
- Keep the engine free of Kira and Calvin specifics: slot names come from the manifest.
- Use the canonical test hooks in `architecture.md` ("Variant Cue and Test Hooks"). The card button has `board-card-button-{index}`, `data-state` and `data-variant`. The visible face root has `data-variant-slot` and `data-treatment-id` (alternate faces only) and `data-cue-present` (`true` on alternate faces, `false` on base faces). `data-difference` is retired. The SVG attributes above do not clash with them.

### QA

Automatable checks per file and per card:

| Check | Expected |
| --- | --- |
| XML valid, no `<metadata>` | Pass |
| Root has `viewBox="0 0 200 200"`, `data-owner`, `data-activity` | Pass |
| Every top-level child is a `<g>` with unique `id` and `data-group` | Pass |
| Non-variant groups have `data-part`; variant groups have `data-slot` | Pass |
| Every `var(--x, ...)` name appears in `manifest.json`, and every manifest var is used | Pass |
| Default render equals the approved original (pixel diff) | 0 differing pixels |
| Non-variant groups unchanged between base and alternate face | Identical markup |
| Alternate face differs in the intended slot only | Verified per card |

Manual checks: the `design-spec.md` §3.9.4 legibility and color-blind gate (its protocol is in `qa.md`), and rotation and re-wrap do not distort the 3:4 card (the art is square).

### Reviewer

- Review changes to art files against this contract, not by eye alone: group order, attributes, vars.
- Watch for drift: a new card or revised art that adds shapes outside a group, drops `data-group`, or hard-codes a color that should be a slot.

## 5. Open points and limits

1. **Glossary collision** for "variant" (section 2): resolved in `domain-language.md`.
2. **`NgOptimizedImage` versus inline SVG:** resolved in `architecture.md` (see Tech Lead above).
3. **R29 cue:** resolved. The diamond medallion is drawn by the card-face component (DS-009 §3.9.3). Other difference types are retired.
4. **Which slots may vary:** resolved. One eligible slot per alternate face, from the confirmed allow-list (DS-009 §3.9.1). QA legibility evidence (§3.9.4) is still open and may remove a slot.
5. **Card ratio:** the art is square; the 3:4 card frame must center it and not stretch it (R13).
6. The slot grouping is a first pass made automatically from the Claude Design output and checked visually and by pixel diff. Names and boundaries can be tuned by hand; if you change a file, keep the contract in section 3.
7. The provenance (C2PA content credentials) block that Claude Design adds to its SVGs was removed to keep the files small.
