import { bestScoreKey, boardKey, judgeBest } from './best-score';
import { defaultOptions } from './options';
import { GameOptions } from './types';

const BASE: GameOptions = defaultOptions(['dance', 'snowboard'], ['kira']);

describe('best score', () => {
  it('keys a board by card count and variants on/off (DS-024)', () => {
    expect(boardKey(BASE)).toBe('4-plain');
    expect(boardKey({ ...BASE, variants: true })).toBe('8-variants');
    expect(boardKey({ ...BASE, fill: true, fillCount: 12 })).toBe('12-plain');
  });

  it('treats the same card count from different themes as one board', () => {
    expect(boardKey({ ...BASE, themes: ['art', 'drones'] })).toBe(boardKey(BASE));
  });

  it('keys each player separately on the same board (AC10)', () => {
    expect(bestScoreKey('kira', BASE)).toBe('kira:4-plain');
    expect(bestScoreKey('calvin', BASE)).toBe('calvin:4-plain');
  });

  it('records a first score and strictly fewer attempts as new (AC8)', () => {
    const score = { attempts: 5, timeMs: 9_000 };
    expect(judgeBest(null, score)).toEqual({ kind: 'new', best: score });
    expect(judgeBest({ attempts: 6, timeMs: 1_000 }, score)).toEqual({ kind: 'new', best: score });
  });

  it('keeps the stored best for equal or worse attempts, whatever the time (AC9)', () => {
    const previous = { attempts: 5, timeMs: 20_000 };
    expect(judgeBest(previous, { attempts: 5, timeMs: 1_000 })).toEqual({
      kind: 'kept',
      best: previous,
    });
    expect(judgeBest(previous, { attempts: 9, timeMs: 1_000 })).toEqual({
      kind: 'kept',
      best: previous,
    });
  });
});
