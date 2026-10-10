import { DeckCard, FaceId } from './types';

/** Face identity equality: same theme and same variant (R12). */
export function sameFace(a: FaceId, b: FaceId): boolean {
  return a.themeId === b.themeId && a.variantId === b.variantId;
}

/**
 * Two distinct cards match when they show the same face. Card IDs and grid positions
 * never take part, so any two copies of a repeated pair match (R12). A card never
 * matches itself.
 */
export function cardsMatch(a: DeckCard, b: DeckCard): boolean {
  return a.id !== b.id && sameFace(a.faceId, b.faceId);
}

/** Stable string key for a face identity, safe for any theme ID. */
export function faceKey(face: FaceId): string {
  return JSON.stringify([face.themeId, face.variantId]);
}

/** Groups cards by face identity; every group of a valid deck has an even size (R9-R12). */
export function groupByFace(cards: readonly DeckCard[]): Map<string, DeckCard[]> {
  const groups = new Map<string, DeckCard[]>();
  for (const card of cards) {
    const key = faceKey(card.faceId);
    const group = groups.get(key);
    if (group) {
      group.push(card);
    } else {
      groups.set(key, [card]);
    }
  }
  return groups;
}
