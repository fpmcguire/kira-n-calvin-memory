/**
 * Build-time feature flags.
 *
 * `permanentBirthday`: the birthday splash ("Happy Birthday Kira!") shows on every visit,
 * not only before the cutoff (stakeholder decision, 2026-10-11). Players come from the
 * options checkboxes (R4), not the cutoff. The `dated-birthday` build configuration in `angular.json` replaces
 * this file with `feature-flags.dated.ts`, which restores the cutoff rule for the splash.
 */
export const FEATURE_FLAGS: { readonly permanentBirthday: boolean } = {
  permanentBirthday: true,
};
