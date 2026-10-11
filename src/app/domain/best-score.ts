import { cardCount } from './options';
import { ChildId, GameOptions } from './types';

/** A single-player device score on one board (R36, DS-024). Fewest attempts wins. */
export interface BestScore {
  readonly attempts: number;
  /** Elapsed play time; supporting data only, never decides the best. */
  readonly timeMs: number;
}

/** What a finished single-player game means for the player's best on its board (DS-016). */
export type BestOutcome =
  | { readonly kind: 'new'; readonly best: BestScore }
  | { readonly kind: 'kept'; readonly best: BestScore };

/** Board key: card count plus variants on/off (DS-024, C6). */
export function boardKey(options: GameOptions): string {
  return `${cardCount(options)}-${options.variants ? 'variants' : 'plain'}`;
}

/** Best scores are kept per player on each board (DS-024). */
export function bestScoreKey(player: ChildId, options: GameOptions): string {
  return `${player}:${boardKey(options)}`;
}

/** Only strictly fewer attempts replace a best; equal or worse keeps the stored one (STEP-05 AC9). */
export function judgeBest(previous: BestScore | null, score: BestScore): BestOutcome {
  if (previous === null || score.attempts < previous.attempts) {
    return { kind: 'new', best: score };
  }
  return { kind: 'kept', best: previous };
}
