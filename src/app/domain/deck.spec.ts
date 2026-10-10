import { buildDeck, dealGame, doubleAndShuffle, pairSupply, selectPairs } from './deck';
import { groupByFace } from './match';
import { cardCount } from './options';
import { RandomSource } from './random';
import { DeckCard, GameOptions, ThemeId } from './types';

const TEN_THEMES: readonly ThemeId[] = Array.from({ length: 10 }, (_, i) => `t${i}`);
const FILL_COUNTS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

/** Fisher-Yates with this source is the identity permutation. */
const identity: RandomSource = () => 0.999999;
/** Fisher-Yates with this source is a fixed, non-identity permutation. */
const zero: RandomSource = () => 0;

/** Seeded mulberry32 so randomized paths are repeatable. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function options(
  themes: readonly ThemeId[],
  variants: boolean,
  fillCount: number | null,
): GameOptions {
  return {
    twoPlayers: false,
    variants,
    fill: fillCount !== null,
    fillCount: fillCount ?? 4,
    themes,
  };
}

/** Every non-empty subset of the ten themes (1023 of them). */
function allSubsets(): ThemeId[][] {
  const subsets: ThemeId[][] = [];
  for (let mask = 1; mask < 1 << TEN_THEMES.length; mask++) {
    subsets.push(TEN_THEMES.filter((_, bit) => (mask & (1 << bit)) !== 0));
  }
  return subsets;
}

/** Copies (cards / 2) of each pair identity, keyed by `themeId/variantId`. */
function copiesByPair(deck: readonly DeckCard[]): Map<string, number> {
  const copies = new Map<string, number>();
  for (const card of deck) {
    const key = `${card.faceId.themeId}/${card.faceId.variantId}`;
    copies.set(key, (copies.get(key) ?? 0) + 0.5);
  }
  return copies;
}

/**
 * Checks every deck invariant and returns a list of problems (empty when valid), so a
 * 20,000-deck matrix reports failures without one `expect` per property.
 */
function problems(deck: readonly DeckCard[], opts: GameOptions): string[] {
  const found: string[] = [];
  const variantIds = opts.variants ? ['base', 'alternate'] : ['base'];
  const supply = opts.themes.length * variantIds.length;
  const expectedCards = opts.fill ? opts.fillCount : supply * 2;

  if (deck.length !== expectedCards) {
    found.push(`count ${deck.length} !== ${expectedCards}`);
  }
  if (deck.length !== cardCount(opts)) {
    found.push(`count ${deck.length} !== cardCount ${cardCount(opts)}`);
  }
  if (deck.length % 2 !== 0) {
    found.push('odd card count');
  }
  if (new Set(deck.map((card) => card.id)).size !== deck.length) {
    found.push('duplicate card ids');
  }

  for (const card of deck) {
    if (!opts.themes.includes(card.faceId.themeId)) {
      found.push(`illegal theme ${card.faceId.themeId}`);
    }
    if (!variantIds.includes(card.faceId.variantId)) {
      found.push(`illegal variant ${card.faceId.variantId}`);
    }
  }

  const groups = groupByFace(deck);
  for (const [key, group] of groups) {
    if (group.length % 2 !== 0 || group.length < 2) {
      found.push(`orphan face ${key} x${group.length}`);
    }
  }

  const copies = copiesByPair(deck);
  if (!opts.fill) {
    if (copies.size !== supply || [...copies.values()].some((n) => n !== 1)) {
      found.push('fill off must use every pair identity exactly once');
    }
    return found;
  }

  const need = opts.fillCount / 2;
  if (supply >= need) {
    // R10: no repeats, whole theme variant pairs, at most one half-used theme.
    if (copies.size !== need || [...copies.values()].some((n) => n !== 1)) {
      found.push(`R10 expects ${need} distinct pairs without repeats`);
    }
    if (opts.variants) {
      const halves = opts.themes.filter(
        (theme) => copies.has(`${theme}/base`) !== copies.has(`${theme}/alternate`),
      );
      if (halves.length > 1) {
        found.push(`R10 split ${halves.length} themes`);
      }
      if (halves.some((theme) => copies.has(`${theme}/alternate`))) {
        found.push('R10 half theme must hold the base variant');
      }
    }
  } else {
    // R11: every pair identity present, repeated round-robin, at most one extra copy.
    const floor = Math.floor(need / supply);
    if (copies.size !== supply) {
      found.push(`R11 expects all ${supply} pair identities, got ${copies.size}`);
    }
    for (const [key, n] of copies) {
      if (n !== floor && n !== floor + 1) {
        found.push(`R11 ${key} x${n} outside ${floor}..${floor + 1}`);
      }
    }
  }
  return found;
}

describe('pairSupply', () => {
  it('lists one base pair per theme with variants off and both pairs with variants on (R9)', () => {
    expect(pairSupply(['a', 'b'], false)).toEqual([
      { themeId: 'a', variantId: 'base' },
      { themeId: 'b', variantId: 'base' },
    ]);
    expect(pairSupply(['a', 'b'], true)).toEqual([
      { themeId: 'a', variantId: 'base' },
      { themeId: 'a', variantId: 'alternate' },
      { themeId: 'b', variantId: 'base' },
      { themeId: 'b', variantId: 'alternate' },
    ]);
  });

  it('ignores a theme checked twice', () => {
    expect(pairSupply(['a', 'a'], false)).toHaveLength(1);
  });
});

describe('fill off (AC5, AC6)', () => {
  it('variants off: one pair, two cards per selected theme', () => {
    const deck = buildDeck(options(['t2', 't5', 't8'], false, null), seeded(1));
    expect(deck).toHaveLength(6);
    expect(problems(deck, options(['t2', 't5', 't8'], false, null))).toEqual([]);
  });

  it('variants on: two variant pairs, four cards per selected theme', () => {
    const opts = options(['t2', 't5', 't8'], true, null);
    const deck = buildDeck(opts, seeded(1));
    expect(deck).toHaveLength(12);
    expect(groupByFace(deck).size).toBe(6);
    expect(problems(deck, opts)).toEqual([]);
  });

  it('ten themes with variants on is the full 40-card board', () => {
    expect(buildDeck(options(TEN_THEMES, true, null), seeded(2))).toHaveLength(40);
  });
});

describe('full selected-themes x variants x fill matrix (AC5-AC11)', () => {
  const subsets = allSubsets();
  const sources: readonly [string, (seed: number) => RandomSource][] = [
    ['seeded', seeded],
    ['zero', () => zero],
    ['identity', () => identity],
  ];

  it('covers every non-empty subset of the ten themes', () => {
    expect(subsets).toHaveLength(1023);
  });

  for (const variants of [false, true]) {
    for (const fillCount of [null, ...FILL_COUNTS]) {
      const label = `variants ${variants ? 'on' : 'off'}, ${
        fillCount === null ? 'fill off' : `fill ${fillCount}`
      }`;
      it(`${label}: exact count, whole pairs, legal themes and variants, no orphans`, () => {
        const failures: string[] = [];
        let seed = 0;
        for (const themes of subsets) {
          const opts = options(themes, variants, fillCount);
          for (const [name, make] of sources) {
            const issues = problems(buildDeck(opts, make(seed++)), opts);
            if (issues.length > 0) {
              failures.push(`[${themes.join(',')}] ${name}: ${issues.join('; ')}`);
            }
          }
        }
        expect(failures.slice(0, 5)).toEqual([]);
      });
    }
  }
});

describe('fill on, more supply than needed (R10, AC8)', () => {
  const checked = ['t1', 't4', 't7', 't9'];

  it('uses only checked themes and includes whole variant pairs per theme', () => {
    const opts = options(checked, true, 8); // 4 pairs from 8 available
    for (let seed = 0; seed < 25; seed++) {
      const deck = buildDeck(opts, seeded(seed));
      const copies = copiesByPair(deck);
      const themes = new Set(deck.map((card) => card.faceId.themeId));
      expect(themes.size).toBe(2);
      for (const theme of themes) {
        expect(checked).toContain(theme);
        expect(copies.get(`${theme}/base`)).toBe(1);
        expect(copies.get(`${theme}/alternate`)).toBe(1);
      }
    }
  });

  it('picks themes in the order the random source shuffles them', () => {
    const opts = options(['a', 'b', 'c', 'd'], false, 4);
    expect(selectPairs(opts, identity).map((pair) => pair.themeId)).toEqual(['a', 'b']);
    expect(selectPairs(opts, zero).map((pair) => pair.themeId)).toEqual(['b', 'c']);
  });

  it('can reach every checked theme across rolls', () => {
    const opts = options(checked, false, 4);
    const seen = new Set<ThemeId>();
    for (let seed = 0; seed < 50; seed++) {
      selectPairs(opts, seeded(seed)).forEach((pair) => seen.add(pair.themeId));
    }
    expect([...seen].sort()).toEqual(checked);
  });

  it('uses every pair exactly once when supply equals need', () => {
    const opts = options(['a', 'b', 'c'], false, 6);
    const pairs = selectPairs(opts, seeded(3));
    expect(pairs.map((pair) => pair.themeId).sort()).toEqual(['a', 'b', 'c']);
  });

  it('keeps variants on at 40 cards with ten themes: all twenty pairs, none repeated', () => {
    const opts = options(TEN_THEMES, true, 40);
    expect(problems(buildDeck(opts, seeded(4)), opts)).toEqual([]);
    expect(copiesByPair(buildDeck(opts, seeded(4))).size).toBe(20);
  });

  it('gives a half-used theme only its base pair when the pair count is odd (engine edge)', () => {
    const opts = options(['a', 'b', 'c'], true, 6); // 3 pairs: one whole theme + one base
    const pairs = selectPairs(opts, identity);
    expect(pairs).toEqual([
      { themeId: 'a', variantId: 'base' },
      { themeId: 'a', variantId: 'alternate' },
      { themeId: 'b', variantId: 'base' },
    ]);
  });
});

describe('fill on, less supply than needed (R11, AC9, AC10)', () => {
  it('repeats one face 20 times for one theme, variants off, 40 cards', () => {
    const opts = options(['t3'], false, 40);
    const deck = buildDeck(opts, seeded(5));
    expect(deck).toHaveLength(40);
    expect(groupByFace(deck).size).toBe(1);
    expect(copiesByPair(deck).get('t3/base')).toBe(20);
    expect(problems(deck, opts)).toEqual([]);
  });

  it('splits one theme with variants on evenly across both pairs at 40 cards', () => {
    const opts = options(['t3'], true, 40);
    const copies = copiesByPair(buildDeck(opts, seeded(6)));
    expect(copies.get('t3/base')).toBe(10);
    expect(copies.get('t3/alternate')).toBe(10);
  });

  it('three themes, variants off, 40 cards: 7, 7 and 6 copies', () => {
    const opts = options(['a', 'b', 'c'], false, 40);
    const copies = [...copiesByPair(buildDeck(opts, seeded(7))).values()].sort();
    expect(copies).toEqual([6, 7, 7]);
  });

  it('three themes, variants on, 40 cards: no pair more than one extra time', () => {
    const opts = options(['a', 'b', 'c'], true, 40);
    const copies = [...copiesByPair(buildDeck(opts, seeded(8))).values()].sort();
    expect(copies).toEqual([3, 3, 3, 3, 4, 4]);
  });

  it('chooses the leftover pairs through the random source so they can be re-rolled', () => {
    const opts = options(['a', 'b', 'c'], false, 40);
    const extra = (random: RandomSource) => {
      const copies = copiesByPair(buildDeck(opts, random));
      return [...copies].filter(([, n]) => n === 7).map(([key]) => key);
    };
    expect(extra(identity).sort()).toEqual(['a/base', 'b/base']);
    expect(extra(zero).sort()).toEqual(['b/base', 'c/base']);
  });

  it('repeats the whole supply twice for ten themes, variants off, 40 cards', () => {
    const opts = options(TEN_THEMES, false, 40);
    expect([...copiesByPair(buildDeck(opts, seeded(9))).values()]).toEqual(Array(10).fill(2));
  });
});

describe('determinism and inputs', () => {
  it('builds the same deck from the same seed and different decks from other seeds', () => {
    const opts = options(TEN_THEMES, true, null);
    const a = buildDeck(opts, seeded(11));
    expect(buildDeck(opts, seeded(11))).toEqual(a);
    expect(buildDeck(opts, seeded(12))).not.toEqual(a);
  });

  it('shuffles cards so ids do not follow grid position', () => {
    const deck = buildDeck(options(TEN_THEMES, true, null), seeded(13));
    const sequential = deck.every(
      (card, index) => card.id === `card-${Math.floor(index / 2)}-${index % 2}`,
    );
    expect(sequential).toBe(false);
  });

  it('doubles a pair list into exactly two cards per pair, in order with an identity shuffle', () => {
    const cards = doubleAndShuffle(
      [
        { themeId: 'a', variantId: 'base' },
        { themeId: 'b', variantId: 'alternate' },
      ],
      identity,
    );
    expect(cards.map((card) => card.id)).toEqual(['card-0-0', 'card-0-1', 'card-1-0', 'card-1-1']);
    expect(cards.map((card) => card.faceId.themeId)).toEqual(['a', 'a', 'b', 'b']);
  });

  it('builds an empty deck when no theme is checked, even with fill on', () => {
    expect(buildDeck(options([], false, null), seeded(1))).toEqual([]);
    expect(buildDeck(options([], true, 40), seeded(1))).toEqual([]);
  });

  it('rejects a fill count that cannot make whole pairs', () => {
    for (const bad of [0, -4, 5, 2.5, Number.NaN]) {
      expect(() => buildDeck(options(['a'], false, bad), seeded(1))).toThrow(RangeError);
    }
  });

  it('does not mutate the options it is given', () => {
    const opts = options(['a', 'b'], true, 8);
    const copy = structuredClone(opts);
    buildDeck(opts, seeded(1));
    expect(opts).toEqual(copy);
  });
});

describe('dealGame', () => {
  it('returns the deck with a difference type for every selected theme', () => {
    const opts = options(['t1', 't2'], true, 40);
    const deal = dealGame(opts, ['color', 'pattern'], seeded(21));
    expect(deal.cards).toHaveLength(40);
    expect(Object.keys(deal.differences).sort()).toEqual(['t1', 't2']);
  });

  it('re-rolls the deck and the differences together from the random source', () => {
    const opts = options(TEN_THEMES, true, null);
    const allowed = ['color', 'pattern', 'accessory', 'orientation'] as const;
    const first = dealGame(opts, allowed, seeded(31));
    const again = dealGame(opts, allowed, seeded(31));
    const next = dealGame(opts, allowed, seeded(32));
    expect(again).toEqual(first);
    expect(next.cards).not.toEqual(first.cards);
    expect(next.differences).not.toEqual(first.differences);
  });
});
