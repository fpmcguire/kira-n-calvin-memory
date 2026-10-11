import { cardsMatch } from './match';
import { ChildId, DeckCard, PlayerAssignment } from './types';

/** Stored state of one dealt card. `peeked` (Show All) is a view of `down`, never stored (OBS-008). */
export type CardState = 'down' | 'up' | 'gone';

export interface PlayerScore {
  /** Completed two-card turns plus Show All uses (R19, R26). */
  readonly attempts: number;
  /** Pairs matched (R19). */
  readonly pairs: number;
}

export type Scores = Readonly<Record<ChildId, PlayerScore>>;

/**
 * The live game record: the dealt deck in grid order, one state per card, the cards
 * face up this turn, scores and whose turn it is. List order never changes, so
 * resizing and empty slots keep positions (R14, R16). Transient timing (flip delay,
 * reveal, Show All) is UI state owned by the game instance, not part of this record.
 */
export interface PlayRecord {
  readonly cards: readonly DeckCard[];
  readonly states: readonly CardState[];
  /** Grid indexes of the cards turned face up in the current turn (0 to 2). */
  readonly flipped: readonly number[];
  /** Header order: the single player alone, or Kira then Calvin (DS-020). */
  readonly players: readonly ChildId[];
  readonly current: ChildId;
  readonly scores: Scores;
  /** A card has been flipped or Show All used: the "game in progress" marker (R25). */
  readonly touched: boolean;
}

export type GameResult =
  | { readonly kind: 'single'; readonly player: ChildId; readonly attempts: number }
  | {
      readonly kind: 'winner';
      readonly winner: ChildId;
      readonly scores: Scores;
      /** Pairs were level, so the fewest attempts decided it (R21). */
      readonly decidedByTurns: boolean;
    }
  | { readonly kind: 'tie'; readonly scores: Scores };

const NO_SCORE: PlayerScore = { attempts: 0, pairs: 0 };

/** A fresh, untouched record for a dealt deck and its player assignment (R4, R23). */
export function startPlay(cards: readonly DeckCard[], assignment: PlayerAssignment): PlayRecord {
  return {
    cards,
    states: cards.map((): 'down' => 'down'),
    flipped: [],
    players: assignment.players,
    current: assignment.first,
    scores: { kira: NO_SCORE, calvin: NO_SCORE },
    touched: false,
  };
}

function withScore(
  record: PlayRecord,
  player: ChildId,
  change: (score: PlayerScore) => PlayerScore,
): Scores {
  return { ...record.scores, [player]: change(record.scores[player]) };
}

function withStates(
  record: PlayRecord,
  indexes: readonly number[],
  state: CardState,
): readonly CardState[] {
  return record.states.map((current, index) => (indexes.includes(index) ? state : current));
}

/** Only a face-down card can be flipped, and never a third card in one turn (R15, R18). */
export function canFlip(record: PlayRecord, index: number): boolean {
  return record.flipped.length < 2 && record.states[index] === 'down';
}

/**
 * Turns one card face up. The second card of a turn completes it and costs the
 * active player one attempt, counted exactly once (R19, AC6).
 */
export function flipCard(record: PlayRecord, index: number): PlayRecord {
  if (!canFlip(record, index)) {
    return record;
  }
  const flipped = [...record.flipped, index];
  return {
    ...record,
    states: withStates(record, [index], 'up'),
    flipped,
    touched: true,
    scores:
      flipped.length === 2
        ? withScore(record, record.current, (score) => ({ ...score, attempts: score.attempts + 1 }))
        : record.scores,
  };
}

/** Whether the two face-up cards match by face identity (R12); null until a turn is complete. */
export function turnOutcome(record: PlayRecord): 'match' | 'mismatch' | null {
  if (record.flipped.length < 2) {
    return null;
  }
  const [a, b] = record.flipped;
  return cardsMatch(record.cards[a], record.cards[b]) ? 'match' : 'mismatch';
}

/** Match: both cards leave the table, the pair counts, the same player goes again (R16). */
export function resolveMatch(record: PlayRecord): PlayRecord {
  return {
    ...record,
    states: withStates(record, record.flipped, 'gone'),
    flipped: [],
    scores: withScore(record, record.current, (score) => ({ ...score, pairs: score.pairs + 1 })),
  };
}

/** Mismatch: both cards turn down and the turn passes in two-player (R17). */
export function resolveMismatch(record: PlayRecord): PlayRecord {
  const others = record.players.filter((player) => player !== record.current);
  return {
    ...record,
    states: withStates(record, record.flipped, 'down'),
    flipped: [],
    current: others[0] ?? record.current,
  };
}

export function isComplete(record: PlayRecord): boolean {
  return record.states.every((state) => state === 'gone');
}

/** Show All works between turns only: no card face up and cards still on the table (R26). */
export function canShowAll(record: PlayRecord): boolean {
  return record.flipped.length === 0 && !isComplete(record);
}

/** Show All costs the active player one attempt and never changes the turn (R26). */
export function useShowAll(record: PlayRecord): PlayRecord {
  if (!canShowAll(record)) {
    return record;
  }
  return {
    ...record,
    touched: true,
    scores: withScore(record, record.current, (score) => ({
      ...score,
      attempts: score.attempts + 1,
    })),
  };
}

/** Dealt, unfinished, and a card flipped or Show All used (R25, DS: Game in progress). */
export function isInProgress(record: PlayRecord): boolean {
  return record.touched && !isComplete(record);
}

/**
 * Result of a finished game (R21). Single-player reports total attempts. Two-player:
 * more pairs wins, level pairs go to the player with the fewest attempts, else a tie.
 */
export function gameResult(record: PlayRecord): GameResult {
  if (record.players.length === 1) {
    const player = record.players[0];
    return { kind: 'single', player, attempts: record.scores[player].attempts };
  }
  const [first, second] = record.players;
  const a = record.scores[first];
  const b = record.scores[second];
  if (a.pairs !== b.pairs) {
    return {
      kind: 'winner',
      winner: a.pairs > b.pairs ? first : second,
      scores: record.scores,
      decidedByTurns: false,
    };
  }
  if (a.attempts !== b.attempts) {
    return {
      kind: 'winner',
      winner: a.attempts < b.attempts ? first : second,
      scores: record.scores,
      decidedByTurns: true,
    };
  }
  return { kind: 'tie', scores: record.scores };
}
