export interface BoardLayout {
  readonly columns: number;
  /** Card width in px; height is always 4/3 of it (R13). */
  readonly cardWidth: number;
  readonly gap: number;
}

const NARROW_TABLE = 520;
const MIN_CARD_NARROW = 52;
const MIN_CARD_WIDE = 64;
const MAX_CARD = 220;
const CARD_RATIO = 3 / 4;

/** Table width used before the first measurement, and in environments without layout. */
const FALLBACK_CARD = 80;

/**
 * Largest 3:4 cards that fit `count` cards into the measured table content box
 * (design-spec 4.2, R13, OBS-003). Tries every column count and keeps the widest card.
 * Below the minimum size it uses the minimum with as many columns as fit, and the
 * table scrolls vertically as a last resort. The result never depends on card order,
 * so a resize only re-wraps (R14).
 */
export function fitBoard(count: number, width: number, height: number): BoardLayout {
  const narrow = width < NARROW_TABLE;
  const gap = narrow ? 6 : 10;
  const min = narrow ? MIN_CARD_NARROW : MIN_CARD_WIDE;

  if (count <= 0 || width <= 0 || height <= 0) {
    return { columns: Math.max(count, 1), cardWidth: FALLBACK_CARD, gap };
  }

  let columns = 1;
  let cardWidth = 0;
  for (let c = 1; c <= count; c++) {
    const rows = Math.ceil(count / c);
    const byWidth = (width - (c - 1) * gap) / c;
    const byHeight = ((height - (rows - 1) * gap) / rows) * CARD_RATIO;
    const fitted = Math.min(byWidth, byHeight);
    if (fitted > cardWidth) {
      columns = c;
      cardWidth = fitted;
    }
  }

  if (cardWidth < min) {
    columns = Math.max(1, Math.min(count, Math.floor((width + gap) / (min + gap))));
    cardWidth = min;
  }
  return { columns, cardWidth: Math.floor(Math.min(cardWidth, MAX_CARD)), gap };
}
