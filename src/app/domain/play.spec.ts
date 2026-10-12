import {
  canFlip,
  canShowAll,
  flipCard,
  gameResult,
  isComplete,
  isInProgress,
  PlayRecord,
  resolveMatch,
  resolveMismatch,
  startPlay,
  turnOutcome,
  useShowAll,
} from './play';
import { DeckCard, PlayerAssignment } from './types';

const card = (id: string, themeId: string, variantId: 'base' | 'alternate' = 'base'): DeckCard => ({
  id,
  faceId: { themeId, variantId },
});

/** Grid order: dance, snowboard, dance, snowboard. Pairs sit at (0,2) and (1,3). */
const CARDS = [
  card('a0', 'dance'),
  card('b0', 'snowboard'),
  card('a1', 'dance'),
  card('b1', 'snowboard'),
];

const SINGLE: PlayerAssignment = { mode: 'single', players: ['kira'], first: 'kira' };
const TWO: PlayerAssignment = { mode: 'two', players: ['kira', 'calvin'], first: 'calvin' };

function play(assignment = SINGLE, cards = CARDS): PlayRecord {
  return startPlay(cards, assignment, ['kira', 'calvin']);
}

describe('startPlay', () => {
  it('deals every card face down with zero scores and the first player active', () => {
    const record = play(TWO);
    expect(record.states).toEqual(['down', 'down', 'down', 'down']);
    expect(record.flipped).toEqual([]);
    expect(record.current).toBe('calvin');
    expect(record.scores).toEqual({
      kira: { attempts: 0, pairs: 0 },
      calvin: { attempts: 0, pairs: 0 },
    });
    expect(isInProgress(record)).toBe(false);
  });
});

describe('flipCard', () => {
  it('turns only the chosen card, marks the game touched and counts no attempt yet', () => {
    const record = flipCard(play(), 1);
    expect(record.states).toEqual(['down', 'up', 'down', 'down']);
    expect(record.flipped).toEqual([1]);
    expect(record.touched).toBe(true);
    expect(record.scores['kira'].attempts).toBe(0);
    expect(isInProgress(record)).toBe(true);
  });

  it('counts exactly one attempt for the active player on the second card', () => {
    const record = flipCard(flipCard(play(TWO), 0), 1);
    expect(record.flipped).toEqual([0, 1]);
    expect(record.scores['calvin'].attempts).toBe(1);
    expect(record.scores['kira'].attempts).toBe(0);
  });

  it('ignores a flipped card, a gone card and a third card', () => {
    const one = flipCard(play(), 0);
    expect(flipCard(one, 0)).toBe(one);
    const two = flipCard(one, 1);
    expect(canFlip(two, 2)).toBe(false);
    expect(flipCard(two, 2)).toBe(two);
    const gone = resolveMatch(flipCard(flipCard(play(), 0), 2));
    expect(canFlip(gone, 0)).toBe(false);
  });
});

describe('turnOutcome', () => {
  it('is null until two cards are up', () => {
    expect(turnOutcome(play())).toBeNull();
    expect(turnOutcome(flipCard(play(), 0))).toBeNull();
  });

  it('matches by face identity, not position or card id (R12)', () => {
    expect(turnOutcome(flipCard(flipCard(play(), 0), 2))).toBe('match');
    expect(turnOutcome(flipCard(flipCard(play(), 0), 1))).toBe('mismatch');
  });

  it('keeps variants of one theme apart', () => {
    const cards = [card('x0', 'dance', 'base'), card('x1', 'dance', 'alternate')];
    expect(turnOutcome(flipCard(flipCard(play(SINGLE, cards), 0), 1))).toBe('mismatch');
  });

  it('matches any two copies of a repeated pair', () => {
    const cards = [
      card('r0', 'dance'),
      card('r1', 'dance'),
      card('r2', 'dance'),
      card('r3', 'dance'),
    ];
    expect(turnOutcome(flipCard(flipCard(play(SINGLE, cards), 1), 3))).toBe('match');
  });
});

describe('resolveMatch', () => {
  it('removes both cards, adds a pair and keeps the same player and slots (R16)', () => {
    const record = resolveMatch(flipCard(flipCard(play(TWO), 0), 2));
    expect(record.states).toEqual(['gone', 'down', 'gone', 'down']);
    expect(record.flipped).toEqual([]);
    expect(record.current).toBe('calvin');
    expect(record.scores['calvin']).toEqual({ attempts: 1, pairs: 1 });
    expect(record.cards).toBe(CARDS);
  });

  it('completes the game when the table is empty', () => {
    let record = resolveMatch(flipCard(flipCard(play(), 0), 2));
    expect(isComplete(record)).toBe(false);
    record = resolveMatch(flipCard(flipCard(record, 1), 3));
    expect(isComplete(record)).toBe(true);
    expect(isInProgress(record)).toBe(false);
  });
});

describe('resolveMismatch', () => {
  it('turns both cards down and passes the turn in two-player (R17)', () => {
    const record = resolveMismatch(flipCard(flipCard(play(TWO), 0), 1));
    expect(record.states).toEqual(['down', 'down', 'down', 'down']);
    expect(record.current).toBe('kira');
    expect(record.scores['calvin'].attempts).toBe(1);
  });

  it('keeps the only player in single-player', () => {
    const record = resolveMismatch(flipCard(flipCard(play(), 0), 1));
    expect(record.current).toBe('kira');
  });
});

describe('Show All', () => {
  it('costs the active player one attempt, keeps the turn and marks the game touched (R26)', () => {
    const record = useShowAll(play(TWO));
    expect(record.scores['calvin'].attempts).toBe(1);
    expect(record.current).toBe('calvin');
    expect(record.states).toEqual(['down', 'down', 'down', 'down']);
    expect(isInProgress(record)).toBe(true);
  });

  it('is available between turns only, not with a card face up or an empty table', () => {
    expect(canShowAll(play())).toBe(true);
    const mid = flipCard(play(), 0);
    expect(canShowAll(mid)).toBe(false);
    expect(useShowAll(mid)).toBe(mid);
    let done = resolveMatch(flipCard(flipCard(play(), 0), 2));
    done = resolveMatch(flipCard(flipCard(done, 1), 3));
    expect(canShowAll(done)).toBe(false);
  });
});

describe('gameResult', () => {
  const withScores = (kira: [number, number], calvin: [number, number]): PlayRecord => ({
    ...play(TWO),
    scores: {
      kira: { attempts: kira[0], pairs: kira[1] },
      calvin: { attempts: calvin[0], pairs: calvin[1] },
    },
  });

  it('reports single-player attempts (R21)', () => {
    const record = useShowAll(play());
    expect(gameResult(record)).toEqual({ kind: 'single', player: 'kira', attempts: 1 });
  });

  it('gives the win to the player with more pairs', () => {
    expect(gameResult(withScores([9, 3], [7, 5]))).toMatchObject({
      kind: 'winner',
      winner: 'calvin',
      decidedByTurns: false,
    });
  });

  it('breaks level pairs by fewest attempts', () => {
    expect(gameResult(withScores([8, 4], [6, 4]))).toMatchObject({
      kind: 'winner',
      winner: 'calvin',
      decidedByTurns: true,
    });
    expect(gameResult(withScores([5, 4], [6, 4]))).toMatchObject({
      winner: 'kira',
      decidedByTurns: true,
    });
  });

  it('is a tie when pairs and attempts are level', () => {
    expect(gameResult(withScores([6, 4], [6, 4])).kind).toBe('tie');
  });
});
