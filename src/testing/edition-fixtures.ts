import { EditionContent, ThemeContent } from '../app/content/edition';
import { parseEdition } from '../app/content/edition-parser';
import { FacePresentation, presentFace } from '../app/game/card-face/face-presentation';
import { GamePresentation, VariantId } from '../app/domain/types';
import editionJson from '../../public/content/kira-calvin/edition.json';

/** The shipped edition, validated through the production parser. */
export const EDITION_CONTENT: EditionContent = parseEdition(editionJson);

export function themeOf(themeId: string): ThemeContent {
  const theme = EDITION_CONTENT.themes.find((candidate) => candidate.id === themeId);
  if (!theme) {
    throw new Error(`Unknown test theme ${themeId}`);
  }
  return theme;
}

/** A `GamePresentation` selecting the `index`th eligible entry of each given theme. */
export function presentationFor(themeIds: readonly string[], index = 0): GamePresentation {
  return Object.fromEntries(
    themeIds.map((themeId) => [
      themeId,
      { ...themeOf(themeId).art.eligibleSlotTreatments[index], cueId: 'diamond-medallion' },
    ]),
  ) as GamePresentation;
}

/** A face as the board or reveal would draw it. `variantsOn` defaults to true for alternates. */
export function facePresentation(
  themeId: string,
  variantId: VariantId = 'base',
  options: { variantsOn?: boolean; index?: number } = {},
): FacePresentation {
  const theme = themeOf(themeId);
  const child = EDITION_CONTENT.children.find((candidate) => candidate.id === theme.child)!;
  const variantsOn = options.variantsOn ?? variantId === 'alternate';
  return presentFace(
    { themeId, variantId },
    variantsOn ? presentationFor([themeId], options.index ?? 0) : {},
    variantsOn,
    theme,
    child.name,
  );
}
