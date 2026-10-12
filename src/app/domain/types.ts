/** One ID per child. Opaque to the engine; the edition content declares the set (R35). */
export type ChildId = string;

/** One ID per approved activity. Opaque to the engine; the edition content defines the set (R35). */
export type ThemeId = string;

/** The two slightly different pairs of one activity (R9). `base` is the only one when variants are off. */
export type VariantId = 'base' | 'alternate';

/** A CSS custom-property name beginning `--`. Opaque to the engine; the edition defines the set (R35). */
export type CssVariableName = string;

/** Approved alternate value for each variable of one eligible art slot (DS-009 3.9.2). */
export type TreatmentProperties = Readonly<Record<CssVariableName, string>>;

/** Data-driven cutoff record (R3). `localDateTime` is `YYYY-MM-DDTHH:mm` wall-clock time in `timeZone`. */
export interface Cutoff {
  readonly localDateTime: string;
  readonly timeZone: string;
}

export interface GameOptions {
  /** Checked children (R4, R6): one is single-player with that child, two is two-player. */
  readonly players: readonly ChildId[];
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

/** Who plays and who goes first, from the checked children; rolled on each Go and Restart (R4, DS-020). */
export interface PlayerAssignment {
  readonly mode: PlayerMode;
  /** Header order: the single player alone, or every child in edition order (Kira, Calvin). */
  readonly players: readonly ChildId[];
  /** The single player, or the player who goes first in two-player. */
  readonly first: ChildId;
}

/**
 * One eligible art slot of an activity and its approved alternate treatment (R28, DS-009
 * 3.9.1-3.9.2). `properties` covers exactly the variables the slot declares.
 */
export interface EligibleSlotTreatment {
  readonly slotId: string;
  readonly treatmentId: string;
  readonly properties: TreatmentProperties;
}

/** The only variant cue: the diamond medallion on alternate faces (R29, DS-009 3.9.3). */
export type VariantCueId = 'diamond-medallion';

/**
 * The slot and treatment selected for one dealt theme in one game (R28). Presentation data
 * only: it never takes part in matching, card IDs, options persistence or score keys (R12).
 */
export interface ThemePresentation extends EligibleSlotTreatment {
  readonly cueId: VariantCueId;
}

/**
 * Per-game presentation: one `ThemePresentation` per distinct dealt theme when variants are
 * on, empty when they are off. Immutable and rebuilt on every Go and Restart.
 */
export type GamePresentation = Readonly<Record<ThemeId, ThemePresentation>>;

/** A freshly dealt game: the shuffled deck plus the presentation it was dealt with. */
export interface Deal {
  readonly cards: readonly DeckCard[];
  readonly presentation: GamePresentation;
}
