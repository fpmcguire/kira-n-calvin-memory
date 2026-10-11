import { inject, InjectionToken, Service } from '@angular/core';
import { EDITION } from '../content/edition';
import { BestOutcome, BestScore, bestScoreKey, judgeBest } from '../domain/best-score';
import {
  parseBestScores,
  parseSoundPreference,
  parseStoredOptions,
  storedOptions,
} from '../domain/stored';
import { ChildId, GameOptions } from '../domain/types';

/** The browser's device storage, or null where it cannot be reached (private mode, blocked site data). */
export const DEVICE_STORAGE = new InjectionToken<Storage | null>('DEVICE_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  },
});

/** Versioned keys: a new schema gets a new version so old data is ignored, never misread. */
export const STORAGE_KEYS = {
  options: 'knc-memory.v1.options',
  best: 'knc-memory.v1.best',
  sound: 'knc-memory.v1.sound',
} as const;

/**
 * Device memory for last-used options, single-player best scores and the sound
 * preference (R36, R31, DS-024). Reads are validated and fall back to defaults; storage
 * failures degrade silently to this session's in-memory copy.
 */
@Service()
export class GameStorage {
  private readonly storage = inject(DEVICE_STORAGE);
  private readonly edition = inject(EDITION);
  /** Every value written this session, so a failed write still reads back. */
  private readonly memory = new Map<string, string>();

  /** Last options applied by Go, or null when none are stored or they are not playable. */
  loadOptions(): GameOptions | null {
    return parseStoredOptions(
      this.read(STORAGE_KEYS.options),
      this.edition.children.map((child) => child.id),
      this.edition.themes.map((theme) => theme.id),
    );
  }

  saveOptions(options: GameOptions): void {
    this.write(STORAGE_KEYS.options, storedOptions(options));
  }

  bestScore(player: ChildId, options: GameOptions): BestScore | null {
    return parseBestScores(this.read(STORAGE_KEYS.best))[bestScoreKey(player, options)] ?? null;
  }

  /** Compares a finished single-player score with the stored best and keeps the better one. */
  recordBest(player: ChildId, options: GameOptions, score: BestScore): BestOutcome {
    const scores = parseBestScores(this.read(STORAGE_KEYS.best));
    const key = bestScoreKey(player, options);
    const outcome = judgeBest(scores[key] ?? null, score);
    if (outcome.kind === 'new') {
      this.write(STORAGE_KEYS.best, { ...scores, [key]: score });
    }
    return outcome;
  }

  loadSound(): boolean {
    return parseSoundPreference(this.read(STORAGE_KEYS.sound));
  }

  saveSound(on: boolean): void {
    this.write(STORAGE_KEYS.sound, on);
  }

  private read(key: string): unknown {
    let raw = this.memory.get(key) ?? null;
    if (raw === null) {
      try {
        raw = this.storage?.getItem(key) ?? null;
      } catch {
        raw = null;
      }
    }
    if (raw === null) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return undefined;
    }
  }

  private write(key: string, value: unknown): void {
    const raw = JSON.stringify(value);
    this.memory.set(key, raw);
    try {
      this.storage?.setItem(key, raw);
    } catch {
      // Quota or security errors: keep the in-memory copy only.
    }
  }
}
