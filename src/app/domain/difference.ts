import { randomInt, RandomSource } from './random';
import { DifferenceAssignment, DifferenceType, FaceCue, FaceId, ThemeId } from './types';

/**
 * Picks a difference type for every selected theme, once per game (R28, DS-009).
 * Call again with the random source to re-roll on Go and Restart.
 */
export function assignDifferences(
  themes: readonly ThemeId[],
  allowed: readonly DifferenceType[],
  random: RandomSource,
): DifferenceAssignment {
  if (allowed.length === 0) {
    throw new RangeError('At least one difference type must be allowed');
  }
  const assignment: Record<ThemeId, DifferenceType> = {};
  for (const theme of themes) {
    assignment[theme] = allowed[randomInt(random, allowed.length)];
  }
  return assignment;
}

/** Cue for one difference type. Color always carries the dot-pattern secondary cue (R29). */
export function cueFor(difference: DifferenceType): FaceCue {
  return { difference, secondaryCue: difference === 'color' ? 'dot-pattern' : null };
}

/**
 * Cue for a face in this game. Variants off means one variant and no cue (DS-009).
 * Presentation is derived from theme, variant, difference type and the variants
 * flag; cards carry none of it (OBS-005).
 */
export function faceCue(
  face: FaceId,
  differences: DifferenceAssignment,
  variantsOn: boolean,
): FaceCue {
  const difference = differences[face.themeId];
  if (!variantsOn || difference === undefined) {
    return { difference: null, secondaryCue: null };
  }
  return cueFor(difference);
}
