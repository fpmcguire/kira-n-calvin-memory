import { parseBestScores, parseSoundPreference, parseStoredOptions, storedOptions } from './stored';
import { GameOptions } from './types';

const CHILDREN = ['kira', 'calvin'] as const;
const THEMES = ['dance', 'snowboard', 'drones'];
const VALID: GameOptions = {
  players: ['kira', 'calvin'],
  variants: true,
  fill: true,
  fillCount: 12,
  themes: ['dance', 'drones'],
};

const parse = (value: unknown) => parseStoredOptions(value, CHILDREN, THEMES);

describe('stored options', () => {
  it('accepts a valid record', () => {
    expect(parse(VALID)).toEqual(VALID);
  });

  it('keeps only the GameOptions fields, never a first player or Two players (AC7, DS-020)', () => {
    const extra = { ...VALID, first: 'calvin', twoPlayers: true };
    expect(parse(extra)).toEqual(VALID);
    expect(Object.keys(storedOptions(extra as GameOptions)).sort()).toEqual([
      'fill',
      'fillCount',
      'players',
      'themes',
      'variants',
    ]);
  });

  it.each([
    ['null', null],
    ['a string', 'kira'],
    ['an array', [VALID]],
    ['the retired Two players shape', { ...VALID, players: undefined, twoPlayers: true }],
    ['no players', { ...VALID, players: [] }],
    ['an unknown player', { ...VALID, players: ['kira', 'zoe'] }],
    ['a repeated player', { ...VALID, players: ['kira', 'kira'] }],
    ['no themes', { ...VALID, themes: [] }],
    ['an unknown theme', { ...VALID, themes: ['dance', 'surfing'] }],
    ['a repeated theme', { ...VALID, themes: ['dance', 'dance'] }],
    ['a non-boolean toggle', { ...VALID, variants: 'yes' }],
    ['a fill count below 4', { ...VALID, fillCount: 0 }],
    ['a fill count above 40', { ...VALID, fillCount: 44 }],
    ['a fill count off the step', { ...VALID, fillCount: 10 }],
    ['a fractional fill count', { ...VALID, fillCount: 8.5 }],
  ])('rejects %s (AC3)', (_name, value) => {
    expect(parse(value)).toBeNull();
  });
});

describe('stored best scores', () => {
  it('keeps valid entries and drops invalid ones', () => {
    expect(
      parseBestScores({
        'kira:4-plain': { attempts: 2, timeMs: 5_000 },
        'kira:8-plain': { attempts: 4 },
        'calvin:4-plain': { attempts: 0, timeMs: 1 },
        'calvin:8-plain': { attempts: 'two' },
        'calvin:12-plain': null,
      }),
    ).toEqual({
      'kira:4-plain': { attempts: 2, timeMs: 5_000 },
      'kira:8-plain': { attempts: 4, timeMs: 0 },
    });
  });

  it.each([null, 'x', [1, 2], 3])('reads %s as no scores', (value) => {
    expect(parseBestScores(value)).toEqual({});
  });
});

describe('stored sound preference', () => {
  it('defaults to on unless a boolean is stored (R31)', () => {
    expect(parseSoundPreference(undefined)).toBe(true);
    expect(parseSoundPreference('off')).toBe(true);
    expect(parseSoundPreference(false)).toBe(false);
    expect(parseSoundPreference(true)).toBe(true);
  });
});
