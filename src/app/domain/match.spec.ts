import { buildDeck } from './deck';
import { cardsMatch, faceKey, groupByFace, sameFace } from './match';
import { DeckCard, FaceId, GameOptions } from './types';

const card = (id: string, themeId: string, variantId: FaceId['variantId']): DeckCard => ({
  id,
  faceId: { themeId, variantId },
});

function fixedRandom(values: readonly number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe('cardsMatch (R12, AC12)', () => {
  it('matches two cards with the same theme and variant', () => {
    expect(cardsMatch(card('c1', 'dance', 'base'), card('c2', 'dance', 'base'))).toBe(true);
  });

  it('does not match the same theme with a different variant', () => {
    expect(cardsMatch(card('c1', 'dance', 'base'), card('c2', 'dance', 'alternate'))).toBe(false);
  });

  it('does not match different themes, even with the same variant', () => {
    expect(cardsMatch(card('c1', 'dance', 'base'), card('c2', 'art', 'base'))).toBe(false);
    expect(cardsMatch(card('c1', 'dance', 'alternate'), card('c2', 'art', 'alternate'))).toBe(
      false,
    );
  });

  it('never matches a card with itself', () => {
    const a = card('c1', 'dance', 'base');
    expect(cardsMatch(a, a)).toBe(false);
  });

  it('ignores card IDs, so copies from different pair entries match', () => {
    expect(cardsMatch(card('card-0-0', 'a', 'base'), card('card-9-1', 'a', 'base'))).toBe(true);
  });
});

describe('matching on dealt decks', () => {
  const repeated: GameOptions = {
    players: ['kira'],
    variants: true,
    fill: true,
    fillCount: 40,
    themes: ['a', 'b'],
  };

  it('matches any two copies of a repeated pair, wherever they sit', () => {
    const deck = buildDeck(repeated, fixedRandom([0.31, 0.77, 0.12, 0.58]));
    // Four pair identities over 40 cards: each face has ten copies.
    const groups = groupByFace(deck);
    expect([...groups.values()].map((group) => group.length)).toEqual([10, 10, 10, 10]);
    for (const group of groups.values()) {
      for (const first of group) {
        for (const second of group) {
          expect(cardsMatch(first, second)).toBe(first.id !== second.id);
        }
      }
    }
  });

  it('agrees with face identity for every pair of cards in the deck', () => {
    const deck = buildDeck(repeated, fixedRandom([0.9, 0.1, 0.5]));
    let matches = 0;
    for (const [i, first] of deck.entries()) {
      for (const second of deck.slice(i + 1)) {
        const expected = sameFace(first.faceId, second.faceId);
        expect(cardsMatch(first, second)).toBe(expected);
        matches += expected ? 1 : 0;
      }
    }
    // 4 faces x C(10, 2) matching positions.
    expect(matches).toBe(4 * 45);
  });

  it('does not let a variant sibling match across the same theme', () => {
    const deck = buildDeck({ ...repeated, themes: ['a'], fill: false }, fixedRandom([0.4]));
    const [base, alternate] = ['base', 'alternate'].map((variant) =>
      deck.filter((c) => c.faceId.variantId === variant),
    );
    expect(base).toHaveLength(2);
    expect(alternate).toHaveLength(2);
    expect(cardsMatch(base[0], alternate[0])).toBe(false);
    expect(cardsMatch(base[0], base[1])).toBe(true);
  });
});

describe('faceKey and groupByFace', () => {
  it('keys distinct faces apart even when IDs contain separators', () => {
    const faces: FaceId[] = [
      { themeId: 'a:b', variantId: 'base' },
      { themeId: 'a', variantId: 'base' },
      { themeId: 'a', variantId: 'alternate' },
    ];
    expect(new Set(faces.map(faceKey)).size).toBe(3);
  });

  it('groups cards by face identity without remainder', () => {
    const groups = groupByFace([
      card('1', 'a', 'base'),
      card('2', 'b', 'base'),
      card('3', 'a', 'base'),
      card('4', 'b', 'base'),
    ]);
    expect([...groups.values()].map((group) => group.map((c) => c.id))).toEqual([
      ['1', '3'],
      ['2', '4'],
    ]);
  });
});
