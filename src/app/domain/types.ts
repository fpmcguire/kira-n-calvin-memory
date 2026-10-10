export type ChildId = 'kira' | 'calvin';

/** One ID per approved activity. Opaque to the engine; the edition content defines the set (R35). */
export type ThemeId = string;

/** The two slightly different pairs of one activity (R9). `base` is the only one when variants are off. */
export type VariantId = 'base' | 'alternate';

/** How the two variants of a theme differ (R28, DS-009). */
export type DifferenceType = 'color' | 'pattern' | 'accessory' | 'orientation';

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

/** Face identity: two cards match only when both fields are equal (R12). Also names a pair. */
export interface FaceId {
  readonly themeId: ThemeId;
  readonly variantId: VariantId;
}

/** A pair identity is the face both of its cards show. Repeated pairs share one identity (R11, R12). */
export type PairIdentity = FaceId;

/**
 * One card of the dealt deck. `id` is unique per card instance and never takes part in
 * matching; the array position is the grid position and does not either (R12).
 */
export interface DeckCard {
  readonly id: string;
  readonly faceId: FaceId;
}

/** Single-player or two-player (R4). */
export type PlayerMode = 'single' | 'two';

/** Who plays and who goes first, rolled on each Go and Restart (R4, DS-020). */
export interface PlayerAssignment {
  readonly mode: PlayerMode;
  /** Header order: the single player alone, or every child in edition order (Kira, Calvin). */
  readonly players: readonly ChildId[];
  /** The single player, or the player who goes first in two-player. */
  readonly first: ChildId;
}

/** Difference type chosen for each selected theme for one game (R28, DS-009). */
export type DifferenceAssignment = Readonly<Record<ThemeId, DifferenceType>>;

/** Secondary cue that keeps color differences readable without color (R29, DS-009). */
export type SecondaryCue = 'dot-pattern';

/** What distinguishes a face's variant in this game; derives presentation without storing it (OBS-005). */
export interface FaceCue {
  /** Null when variants are off: there is a single variant and no cue (DS-009). */
  readonly difference: DifferenceType | null;
  /** Always set when `difference` is `color`. */
  readonly secondaryCue: SecondaryCue | null;
}

/** A freshly dealt game: the shuffled deck plus the per-theme difference types it was dealt with. */
export interface Deal {
  readonly cards: readonly DeckCard[];
  readonly differences: DifferenceAssignment;
}
