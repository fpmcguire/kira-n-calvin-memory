import { BestScore } from './best-score';
import { FILL_MAX, FILL_MIN, FILL_STEP } from './options';
import { ChildId, GameOptions, ThemeId } from './types';

/**
 * Validation for data read back from device storage (R36). Stored values are untrusted:
 * anything malformed, stale or naming unknown children or themes is rejected so the
 * caller falls back to defaults instead of throwing.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A non-empty list of distinct IDs, each one of `known`; null otherwise. */
function knownIds<T extends string>(value: unknown, known: readonly T[]): readonly T[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const ids = value.filter((id): id is T => known.includes(id as T));
  return ids.length === value.length && new Set(ids).size === ids.length ? ids : null;
}

function isFillCount(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= FILL_MIN &&
    value <= FILL_MAX &&
    value % FILL_STEP === 0
  );
}

/**
 * Last-used options, or null when they cannot be played as stored. Only `players` is
 * accepted for who plays; the retired Two players option and any first player are ignored.
 */
export function parseStoredOptions(
  value: unknown,
  children: readonly ChildId[],
  themes: readonly ThemeId[],
): GameOptions | null {
  if (!isRecord(value)) {
    return null;
  }
  const players = knownIds(value['players'], children);
  const selected = knownIds(value['themes'], themes);
  const { variants, fill, fillCount } = value;
  if (
    !players ||
    !selected ||
    typeof variants !== 'boolean' ||
    typeof fill !== 'boolean' ||
    !isFillCount(fillCount)
  ) {
    return null;
  }
  return { players, variants, fill, fillCount, themes: selected };
}

/** The stored shape of last-used options: exactly the `GameOptions` fields, nothing else. */
export function storedOptions(options: GameOptions): GameOptions {
  const { players, variants, fill, fillCount, themes } = options;
  return { players, variants, fill, fillCount, themes };
}

function parseBestScore(value: unknown): BestScore | null {
  if (!isRecord(value)) {
    return null;
  }
  const { attempts, timeMs } = value;
  if (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 1) {
    return null;
  }
  const time = typeof timeMs === 'number' && Number.isFinite(timeMs) && timeMs >= 0 ? timeMs : 0;
  return { attempts, timeMs: time };
}

/** Best scores by player-and-board key. Invalid entries are dropped; a malformed table is empty. */
export function parseBestScores(value: unknown): Readonly<Record<string, BestScore>> {
  if (!isRecord(value)) {
    return {};
  }
  const scores: Record<string, BestScore> = {};
  for (const [key, entry] of Object.entries(value)) {
    const score = parseBestScore(entry);
    if (score) {
      scores[key] = score;
    }
  }
  return scores;
}

/** Sound preference; on unless a boolean says otherwise (R31). */
export function parseSoundPreference(value: unknown): boolean {
  return typeof value === 'boolean' ? value : true;
}
