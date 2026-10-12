import { ActivityArtContent, ThemeContent } from '../../content/edition';
import {
  ChildId,
  FaceId,
  GamePresentation,
  TreatmentProperties,
  VariantId,
} from '../../domain/types';

/** The one approved alternate treatment a face shows: a single slot's custom properties (R28). */
export interface FaceTreatment {
  readonly slotId: string;
  readonly treatmentId: string;
  readonly properties: TreatmentProperties;
}

/**
 * Everything a face shows, derived from the face identity, the game's `GamePresentation`
 * and the variants flag alone; cards store none of it (OBS-005, DS-009).
 */
export interface FacePresentation {
  readonly child: ChildId;
  readonly childName: string;
  readonly themeId: string;
  readonly themeName: string;
  readonly variant: VariantId;
  readonly hue: number;
  /** The validated activity art: the same structured SVG for both variants (R27). */
  readonly art: ActivityArtContent;
  /**
   * The selected slot treatment for an alternate face in a variants-on game. Null for base
   * faces and variants-off games, which use the manifest defaults and show no cue (R29).
   */
  readonly treatment: FaceTreatment | null;
  /** Whether the diamond medallion is shown: exactly when there is a treatment (R29). */
  readonly cuePresent: boolean;
  /** Accessible name of a face-up card: "{Child}: {Activity}" (design-spec 2.1). */
  readonly label: string;
}

/**
 * The `base` face is the plain face. An `alternate` face of a variants-on game applies the
 * slot treatment selected for its theme at deal time, identically for every copy (R28).
 */
export function presentFace(
  face: FaceId,
  presentation: GamePresentation,
  variantsOn: boolean,
  theme: ThemeContent,
  childName: string,
): FacePresentation {
  let treatment: FaceTreatment | null = null;
  if (variantsOn && face.variantId === 'alternate') {
    const selected = presentation[face.themeId];
    if (!selected) {
      throw new Error(`No presentation was selected for theme "${face.themeId}"`);
    }
    treatment = {
      slotId: selected.slotId,
      treatmentId: selected.treatmentId,
      properties: selected.properties,
    };
  }

  return {
    child: theme.child,
    childName,
    themeId: theme.id,
    themeName: theme.name,
    variant: face.variantId,
    hue: theme.hue,
    art: theme.art,
    treatment,
    cuePresent: treatment !== null,
    label: `${childName}: ${theme.name}`,
  };
}
