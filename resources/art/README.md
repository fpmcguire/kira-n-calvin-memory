# Card SVG format

Every card is one `<svg viewBox="0 0 200 200">` whose children are top-level `<g>` groups in paint order (back to front).
Do not reorder them: the draw order is what makes each card render exactly like the Claude Design original.

| Attribute | Meaning |
| --- | --- |
| `data-group="non-variant"` | Identical on every copy of the card: skin, head, hair, glasses, ear rings, shadow, background scene. Carries `data-part`. |
| `data-group="variant"` | May differ between the two pairs of an activity: clothing, shoes, hats, props, sparkles. Carries `data-slot`. |
| `data-slot` | Variant slot name (`top`, `bottoms`, `skirt`, `shoes`, `note-1`, ...). One slot can span several groups when the paint order interleaves it with skin. Group `id`s get a `-1`, `-2` suffix then. |
| `data-owner`, `data-activity` | On the root `<svg>`: Kira or Calvin, and the activity. |

Select with the attributes, not the ids: `svg.querySelectorAll('[data-group="variant"]')`, `[data-slot="shoes"]`.

## Recoloring (R28)
Each variant slot exposes CSS custom properties named after the slot: `--top`, `--bottoms`, `--shoes`, `--note-1`, ...
A slot with a second color also has `--<slot>-2`. The SVG must be inlined for them to apply. Defaults are the original colors.

`manifest.json` lists, per card, the non-variant groups, the variant slots, their group ids, and each variable with its default color.

The base face uses the manifest defaults. An alternate face recolors exactly one eligible slot with that slot's approved treatment, which comes from the edition content. The per-activity allow-list and treatments are decided in `mod-w/design-spec.md` DS-009 (§3.9.1, §3.9.2). No slot is preferred.

## Variant cue and rendering (R29)
The alternate-only diamond medallion belongs to the card-face component. It is not embedded in these SVGs.

Test hooks are `board-card-button-{index}`, `data-state` and `data-variant` on the card button. The visible face root carries `data-variant-slot` and `data-treatment-id` (alternate faces only) and `data-cue-present` (`true` on alternate faces, `false` on base faces). `data-difference` is retired.

The SVG is loaded, sanitized and explicitly trusted only inside the repository service, then rendered inline so the treatment's CSS custom properties reach it. Static images such as the logo still use `NgOptimizedImage`. Inline base64 images are not allowed. `mod-w/architecture.md` is authoritative for the hooks and this boundary.
