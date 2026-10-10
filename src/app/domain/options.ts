import { GameOptions, ThemeId } from './types';

export const FILL_MIN = 4;
export const FILL_MAX = 40;
export const FILL_STEP = 4;

/** First-open options: every theme checked, everything else off (DS-010). */
export function defaultOptions(themes: readonly ThemeId[]): GameOptions {
  return { twoPlayers: false, variants: false, fill: false, fillCount: FILL_MIN, themes };
}

/** Reset clears every option, including all themes (R7, DS-010). */
export function resetOptions(): GameOptions {
  return defaultOptions([]);
}

export function canGo(options: GameOptions): boolean {
  return options.themes.length > 0;
}

/** Cards on the table for these options (R8, R9). Zero until a theme is checked. */
export function cardCount(options: GameOptions): number {
  if (!canGo(options)) {
    return 0;
  }
  if (options.fill) {
    return options.fillCount;
  }
  return options.themes.length * (options.variants ? 2 : 1) * 2;
}

export function clampFill(count: number): number {
  return Math.min(FILL_MAX, Math.max(FILL_MIN, count));
}

export function setFillCount(options: GameOptions, count: number): GameOptions {
  return { ...options, fillCount: clampFill(Math.round(count / FILL_STEP) * FILL_STEP) };
}

export function stepFillCount(options: GameOptions, direction: 1 | -1): GameOptions {
  return setFillCount(options, options.fillCount + direction * FILL_STEP);
}

/**
 * Turning Fill the grid on starts at the current card count rounded up to a
 * multiple of 4 within 4-40 (DS-011).
 */
export function withFill(options: GameOptions, fill: boolean): GameOptions {
  if (!fill) {
    return { ...options, fill };
  }
  const current = cardCount({ ...options, fill: false });
  return { ...options, fill, fillCount: clampFill(Math.ceil(current / FILL_STEP) * FILL_STEP) };
}

export function withTheme(options: GameOptions, theme: ThemeId, checked: boolean): GameOptions {
  const others = options.themes.filter((id) => id !== theme);
  return { ...options, themes: checked ? [...others, theme] : others };
}
