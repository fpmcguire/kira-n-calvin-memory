import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../testing/memory-storage';
import { resetOptions, withPlayer, withTheme } from '../domain/options';
import { GameOptions } from '../domain/types';
import { Clock } from './clock';
import { DEVICE_STORAGE, STORAGE_KEYS } from './game-storage';
import { GameState } from './game-state';
import { Random } from './random';
import { SoundCue, TonePlayer } from './sound';
import { END_DELAY_MS, FLIP_MS, MATCH_PAUSE_MS, SHOW_ALL_MS } from './timings';

/** Four cards of one repeated face: any two cards match. */
const SAME_FACE: GameOptions = {
  ...withTheme(resetOptions(), 'dance', true),
  players: ['kira'],
  fill: true,
  fillCount: 4,
};
const SAVED: GameOptions = {
  players: ['kira', 'calvin'],
  variants: true,
  fill: false,
  fillCount: 4,
  themes: ['dance', 'drones'],
};

const BEFORE = new Date('2026-10-10T18:00:00Z');
const AFTER = new Date('2026-10-11T06:00:00Z');

interface Setup {
  readonly device?: MemoryStorage;
  readonly start?: Date;
  readonly roll?: number;
  readonly play?: (cue: SoundCue) => void;
}

function setup({ device = new MemoryStorage(), start = BEFORE, roll = 0.9, play }: Setup = {}) {
  vi.useFakeTimers();
  vi.setSystemTime(start);
  const random = { value: roll };
  const cues: SoundCue[] = [];
  TestBed.configureTestingModule({
    providers: [
      GameState,
      { provide: Clock, useValue: { now: () => new Date() } },
      { provide: Random, useValue: { next: () => random.value } },
      { provide: DEVICE_STORAGE, useValue: device },
      { provide: TonePlayer, useValue: { play: play ?? ((cue: SoundCue) => cues.push(cue)) } },
    ],
  });
  return { state: TestBed.inject(GameState), device, random, cues };
}

const savedIn = (device: Storage) => JSON.parse(device.getItem(STORAGE_KEYS.options) ?? 'null');
const bestIn = (device: Storage) => JSON.parse(device.getItem(STORAGE_KEYS.best) ?? '{}');
const deviceWith = (options: unknown) =>
  new MemoryStorage({ [STORAGE_KEYS.options]: JSON.stringify(options) });

function go(state: GameState, options: GameOptions) {
  state.draft.set(options);
  state.go();
}

/** Clears a SAME_FACE game; each Show All before the first pair adds one attempt. */
function clearSameFace(state: GameState, showAlls = 0) {
  for (let i = 0; i < showAlls; i++) {
    state.showAll();
    vi.advanceTimersByTime(SHOW_ALL_MS);
  }
  state.selectCard(0);
  state.selectCard(1);
  vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
  state.selectCard(2);
  state.selectCard(3);
  vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS + END_DELAY_MS);
}

describe('GameState device memory', () => {
  afterEach(() => vi.useRealTimers());

  describe('last-used options (R36, DS-024)', () => {
    it('opens with the approved default when nothing is saved (AC1)', () => {
      const { state } = setup();
      expect(state.draft().players).toEqual(['kira']);
      expect(state.draft().themes).toHaveLength(10);
      expect(state.draft()).toMatchObject({ variants: false, fill: false });
    });

    it('restores saved options into the first-open draft and preview (AC2)', () => {
      const { state } = setup({ device: deviceWith(SAVED) });
      expect(state.draft()).toEqual(SAVED);
      expect(state.previewCount()).toBe(8);
      expect(state.assignment().players).toEqual(['kira', 'calvin']);
    });

    it.each([
      ['malformed JSON', new MemoryStorage({ [STORAGE_KEYS.options]: 'not json' })],
      ['an unknown theme', deviceWith({ ...SAVED, themes: ['surfing'] })],
      ['empty players', deviceWith({ ...SAVED, players: [] })],
      ['an impossible fill count', deviceWith({ ...SAVED, fill: true, fillCount: 41 })],
    ])('falls back to the default from %s (AC3)', (_name, device) => {
      const { state } = setup({ device });
      expect(state.draft().players).toEqual(['kira']);
      expect(state.draft().themes).toHaveLength(10);
    });

    it('saves the options when Go starts a game, with players and no first player (AC2, AC7)', () => {
      const { state, device } = setup({ roll: 0.99 });
      go(state, SAVED);
      expect(state.assignment().first).toBe('calvin');
      expect(savedIn(device)).toEqual(SAVED);
      expect(savedIn(device)).not.toHaveProperty('first');
      expect(savedIn(device)).not.toHaveProperty('twoPlayers');
    });

    it('does not save when Go cannot start a game (R7)', () => {
      const { state, device } = setup();
      go(state, { ...SAVED, players: [] });
      expect(device.getItem(STORAGE_KEYS.options)).toBeNull();
    });

    it('Reset clears the draft without touching the remembered options (AC4)', () => {
      const device = deviceWith(SAVED);
      const { state } = setup({ device });
      state.draft.set(resetOptions());
      expect(state.draft().players).toEqual([]);
      expect(savedIn(device)).toEqual(SAVED);

      go(state, withPlayer(SAME_FACE, 'calvin', true));
      expect(savedIn(device)).toEqual(withPlayer(SAME_FACE, 'calvin', true));
    });

    it('Close and a cancelled "Start over?" never save the dirty draft (AC5)', () => {
      const { state, device } = setup();
      go(state, SAME_FACE);

      state.openOptions();
      expect(state.draft()).toEqual(SAME_FACE);
      state.draft.set(SAVED);
      state.closeOptions();
      expect(savedIn(device)).toEqual(SAME_FACE);

      state.selectCard(0);
      state.openOptions();
      state.draft.set(SAVED);
      state.go();
      expect(state.confirm()).toBe('go');
      state.cancelStartOver();
      expect(savedIn(device)).toEqual(SAME_FACE);

      state.go();
      state.confirmStartOver();
      expect(savedIn(device)).toEqual(SAVED);
    });

    it('Restart deals the applied options without re-saving them', () => {
      const { state, device } = setup();
      go(state, SAME_FACE);
      device.setItem(STORAGE_KEYS.options, 'marker');
      state.restart();
      expect(device.getItem(STORAGE_KEYS.options)).toBe('marker');
    });

    it('restores both players on either side of the cutoff and still rolls the first player (AC6, AC7)', () => {
      for (const start of [BEFORE, AFTER]) {
        const { state, random } = setup({ device: deviceWith(SAVED), start, roll: 0 });
        expect(state.draft().players).toEqual(['kira', 'calvin']);
        state.go();
        expect(state.assignment()).toEqual({
          mode: 'two',
          players: ['kira', 'calvin'],
          first: 'kira',
        });
        random.value = 0.99;
        state.restart();
        expect(state.assignment().first).toBe('calvin');
        TestBed.resetTestingModule();
        vi.useRealTimers();
      }
    });
  });

  describe('single-player best scores (R36, DS-016)', () => {
    it('records a first completion as a new best (AC8)', () => {
      const { state, device } = setup();
      go(state, SAME_FACE);
      expect(state.best()).toBeNull();
      clearSameFace(state);
      expect(state.ended()).toBe(true);
      expect(state.best()).toEqual({
        kind: 'new',
        best: { attempts: 2, timeMs: expect.any(Number) },
      });
      expect(bestIn(device)['kira:4-plain'].attempts).toBe(2);
    });

    it('keeps a better best after an equal or worse game (AC9)', () => {
      const { state, device } = setup();
      go(state, SAME_FACE);
      clearSameFace(state, 1);
      expect(state.best()?.kind).toBe('new');
      expect(bestIn(device)['kira:4-plain'].attempts).toBe(3);

      state.restart();
      expect(state.best()).toBeNull();
      clearSameFace(state, 2);
      expect(state.best()).toEqual({
        kind: 'kept',
        best: expect.objectContaining({ attempts: 3 }),
      });

      state.restart();
      clearSameFace(state, 1);
      expect(state.best()?.kind).toBe('kept');

      state.restart();
      clearSameFace(state);
      expect(state.best()).toEqual({ kind: 'new', best: expect.objectContaining({ attempts: 2 }) });
      expect(bestIn(device)['kira:4-plain'].attempts).toBe(2);
    });

    it('keeps Kira and Calvin apart on the same board (AC10)', () => {
      const { state, device } = setup();
      go(state, SAME_FACE);
      clearSameFace(state);
      go(state, { ...SAME_FACE, players: ['calvin'] });
      clearSameFace(state, 2);
      expect(state.best()?.kind).toBe('new');
      expect(bestIn(device)).toMatchObject({
        'kira:4-plain': { attempts: 2 },
        'calvin:4-plain': { attempts: 4 },
      });
    });

    it('keeps each board apart (AC11)', () => {
      const { state, device } = setup();
      go(state, SAME_FACE);
      clearSameFace(state);
      go(state, { ...SAME_FACE, variants: true });
      clearSameFace(state, 3);
      expect(state.best()?.kind).toBe('new');
      expect(bestIn(device)).toMatchObject({
        'kira:4-plain': { attempts: 2 },
        'kira:4-variants': { attempts: 5 },
      });
    });

    it('creates no best and no note for a two-player game (AC12)', () => {
      const { state, device } = setup();
      go(state, { ...SAME_FACE, players: ['kira', 'calvin'] });
      clearSameFace(state);
      expect(state.result()?.kind).not.toBe('single');
      expect(state.best()).toBeNull();
      expect(device.getItem(STORAGE_KEYS.best)).toBeNull();
    });
  });

  describe('sound cues (R31, DS-021)', () => {
    it('requests flip, match and win while Sound is on (AC14)', () => {
      const { state, cues } = setup();
      go(state, SAME_FACE);
      state.showAll();
      vi.advanceTimersByTime(SHOW_ALL_MS);
      expect(cues).toEqual([]);

      state.selectCard(0);
      expect(cues).toEqual(['flip']);
      state.selectCard(1);
      expect(cues).toEqual(['flip', 'flip']);
      vi.advanceTimersByTime(FLIP_MS);
      expect(cues).toEqual(['flip', 'flip', 'match']);
      vi.advanceTimersByTime(MATCH_PAUSE_MS);
      state.selectCard(2);
      state.selectCard(3);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
      expect(cues.at(-1)).toBe('match');
      vi.advanceTimersByTime(END_DELAY_MS);
      expect(cues).toEqual(['flip', 'flip', 'match', 'flip', 'flip', 'match', 'win']);
    });

    it('requests no cue for an ignored tap', () => {
      const { state, cues } = setup();
      go(state, SAME_FACE);
      state.selectCard(0);
      state.selectCard(0);
      expect(cues).toEqual(['flip']);
    });

    it('requests nothing while Sound is off, and the toggle is stored (AC13, AC14)', () => {
      const { state, cues, device } = setup();
      expect(state.soundOn()).toBe(true);
      state.toggleSound();
      expect(state.soundOn()).toBe(false);
      expect(device.getItem(STORAGE_KEYS.sound)).toBe('false');
      go(state, SAME_FACE);
      clearSameFace(state);
      expect(state.ended()).toBe(true);
      expect(cues).toEqual([]);
    });

    it('finishes the game normally when audio fails (AC15)', () => {
      const { state } = setup({
        play: () => {
          throw new Error('no audio');
        },
      });
      go(state, SAME_FACE);
      clearSameFace(state);
      expect(state.ended()).toBe(true);
      expect(state.best()?.kind).toBe('new');
    });
  });
});
