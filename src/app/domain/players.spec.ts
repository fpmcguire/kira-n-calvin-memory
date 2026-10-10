import { assignPlayers } from './players';
import { ChildId, Cutoff } from './types';

const cutoff: Cutoff = {
  localDateTime: '2026-10-11T00:00',
  timeZone: 'America/Denver',
  player: 'kira',
};
const children: readonly ChildId[] = ['kira', 'calvin'];

describe('assignPlayers (R4, DS-020, AC4)', () => {
  describe('before the cutoff', () => {
    it('forces Kira as the single player whatever the random roll', () => {
      for (const roll of [0, 0.5, 0.99]) {
        expect(assignPlayers(false, true, cutoff, children, () => roll)).toEqual({
          mode: 'single',
          players: ['kira'],
          first: 'kira',
        });
      }
    });

    it('forces Kira first in two-player and keeps header order Kira, Calvin', () => {
      for (const roll of [0, 0.5, 0.99]) {
        expect(assignPlayers(true, true, cutoff, children, () => roll)).toEqual({
          mode: 'two',
          players: ['kira', 'calvin'],
          first: 'kira',
        });
      }
    });

    it('takes the forced player from the cutoff record, not from a constant', () => {
      const forCalvin: Cutoff = { ...cutoff, player: 'calvin' };
      expect(assignPlayers(false, true, forCalvin, children, () => 0).first).toBe('calvin');
    });
  });

  describe('after the cutoff', () => {
    it('randomizes the single player and can select both Kira and Calvin', () => {
      expect(assignPlayers(false, false, cutoff, children, () => 0)).toEqual({
        mode: 'single',
        players: ['kira'],
        first: 'kira',
      });
      expect(assignPlayers(false, false, cutoff, children, () => 0.99)).toEqual({
        mode: 'single',
        players: ['calvin'],
        first: 'calvin',
      });
    });

    it('randomizes the first player of two-player and keeps header order Kira, Calvin', () => {
      const kiraFirst = assignPlayers(true, false, cutoff, children, () => 0);
      const calvinFirst = assignPlayers(true, false, cutoff, children, () => 0.99);
      expect(kiraFirst).toEqual({ mode: 'two', players: ['kira', 'calvin'], first: 'kira' });
      expect(calvinFirst).toEqual({ mode: 'two', players: ['kira', 'calvin'], first: 'calvin' });
    });

    it('re-rolls on every call, as on Go and Restart', () => {
      const rolls = [0, 0.99, 0];
      let index = 0;
      const random = () => rolls[index++];
      const seen = [0, 1, 2].map(() => assignPlayers(false, false, cutoff, children, random).first);
      expect(seen).toEqual(['kira', 'calvin', 'kira']);
    });
  });
});
