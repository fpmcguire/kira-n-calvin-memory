import { RandomSource } from './random';
import { ChildId, PlayerAssignment } from './types';

/**
 * Players for a Go or Restart, from the checked children (R4, DS-020). One child is
 * single-player with that child. Two children is two-player with a random first player,
 * rolled again on every call. Players are listed in edition order (Kira, Calvin).
 */
export function assignPlayers(
  selected: readonly ChildId[],
  children: readonly ChildId[],
  random: RandomSource,
): PlayerAssignment {
  const players = children.filter((child) => selected.includes(child));
  if (players.length === 1) {
    return { mode: 'single', players, first: players[0] };
  }
  const first = players[Math.min(players.length - 1, Math.floor(random() * players.length))];
  return { mode: 'two', players, first };
}
