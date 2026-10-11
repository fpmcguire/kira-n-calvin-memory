import { ThemeContent } from '../../content/edition';
import { ChildId, DifferenceType, FaceCue, FaceId, VariantId } from '../../domain/types';

export type FacePattern = 'none' | 'stripes' | 'dots';
export type FaceBadge = 'none' | 'circle' | 'star';

/** Hue shift of the alternate variant when the difference type is color (DS §1.1). */
const COLOR_SHIFT = 55;

/**
 * Everything a face shows, derived from theme, variant, difference cue and the
 * variants flag alone; cards store none of it (OBS-005, DS-009).
 */
export interface FacePresentation {
  readonly child: ChildId;
  readonly childName: string;
  readonly themeId: string;
  readonly themeName: string;
  readonly variant: VariantId;
  /** Null when variants are off: one variant, no cue. */
  readonly difference: DifferenceType | null;
  readonly hue: number;
  /** Static URL of the theme's activity art: the same file for both variants (STEP-06). */
  readonly art: string;
  readonly pattern: FacePattern;
  readonly mirrored: boolean;
  readonly badge: FaceBadge;
  /** Accessible name of a face-up card: "{Child}: {Activity}" (design-spec 2.1). */
  readonly label: string;
}

/**
 * Variant 1 (`base`) is the plain face. The alternate variant differs by hue (with the
 * always-on dot cue, R29), pattern, badge shape or mirrored layout, per the difference
 * type chosen for this theme in this game (R28).
 */
export function presentFace(
  face: FaceId,
  cue: FaceCue,
  theme: ThemeContent,
  childName: string,
): FacePresentation {
  const alternate = cue.difference !== null && face.variantId === 'alternate';
  const { difference } = cue;

  let pattern: FacePattern = 'none';
  if (difference === 'pattern') {
    pattern = alternate ? 'dots' : 'stripes';
  } else if (alternate && cue.secondaryCue === 'dot-pattern') {
    pattern = 'dots';
  }

  let badge: FaceBadge = 'none';
  if (difference === 'accessory') {
    badge = alternate ? 'star' : 'circle';
  }

  return {
    child: theme.child,
    childName,
    themeId: theme.id,
    themeName: theme.name,
    variant: face.variantId,
    difference,
    hue: difference === 'color' && alternate ? (theme.hue + COLOR_SHIFT) % 360 : theme.hue,
    art: theme.art,
    pattern,
    mirrored: difference === 'orientation' && alternate,
    badge,
    label: `${childName}: ${theme.name}`,
  };
}
