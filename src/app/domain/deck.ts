import { assignDifferences } from './difference';
import { RandomSource, shuffle } from './random';
import {
  Deal,
  DeckCard,
  DifferenceType,
  GameOptions,
  PairIdentity,
  ThemeId,
  VariantId,
} from './types';

/** Variant IDs in play: both pairs per theme with variants on, `base` only otherwise (R9). */
function variantIds(variants: boolean): readonly VariantId[] {
  return variants ? ['base', 'alternate'] : ['base'];
}

/** Every distinct pair identity the checked themes can supply (R9). */
export function pairSupply(themes: readonly ThemeId[], variants: boolean): PairIdentity[] {
  const ids = variantIds(variants);
  return [...new Set(themes)].flatMap((themeId) =>
    ids.map((variantId): PairIdentity => ({ themeId, variantId })),
  );
}

/** Pairs a fill count asks for. Whole pairs only, so the count must be a positive even integer. */
function pairsNeeded(fillCount: number): number {
  if (!Number.isInteger(fillCount) || fillCount <= 0 || fillCount % 2 !== 0) {
    throw new RangeError(`Fill count must be a positive even integer, got ${fillCount}`);
  }
  return fillCount / 2;
}

/**
 * Step one of deck building: the list of pairs for these options (R9-R11).
 *
 * - Fill off: every pair the checked themes supply.
 * - Fill on, supply >= need (R10): checked themes in random order, each contributing
 *   its variant pairs, until the pair count is met.
 * - Fill on, supply < need (R11): the full supply repeated round-robin, then a random
 *   remainder of distinct pair identities, so no pair identity appears more than one
 *   extra time than another (Architecture: balanced by pair identity).
 */
export function selectPairs(options: GameOptions, random: RandomSource): PairIdentity[] {
  const themes = [...new Set(options.themes)];
  if (themes.length === 0) {
    return [];
  }
  const supply = pairSupply(themes, options.variants);
  if (!options.fill) {
    return supply;
  }

  const need = pairsNeeded(options.fillCount);
  if (supply.length >= need) {
    const pairs: PairIdentity[] = [];
    for (const themeId of shuffle(themes, random)) {
      for (const variantId of variantIds(options.variants)) {
        if (pairs.length < need) {
          pairs.push({ themeId, variantId });
        }
      }
      if (pairs.length >= need) {
        break;
      }
    }
    return pairs;
  }

  const wholeRounds = Math.floor(need / supply.length);
  const pairs: PairIdentity[] = Array.from({ length: wholeRounds }, () => supply).flat();
  pairs.push(...shuffle(supply, random).slice(0, need % supply.length));
  return pairs;
}

/**
 * Step two: double each pair into two cards and shuffle (OBS-009). Card IDs are
 * assigned before the shuffle so they differ from grid positions.
 */
export function doubleAndShuffle(pairs: readonly PairIdentity[], random: RandomSource): DeckCard[] {
  const cards = pairs.flatMap((face, pairIndex): DeckCard[] => [
    { id: `card-${pairIndex}-0`, faceId: face },
    { id: `card-${pairIndex}-1`, faceId: face },
  ]);
  return shuffle(cards, random);
}

/** Pure deck builder: pair list, then double and shuffle (R9-R12). */
export function buildDeck(options: GameOptions, random: RandomSource): DeckCard[] {
  return doubleAndShuffle(selectPairs(options, random), random);
}

/**
 * Deals a fresh game: the deck plus a difference type per selected theme (R28).
 * Call again for Go and Restart so cards and differences are re-rolled together.
 */
export function dealGame(
  options: GameOptions,
  allowedDifferences: readonly DifferenceType[],
  random: RandomSource,
): Deal {
  return {
    cards: buildDeck(options, random),
    differences: assignDifferences(options.themes, allowedDifferences, random),
  };
}
