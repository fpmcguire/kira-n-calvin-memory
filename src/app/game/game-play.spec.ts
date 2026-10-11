import { TestBed } from '@angular/core/testing';
import { resetOptions, withTheme } from '../domain/options';
import { Clock } from './clock';
import { GameState } from './game-state';
import { Random } from './random';
import { END_DELAY_MS, FLIP_MS, MATCH_PAUSE_MS, SHOW_ALL_MS } from './timings';

/**
 * Four cards, two themes, no variants. With a constant roll the deal order is
 * dance, dance, snowboard, snowboard: cards 0 and 1 match, 0 and 2 do not.
 */
const TWO_PAIRS = withTheme(withTheme(resetOptions(), 'dance', true), 'snowboard', true);
/** Four cards of one repeated face: any two cards match (R11, R12). */
const SAME_FACE = { ...withTheme(resetOptions(), 'dance', true), fill: true, fillCount: 4 };

const START = new Date('2026-10-10T18:00:00Z');

/** Fake timers drive both the clock and the pending transitions. */
function setup(start = START, initialRoll = 0.9) {
  vi.useFakeTimers();
  vi.setSystemTime(start);
  const roll = { value: initialRoll };
  TestBed.configureTestingModule({
    providers: [
      GameState,
      { provide: Clock, useValue: { now: () => new Date() } },
      { provide: Random, useValue: { next: () => roll.value } },
    ],
  });
  return { state: TestBed.inject(GameState), roll };
}

function deal(state: GameState, options = TWO_PAIRS) {
  state.draft.set(options);
  state.go();
}

/** Plays a whole SAME_FACE game: cards (0,1) then (2,3). */
function clearSameFace(state: GameState) {
  state.selectCard(0);
  state.selectCard(1);
  vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
  state.selectCard(2);
  state.selectCard(3);
  vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS + END_DELAY_MS);
}

describe('GameState play loop', () => {
  afterEach(() => vi.useRealTimers());

  it('deals a live game from the deck, all cards down, game not in progress (AC1, R25)', () => {
    const { state } = setup();
    deal(state);
    expect(state.cardViews().map((card) => card.state)).toEqual(['down', 'down', 'down', 'down']);
    expect(state.cardViews().map((card) => card.label)).toEqual([
      'Card 1, face down',
      'Card 2, face down',
      'Card 3, face down',
      'Card 4, face down',
    ]);
    expect(state.inProgress()).toBe(false);
    expect(state.showAllDisabled()).toBe(false);
    expect(state.restartDisabled()).toBe(false);
  });

  it('flips only the chosen card and marks the game in progress (AC5)', () => {
    const { state } = setup();
    deal(state);
    state.selectCard(2);
    expect(state.cardViews().map((card) => card.state)).toEqual(['down', 'down', 'up', 'down']);
    expect(state.cardViews()[2].label).toBe('Kira: Snowboard');
    expect(state.inProgress()).toBe(true);
    expect(state.players()[0].attempts).toBe(0);
    expect(state.locked()).toBe(false);
    expect(state.showAllDisabled()).toBe(true);
  });

  it('counts one attempt on the second card, locks input and opens the reveal after the flip delay (AC6)', () => {
    const { state } = setup();
    deal(state);
    state.selectCard(0);
    state.selectCard(2);
    expect(state.players()[0].attempts).toBe(1);
    expect(state.phase()).toBe('flipping');
    expect(state.locked()).toBe(true);
    expect(state.reveal()).toBeNull();

    state.selectCard(1);
    expect(state.cardViews()[1].state).toBe('down');
    expect(state.players()[0].attempts).toBe(1);

    vi.advanceTimersByTime(FLIP_MS - 1);
    expect(state.reveal()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(state.reveal()?.outcome).toBe('mismatch');
    expect(state.reveal()?.faces.map((face) => face.themeName)).toEqual(['Dance', 'Snowboard']);
  });

  it('closes a match after the pause: cards gone, pair counted, same player again (AC8)', () => {
    const { state } = setup();
    deal(state, { ...TWO_PAIRS, twoPlayers: true });
    state.selectCard(0);
    state.selectCard(1);
    vi.advanceTimersByTime(FLIP_MS);
    expect(state.reveal()?.outcome).toBe('match');

    vi.advanceTimersByTime(MATCH_PAUSE_MS - 1);
    expect(state.reveal()?.outcome).toBe('match');
    vi.advanceTimersByTime(1);
    expect(state.reveal()).toBeNull();
    expect(state.cardViews().map((card) => card.state)).toEqual(['gone', 'gone', 'down', 'down']);
    expect(state.cardViews()).toHaveLength(4);
    expect(state.players().map((p) => [p.id, p.pairs, p.attempts, p.active])).toEqual([
      ['kira', 1, 1, true],
      ['calvin', 0, 0, false],
    ]);
    expect(state.locked()).toBe(false);
  });

  it('keeps a mismatch until dismissed, once, then passes the turn in two-player (AC9)', () => {
    const { state } = setup();
    deal(state, { ...TWO_PAIRS, twoPlayers: true });
    state.selectCard(0);
    state.selectCard(2);
    vi.advanceTimersByTime(FLIP_MS + 60_000);
    expect(state.reveal()?.outcome).toBe('mismatch');

    state.dismissReveal();
    expect(state.reveal()).toBeNull();
    expect(state.cardViews().map((card) => card.state)).toEqual(['down', 'down', 'down', 'down']);
    expect(state.players().map((p) => [p.id, p.active])).toEqual([
      ['kira', false],
      ['calvin', true],
    ]);

    state.dismissReveal();
    expect(state.players().map((p) => p.active)).toEqual([false, true]);
  });

  it('keeps the single player after a mismatch', () => {
    const { state } = setup();
    deal(state);
    state.selectCard(0);
    state.selectCard(2);
    vi.advanceTimersByTime(FLIP_MS);
    state.dismissReveal();
    expect(state.assignment().first).toBe('kira');
    expect(state.players()).toHaveLength(1);
    expect(state.players()[0].attempts).toBe(1);
  });

  it('ignores taps, Show All, Restart and New Game while input is locked (AC10)', () => {
    const { state } = setup();
    deal(state);
    state.selectCard(0);
    state.selectCard(1);
    vi.advanceTimersByTime(FLIP_MS);
    state.selectCard(2);
    expect(state.cardViews()[2].state).toBe('down');
    state.showAll();
    expect(state.players()[0].attempts).toBe(1);
    state.restart();
    state.openOptions();
    expect(state.popupOpen()).toBe(false);
    expect(state.confirm()).toBeNull();

    vi.advanceTimersByTime(MATCH_PAUSE_MS);
    state.showAll();
    expect(state.phase()).toBe('peek');
    state.selectCard(2);
    expect(state.cardViews()[2].state).toBe('peeked');
    state.restart();
    state.openOptions();
    expect(state.popupOpen()).toBe(false);
    expect(state.confirm()).toBeNull();
  });

  describe('Show All (R26)', () => {
    it('shows every remaining card for 3 s, costs one attempt and keeps turn and timer (AC11)', () => {
      const { state } = setup();
      deal(state, { ...TWO_PAIRS, twoPlayers: true });
      state.selectCard(0);
      state.selectCard(1);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
      expect(state.cardViews().map((card) => card.state)).toEqual(['gone', 'gone', 'down', 'down']);

      state.showAll();
      expect(state.cardViews().map((card) => card.state)).toEqual([
        'gone',
        'gone',
        'peeked',
        'peeked',
      ]);
      expect(state.players().map((p) => [p.attempts, p.active])).toEqual([
        [2, true],
        [0, false],
      ]);
      expect(state.cardViews()[2].label).toBe('Kira: Snowboard');

      vi.advanceTimersByTime(SHOW_ALL_MS - 1);
      expect(state.phase()).toBe('peek');
      vi.advanceTimersByTime(1);
      expect(state.phase()).toBe('idle');
      expect(state.cardViews().map((card) => card.state)).toEqual(['gone', 'gone', 'down', 'down']);
      expect(state.players()[0].active).toBe(true);
    });

    it('keeps the single-player timer running while cards are shown', () => {
      const { state } = setup();
      deal(state);
      state.showAll();
      vi.advanceTimersByTime(SHOW_ALL_MS);
      expect(state.timerText()).toBe('0:03');
      expect(state.timerState()).toBe('running');
    });

    it('is disabled with a card face up and with no game', () => {
      const { state } = setup();
      expect(state.showAllDisabled()).toBe(true);
      deal(state);
      expect(state.showAllDisabled()).toBe(false);
      state.selectCard(0);
      expect(state.showAllDisabled()).toBe(true);
    });

    it('marks the game in progress and leaves later flips working', () => {
      const { state } = setup();
      deal(state);
      state.showAll();
      expect(state.inProgress()).toBe(true);
      vi.advanceTimersByTime(SHOW_ALL_MS);
      state.selectCard(1);
      expect(state.cardViews().map((card) => card.state)).toEqual(['down', 'up', 'down', 'down']);
    });
  });

  describe('end of game (R21)', () => {
    it('ends 550 ms after the last match, with the table empty and the timer frozen (AC13)', () => {
      const { state } = setup();
      deal(state);
      state.selectCard(0);
      state.selectCard(1);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
      state.selectCard(2);
      state.selectCard(3);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
      expect(state.phase()).toBe('finishing');
      expect(state.ended()).toBe(false);
      expect(state.restartDisabled()).toBe(true);

      vi.advanceTimersByTime(END_DELAY_MS);
      expect(state.ended()).toBe(true);
      expect(state.cardViews().every((card) => card.state === 'gone')).toBe(true);
      expect(state.result()).toEqual({ kind: 'single', player: 'kira', attempts: 2 });
      expect(state.inProgress()).toBe(false);

      const frozen = state.timerText();
      expect(state.timerState()).toBe('ended');
      vi.advanceTimersByTime(60_000);
      expect(state.timerText()).toBe(frozen);
    });

    it('names the two-player winner by pairs and drops the active highlight', () => {
      const { state } = setup();
      deal(state, { ...TWO_PAIRS, twoPlayers: true });
      state.selectCard(0);
      state.selectCard(2);
      vi.advanceTimersByTime(FLIP_MS);
      state.dismissReveal();
      state.selectCard(0);
      state.selectCard(1);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
      state.selectCard(2);
      state.selectCard(3);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS + END_DELAY_MS);
      expect(state.result()).toMatchObject({ kind: 'winner', winner: 'calvin' });
      expect(state.players().every((p) => !p.active)).toBe(true);
    });
  });

  describe('timer (R20, R37)', () => {
    it('runs from the deal as m:ss', () => {
      const { state } = setup();
      deal(state);
      expect(state.timerText()).toBe('0:00');
      vi.advanceTimersByTime(65_000);
      expect(state.timerText()).toBe('1:05');
      expect(state.timerState()).toBe('running');
    });

    it('pauses under the options popup and resumes from the same value on Close (AC17)', () => {
      const { state } = setup();
      deal(state);
      vi.advanceTimersByTime(10_000);
      state.openOptions();
      expect(state.timerState()).toBe('paused');
      vi.advanceTimersByTime(30_000);
      expect(state.timerText()).toBe('0:10');

      state.closeOptions();
      expect(state.timerState()).toBe('running');
      expect(state.timerText()).toBe('0:10');
      vi.advanceTimersByTime(5_000);
      expect(state.timerText()).toBe('0:15');
    });

    it('stays frozen while the popup is open over a completed game', () => {
      const { state } = setup();
      deal(state, SAME_FACE);
      clearSameFace(state);
      const time = state.timerText();
      state.openOptions();
      vi.advanceTimersByTime(20_000);
      state.closeOptions();
      expect(state.timerText()).toBe(time);
      expect(state.ended()).toBe(true);
    });
  });

  describe('New Game and Go (R24, R25, R37)', () => {
    it('never asks "Start over?" and keeps the whole game behind the popup (AC17)', () => {
      const { state } = setup();
      deal(state, { ...TWO_PAIRS, twoPlayers: true });
      state.selectCard(0);
      state.openOptions();
      expect(state.popupOpen()).toBe(true);
      expect(state.confirm()).toBeNull();
      expect(state.draft()).toEqual(state.applied());

      state.draft.set(resetOptions());
      state.closeOptions();
      expect(state.popupOpen()).toBe(false);
      expect(state.cardViews().map((card) => card.state)).toEqual(['up', 'down', 'down', 'down']);
      expect(state.draft()).toEqual(state.applied());
      expect(state.applied()).toEqual({ ...TWO_PAIRS, twoPlayers: true });
    });

    it('asks to start over on Go over a game in progress; "Back to options" keeps both (AC16)', () => {
      const { state } = setup();
      deal(state);
      state.selectCard(0);
      state.openOptions();
      const draft = withTheme(state.draft(), 'art', true);
      state.draft.set(draft);

      state.go();
      expect(state.confirm()).toBe('go');
      expect(state.popupOpen()).toBe(true);

      state.cancelStartOver();
      expect(state.confirm()).toBeNull();
      expect(state.popupOpen()).toBe(true);
      expect(state.draft()).toEqual(draft);
      expect(state.cardViews()[0].state).toBe('up');
      expect(state.applied()).toEqual(TWO_PAIRS);
    });

    it('deals with the draft options when "Start over" is confirmed from Go (AC16)', () => {
      const { state } = setup();
      deal(state);
      state.selectCard(0);
      state.openOptions();
      state.draft.set(SAME_FACE);
      state.go();
      state.confirmStartOver();
      expect(state.confirm()).toBeNull();
      expect(state.popupOpen()).toBe(false);
      expect(state.applied()).toEqual(SAME_FACE);
      expect(state.cardViews().map((card) => card.state)).toEqual(['down', 'down', 'down', 'down']);
      expect(state.inProgress()).toBe(false);
    });

    it('does not ask when Go is pressed over an untouched or completed game', () => {
      const { state } = setup();
      deal(state);
      state.openOptions();
      state.go();
      expect(state.confirm()).toBeNull();
      expect(state.popupOpen()).toBe(false);

      deal(state, SAME_FACE);
      clearSameFace(state);
      expect(state.ended()).toBe(true);
      state.openOptions();
      state.go();
      expect(state.confirm()).toBeNull();
      expect(state.ended()).toBe(false);
    });

    it('does not ask on the first Go', () => {
      const { state } = setup();
      state.dismissSplash();
      state.go();
      expect(state.confirm()).toBeNull();
      expect(state.play()).not.toBeNull();
    });
  });

  describe('Restart (R23, R25)', () => {
    it('restarts at once before any flip and from a completed game (AC15)', () => {
      const { state } = setup();
      deal(state, SAME_FACE);
      const first = state.deal();
      state.restart();
      expect(state.confirm()).toBeNull();
      expect(state.deal()).not.toBe(first);

      clearSameFace(state);
      expect(state.ended()).toBe(true);
      state.restart();
      expect(state.confirm()).toBeNull();
      expect(state.ended()).toBe(false);
      expect(state.players()[0]).toMatchObject({ attempts: 0, pairs: 0 });
    });

    it('asks "Start over?" in a game in progress; "Keep playing" changes nothing (AC15)', () => {
      const { state } = setup();
      deal(state);
      state.selectCard(0);
      state.restart();
      expect(state.confirm()).toBe('restart');
      state.cancelStartOver();
      expect(state.confirm()).toBeNull();
      expect(state.cardViews()[0].state).toBe('up');
    });

    it('keeps the options and resets scores, timer and cards when confirmed (AC15)', () => {
      const { state } = setup();
      deal(state, { ...TWO_PAIRS, twoPlayers: true });
      state.selectCard(0);
      state.selectCard(1);
      vi.advanceTimersByTime(FLIP_MS + MATCH_PAUSE_MS);
      state.showAll();
      vi.advanceTimersByTime(SHOW_ALL_MS);
      const options = state.applied();
      state.restart();
      expect(state.confirm()).toBe('restart');
      state.confirmStartOver();
      expect(state.applied()).toEqual(options);
      expect(state.cardViews().map((card) => card.state)).toEqual(['down', 'down', 'down', 'down']);
      expect(state.players().map((p) => [p.attempts, p.pairs])).toEqual([
        [0, 0],
        [0, 0],
      ]);
      expect(state.phase()).toBe('idle');
      expect(state.timerText()).toBe('0:00');
    });

    it('leaves no pending transition when the game is torn down (OBS-010)', () => {
      const { state } = setup();
      deal(state, SAME_FACE);
      state.selectCard(0);
      state.selectCard(1);
      vi.advanceTimersByTime(FLIP_MS);
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      TestBed.resetTestingModule();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('re-rolls players against the clock, so a session open across the cutoff goes random (AC18)', () => {
      const { state, roll } = setup(new Date('2026-10-11T05:59:30Z'), 0.99);
      state.draft.update((draft) => ({ ...draft, twoPlayers: true }));
      state.go();
      expect(state.assignment().first).toBe('kira');
      expect(state.beforeCutoff).toBe(true);

      vi.setSystemTime(new Date('2026-10-11T06:00:30Z'));
      state.restart();
      expect(state.assignment().first).toBe('calvin');
      roll.value = 0;
      state.restart();
      expect(state.assignment().first).toBe('kira');
      expect(state.beforeCutoff).toBe(true);
    });

    it('keeps Kira first on every Restart before the cutoff (AC18)', () => {
      const { state } = setup(START, 0.99);
      state.draft.update((draft) => ({ ...draft, twoPlayers: true }));
      state.go();
      state.restart();
      state.restart();
      expect(state.assignment()).toEqual({
        mode: 'two',
        players: ['kira', 'calvin'],
        first: 'kira',
      });
    });
  });
});
