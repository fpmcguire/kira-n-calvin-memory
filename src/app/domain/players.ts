import { choosePlayer } from './cutoff';
import { RandomSource } from './random';
import { ChildId, Cutoff, PlayerAssignment } from './types';

/**
 * Rolls the players for a Go or Restart (R4, DS-020). Before the cutoff the cutoff
 * player is the single player and goes first; after it the single player or first
 * player is random. Two-player always lists every child in edition order.
 */
export function assignPlayers(
  twoPlayers: boolean,
  beforeCutoff: boolean,
  cutoff: Cutoff,
  children: readonly ChildId[],
  random: RandomSource,
): PlayerAssignment {
  const first = choosePlayer(beforeCutoff, cutoff, children, random);
  return twoPlayers
    ? { mode: 'two', players: children, first }
    : { mode: 'single', players: [first], first };
}
