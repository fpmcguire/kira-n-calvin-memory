/**
 * Replaces `feature-flags.ts` in the `dated-birthday` build configuration (see `angular.json`).
 * The birthday splash then shows only before the cutoff (R2, R3), as in the original release.
 */
export const FEATURE_FLAGS: { readonly permanentBirthday: boolean } = {
  permanentBirthday: false,
};
