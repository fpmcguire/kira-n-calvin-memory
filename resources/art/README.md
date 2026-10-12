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

## Recoloring (R28 color differences)
Each variant slot exposes CSS custom properties named after the slot: `--top`, `--bottoms`, `--shoes`, `--note-1`, ...
A slot with a second color also has `--<slot>-2`. The SVG must be inlined for them to apply. Defaults are the original colors.
Example: `svg.style.setProperty('--shoes', '#4fa3e0')`.

`manifest.json` lists, per card, the non-variant groups, the variant slots, their group ids, and each variable with its default color.

## Not included (manual work, R28 and R29)
Pattern, accessory-presence and orientation differences, and secondary cues for color-only differences.
