import { TestBed } from '@angular/core/testing';
import { EDITION } from '../content/edition';
import { groupByFace } from '../domain/match';
import { cardCount, withTheme, resetOptions } from '../domain/options';
import { Clock } from './clock';
import { GameState } from './game-state';
import { Random } from './random';

const BEFORE = new Date('2026-10-10T18:00:00Z');
const AFTER = new Date('2026-10-11T06:00:00Z');

/** Pins the clock and returns a state whose random roll is the mutable `roll.value`. */
function setup(now: Date, initialRoll = 0.9) {
  const roll = { value: initialRoll };
  TestBed.configureTestingModule({
    providers: [
      GameState,
      { provide: Clock, useValue: { now: () => now } },
      { provide: Random, useValue: { next: () => roll.value } },
    ],
  });
  return { state: TestBed.inject(GameState), roll };
}

describe('GameState domain integration', () => {
  it('deals no deck before the first Go and previews the draft count', () => {
    const { state } = setup(BEFORE);
    expect(state.deal()).toBeNull();
    expect(state.previewCount()).toBe(20);
  });

  it('deals a deck of exactly the applied card count on Go (R9, R8)', () => {
    const { state } = setup(BEFORE);
    state.draft.update((draft) => ({ ...draft, variants: true }));
    state.go();
    expect(state.deal()?.cards).toHaveLength(40);
    expect(state.previewCount()).toBe(40);
    expect(state.deal()?.cards).toHaveLength(cardCount(state.applied()!));
  });

  it('deals exactly the fill count with whole pairs, even for one theme (R10, R11)', () => {
    const { state } = setup(BEFORE);
    state.draft.set({
      ...withTheme(resetOptions(), 'dance', true),
      fill: true,
      fillCount: 40,
    });
    state.go();
    const cards = state.deal()?.cards ?? [];
    expect(cards).toHaveLength(40);
    expect(state.previewCount()).toBe(40);
    expect([...groupByFace(cards).values()].map((group) => group.length)).toEqual([40]);
  });

  it('assigns a difference type from the edition to every applied theme (R28)', () => {
    const { state } = setup(BEFORE);
    state.go();
    const edition = TestBed.inject(EDITION);
    const differences = state.deal()?.differences ?? {};
    expect(Object.keys(differences).sort()).toEqual(edition.themes.map((t) => t.id).sort());
    for (const type of Object.values(differences)) {
      expect(edition.differenceTypes).toContain(type);
    }
  });

  it('keeps Kira single and first before the cutoff, whatever the roll (R4, DS-020)', () => {
    const { state } = setup(BEFORE, 0.99);
    state.go();
    expect(state.assignment()).toEqual({ mode: 'single', players: ['kira'], first: 'kira' });

    state.draft.update((draft) => ({ ...draft, twoPlayers: true }));
    state.go();
    expect(state.assignment()).toEqual({
      mode: 'two',
      players: ['kira', 'calvin'],
      first: 'kira',
    });
    expect(state.players().map((p) => [p.id, p.active])).toEqual([
      ['kira', true],
      ['calvin', false],
    ]);
  });

  it('rolls the first player again on every Go after the cutoff (R4)', () => {
    const { state, roll } = setup(AFTER, 0.99);
    state.draft.update((draft) => ({ ...draft, twoPlayers: true }));
    state.go();
    expect(state.assignment().first).toBe('calvin');
    expect(state.players().map((p) => [p.id, p.active])).toEqual([
      ['kira', false],
      ['calvin', true],
    ]);

    roll.value = 0;
    state.go();
    expect(state.assignment().first).toBe('kira');
    expect(state.players().map((p) => [p.id, p.active])).toEqual([
      ['kira', true],
      ['calvin', false],
    ]);
  });
});
