import { assignPlayers } from './players';
import { ChildId } from './types';

const children: readonly ChildId[] = ['kira', 'calvin'];

describe('assignPlayers (R4, DS-020)', () => {
  describe('one child checked', () => {
    it('makes Kira the single player whatever the random roll', () => {
      for (const roll of [0, 0.5, 0.99]) {
        expect(assignPlayers(['kira'], children, () => roll)).toEqual({
          mode: 'single',
          players: ['kira'],
          first: 'kira',
        });
      }
    });

    it('makes Calvin the single player whatever the random roll', () => {
      for (const roll of [0, 0.5, 0.99]) {
        expect(assignPlayers(['calvin'], children, () => roll)).toEqual({
          mode: 'single',
          players: ['calvin'],
          first: 'calvin',
        });
      }
    });
  });

  describe('both children checked', () => {
    it('randomizes the first player and keeps header order Kira, Calvin', () => {
      expect(assignPlayers(['kira', 'calvin'], children, () => 0)).toEqual({
        mode: 'two',
        players: ['kira', 'calvin'],
        first: 'kira',
      });
      expect(assignPlayers(['kira', 'calvin'], children, () => 0.99)).toEqual({
        mode: 'two',
        players: ['kira', 'calvin'],
        first: 'calvin',
      });
      expect(assignPlayers(['kira', 'calvin'], children, () => 1).first).toBe('calvin');
    });

    it('keeps header order Kira, Calvin whatever order the boxes were checked in', () => {
      expect(assignPlayers(['calvin', 'kira'], children, () => 0).players).toEqual([
        'kira',
        'calvin',
      ]);
    });

    it('re-rolls on every call, as on Go and Restart', () => {
      const rolls = [0, 0.99, 0];
      let index = 0;
      const random = () => rolls[index++];
      const seen = [0, 1, 2].map(() => assignPlayers(['kira', 'calvin'], children, random).first);
      expect(seen).toEqual(['kira', 'calvin', 'kira']);
    });
  });
});
