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
      players: ['kira'],
      fill: true,
      fillCount: 40,
    });
    state.go();
    const cards = state.deal()?.cards ?? [];
    expect(cards).toHaveLength(40);
    expect(state.previewCount()).toBe(40);
    expect([...groupByFace(cards).values()].map((group) => group.length)).toEqual([40]);
  });

  describe('per-game presentation (R28, DS-009, AC4)', () => {
    const variantsOn = (state: GameState) =>
      state.draft.update((draft) => ({ ...draft, variants: true }));
    const eligible = (themeId: string) =>
      TestBed.inject(EDITION).themes.find((theme) => theme.id === themeId)!.art
        .eligibleSlotTreatments;

    it('selects one eligible slot and its approved treatment for every dealt theme', () => {
      const { state } = setup(BEFORE, 0.5);
      variantsOn(state);
      state.go();
      const edition = TestBed.inject(EDITION);
      const presentation = state.deal()?.presentation ?? {};
      expect(Object.keys(presentation).sort()).toEqual(edition.themes.map((t) => t.id).sort());
      for (const [themeId, selected] of Object.entries(presentation)) {
        const entry = eligible(themeId).find((candidate) => candidate.slotId === selected.slotId);
        expect(entry, themeId).toBeDefined();
        expect(selected.treatmentId).toBe(entry!.treatmentId);
        expect(selected.properties).toEqual(entry!.properties);
        expect(selected.cueId).toBe('diamond-medallion');
      }
    });

    it('creates no selection, treatment or cue with variants off', () => {
      const { state } = setup(BEFORE, 0.5);
      state.go();
      expect(state.deal()?.presentation).toEqual({});
      for (const view of state.cardViews()) {
        expect(view.face.variant).toBe('base');
        expect(view.face.treatment).toBeNull();
        expect(view.face.cuePresent).toBe(false);
      }
    });

    it('gives both cards of a face, and every repeated copy, the same selection', () => {
      const { state } = setup(BEFORE, 0.3);
      state.draft.update((draft) => ({
        ...withTheme(resetOptions(), 'dance', true),
        players: ['kira'],
        variants: true,
        fill: true,
        fillCount: 40,
      }));
      state.go();
      const alternates = state
        .cardViews()
        .map((view) => view.face)
        .filter((face) => face.variant === 'alternate');
      expect(alternates).toHaveLength(20);
      expect(new Set(alternates.map((face) => JSON.stringify(face.treatment))).size).toBe(1);
      expect(alternates[0].cuePresent).toBe(true);
      const bases = state
        .cardViews()
        .map((view) => view.face)
        .filter((face) => face.variant === 'base');
      expect(bases.every((face) => face.treatment === null && !face.cuePresent)).toBe(true);
    });

    it('rerolls the selection on Go and on Restart', () => {
      const { state, roll } = setup(BEFORE, 0);
      variantsOn(state);
      state.go();
      const first = state.deal()?.presentation;
      const firstSlots = Object.values(first ?? {}).map((entry) => entry.slotId);
      expect(Object.keys(first ?? {}).map((id) => first![id].slotId)).toEqual(
        TestBed.inject(EDITION).themes.map((theme) => eligible(theme.id)[0].slotId),
      );

      roll.value = 0.99;
      state.restart();
      const restarted = state.deal()?.presentation;
      const last = (themeId: string) => eligible(themeId)[eligible(themeId).length - 1].slotId;
      expect(Object.keys(restarted ?? {}).map((id) => restarted![id].slotId)).toEqual(
        TestBed.inject(EDITION).themes.map((theme) => last(theme.id)),
      );
      expect(restarted).not.toBe(first);
      expect(firstSlots).not.toEqual(Object.values(restarted ?? {}).map((entry) => entry.slotId));

      roll.value = 0;
      state.draft.set({ ...state.applied()!, variants: true });
      state.openOptions();
      state.go();
      expect(Object.values(state.deal()?.presentation ?? {}).map((entry) => entry.slotId)).toEqual(
        firstSlots,
      );
    });

    it('keeps the selection through flips, reveal and Show All', () => {
      const { state } = setup(BEFORE, 0.5);
      variantsOn(state);
      state.go();
      const presentation = state.deal()?.presentation;
      const treatments = state.cardViews().map((view) => view.face.treatment);

      state.selectCard(0);
      state.selectCard(1);
      expect(state.deal()?.presentation).toBe(presentation);
      expect(state.cardViews().map((view) => view.face.treatment)).toEqual(treatments);
    });

    it('keeps face identity to { themeId, variantId } with no slot data', () => {
      const { state } = setup(BEFORE, 0.5);
      variantsOn(state);
      state.go();
      for (const card of state.deal()?.cards ?? []) {
        expect(Object.keys(card.faceId).sort()).toEqual(['themeId', 'variantId']);
        expect(card.id).toMatch(/^card-\d+-[01]$/);
      }
    });
  });

  it('opens with Kira checked alone, so the pre-Go header shows Kira (R4, DS-020)', () => {
    const { state } = setup(AFTER, 0.99);
    expect(state.draft().players).toEqual(['kira']);
    expect(state.assignment()).toEqual({ mode: 'single', players: ['kira'], first: 'kira' });
  });

  it('plays the checked child alone, before and after the cutoff, whatever the roll (R4)', () => {
    for (const now of [BEFORE, AFTER]) {
      const { state } = setup(now, 0.99);
      state.go();
      expect(state.assignment()).toEqual({ mode: 'single', players: ['kira'], first: 'kira' });

      state.draft.update((draft) => ({ ...draft, players: ['calvin'] }));
      state.go();
      expect(state.assignment()).toEqual({ mode: 'single', players: ['calvin'], first: 'calvin' });
      TestBed.resetTestingModule();
    }
  });

  it('does not deal with no child checked (R7)', () => {
    const { state } = setup(BEFORE);
    state.draft.update((draft) => ({ ...draft, players: [] }));
    state.go();
    expect(state.deal()).toBeNull();
  });

  it('rolls the first player on every Go in two-player, even before the cutoff (R4)', () => {
    const { state, roll } = setup(BEFORE, 0.99);
    state.draft.update((draft) => ({ ...draft, players: ['kira', 'calvin'] }));
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
