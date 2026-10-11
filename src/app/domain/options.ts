import { ChildId, GameOptions, ThemeId } from './types';

export const FILL_MIN = 4;
export const FILL_MAX = 40;
export const FILL_STEP = 4;

/**
 * First-open options: every theme checked, the given children checked (the edition's
 * first child, Kira, as the single player), everything else off (DS-010, R4).
 */
export function defaultOptions(
  themes: readonly ThemeId[],
  players: readonly ChildId[],
): GameOptions {
  return { players, variants: false, fill: false, fillCount: FILL_MIN, themes };
}

/** Reset clears every option, including all players and all themes (R7, DS-010). */
export function resetOptions(): GameOptions {
  return defaultOptions([], []);
}

/** Go needs at least one checked child and at least one checked theme (R7). */
export function canGo(options: GameOptions): boolean {
  return options.players.length > 0 && options.themes.length > 0;
}

/** Cards on the table for these options (R8, R9). Zero until a theme is checked. */
export function cardCount(options: GameOptions): number {
  if (options.themes.length === 0) {
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

export function withPlayer(options: GameOptions, child: ChildId, checked: boolean): GameOptions {
  const others = options.players.filter((id) => id !== child);
  return { ...options, players: checked ? [...others, child] : others };
}

export function withTheme(options: GameOptions, theme: ThemeId, checked: boolean): GameOptions {
  const others = options.themes.filter((id) => id !== theme);
  return { ...options, themes: checked ? [...others, theme] : others };
}
