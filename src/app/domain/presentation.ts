import { randomInt, RandomSource } from './random';
import { EligibleSlotTreatment, GamePresentation, ThemeId, ThemePresentation } from './types';

/**
 * Selects one eligible slot and its approved treatment for every theme, once per game
 * (R28, DS-009). Each theme's allow-list is sampled uniformly with the injected random
 * source: no entry is preferred or weighted. Pass the distinct themes actually dealt, in a
 * stable order, and call again for Go and Restart to reroll.
 *
 * Nothing here touches face identity: the result is presentation data keyed by theme (R12).
 */
export function selectGamePresentation(
  themes: readonly ThemeId[],
  eligibleFor: (themeId: ThemeId) => readonly EligibleSlotTreatment[],
  random: RandomSource,
): GamePresentation {
  const selection: Record<ThemeId, ThemePresentation> = {};
  for (const themeId of new Set(themes)) {
    const eligible = eligibleFor(themeId);
    if (eligible.length === 0) {
      throw new RangeError(`Theme "${themeId}" has no eligible slot to vary`);
    }
    const chosen = eligible[randomInt(random, eligible.length)];
    selection[themeId] = Object.freeze({
      slotId: chosen.slotId,
      treatmentId: chosen.treatmentId,
      properties: chosen.properties,
      cueId: 'diamond-medallion',
    });
  }
  return Object.freeze(selection);
}
