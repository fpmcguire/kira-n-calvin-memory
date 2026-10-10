export type ChildId = 'kira' | 'calvin';

export type ThemeId = string;

/** Data-driven cutoff record (R3). `localDateTime` is `YYYY-MM-DDTHH:mm` wall-clock time in `timeZone`. */
export interface Cutoff {
  readonly localDateTime: string;
  readonly timeZone: string;
  readonly player: ChildId;
}

export interface GameOptions {
  readonly twoPlayers: boolean;
  readonly variants: boolean;
  readonly fill: boolean;
  readonly fillCount: number;
  readonly themes: readonly ThemeId[];
}
