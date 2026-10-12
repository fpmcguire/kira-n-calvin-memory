# Domain Language - Kira-n-Calvin Memory Game

**Date:** 2026-10-12
**Tech Lead:** Codex
**Status:** Revised for the approved slot-based variant design; ready for Development

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved Tech Lead domain language for STEP-01 planning.

| Term | Decision | Canonical meaning | Rationale |
| ---- | -------- | ----------------- | --------- |
| Theme | Ratify | One approved activity owned by Kira or Calvin. | Matches product wording and options UI. |
| Variant | Modify | The domain value `base` or `alternate` for a theme. Use "domain variant" when contrast with SVG structure is needed. It remains part of `FaceId`. | Resolves the collision with SVG variant groups and slots while preserving R9/R12. |
| Difference type | Retire | Former color/pattern/accessory/orientation classification. It is not part of the current product, content contract or test hooks. | Superseded by one eligible variant-slot treatment plus the required cue. |
| Variant group | Add | A top-level SVG paint-order group marked `data-group="variant"`; it may change only through its declared slot's CSS variables. | Names the art structure without changing domain `Variant`. |
| Variant slot | Add | One manifest-declared recolorable SVG part identified by `data-slot`; one slot may span multiple variant groups. | The atomic art target selected for an alternate face. |
| Eligible slot | Add | A variant slot included in an activity's confirmed edition allow-list and paired with one approved treatment. | Excluded slots remain in the structural manifest but cannot be selected. |
| Treatment | Add | An edition-owned, stable-ID set of approved CSS custom-property values for one eligible slot. | Separates the approved palette data from selection and face identity. |
| Cue | Add | A non-color presentation marker that distinguishes an alternate face; currently the Designer-approved diamond medallion. | Required on alternate faces by R29 and absent on base/back/variants-off presentations. |
| Face | Modify | A matchable identity made from theme plus variant. | Make equality explicit for R12 and repeated pairs. |
| Pair | Ratify | Two cards sharing the same face. | Matches header and summary language. |
| Attempt | Ratify | One completed two-card turn, or one Show All use. | Matches R19 and R26. |
| Reveal | Ratify | The large side-by-side overlay showing the two selected cards. | Matches R15 and DS-012. |
| Show All | Ratify | A timed peek at all remaining cards. | Product-facing term already approved. |
| Fill the grid | Ratify | Option that requests an exact card count from 4 to 40. | Product-facing term already approved. |
| Table | Ratify | The play area containing the card grid. | Matches R13/R16 and design language. |
| Cutoff | Modify | A data record defining the local date/time and time zone that ends the birthday splash in the `dated-birthday` build. It does not affect players. | Avoid treating the cutoff as a hard-coded instant. |
| Player checkboxes | Ratify | The Kira and Calvin checkboxes in the options popup's Players group (R4, R6). One checked is single-player with that child; both is two-player with a random first player. | Replaces "Two players". Do not say "single mode" or "two-player toggle". |
| Birthday splash | Ratify | The splash showing "Happy Birthday Kira!". Shown on every visit in the default build (R38), or before the cutoff in the `dated-birthday` build. | Use "birthday splash", not "birthday mode", for the screen. |
| Permanent birthday flag | Ratify | The build-time flag `permanentBirthday` (R38). On in the default build, off in `dated-birthday`. Changes the splash only. | Build-time only. Never a per-visitor or date-driven setting. |
| Dated-birthday build | Ratify | The build configuration (`npm run build:dated-birthday`) that restores the cutoff rule for the splash. | Name it this way in docs and scripts. |
| Empty slot | Ratify | The invisible position left by a matched card. | Needed for R16 and layout tests. |
| Draft options | Ratify | Unsaved popup selections applied only by Go. | Central to R37 non-destructive options behavior. |
| Game in progress | Ratify | A dealt, unfinished game where a card has been flipped or Show All has been used. | Matches R25 product decision. |
| Preview board | Ratify | A first-open face-down count preview behind the options popup; not the dealt deck. | Matches DS-007 and avoids live-board confusion. |
| Last-used options | Ratify | The last `GameOptions` applied by Go and restored on the next game-route visit when valid. | Needed for R36 and DS-024; includes player checkboxes as `players`, not the retired Two players option. |
| Best score | Ratify | A single-player device score for one player on one board key, using fewest attempts as the primary value. | Matches R36 and DS-016/DS-024; two-player bests are out of scope unless product changes. |
| Board key | Ratify | The best-score grouping made from card count plus variants on/off. It is combined with player for storage/display. | Product assumption says best scores are per card count, variants on/off and player. |
| Sound preference | Ratify | Persisted on/off setting for card flip, match and win sounds. | Needed for R31; sound is never the only feedback channel. |

## Additional Canonical Terms

| Term | Meaning |
| ---- | ------- |
| Edition content | Static content package containing children, themes, art, brand and cutoff data for one edition. |
| Game engine | Domain and state logic that does not depend on personal likenesses or edition-specific activities. |
| Live game | The current dealt game record, preserved under the options popup until Go or Restart replaces it. |
| Face identity | Stable string or object key derived from theme and variant; repeated pairs share this identity. |
| Game presentation | Immutable per-game presentation data keyed by dealt theme, containing its selected eligible slot, treatment and cue. It is not part of face identity. |
| Structured activity art | An edition-owned inline SVG whose non-variant groups are immutable and whose variant groups expose manifest-declared slots and CSS variables. |
| Visible face root | The rendered front subtree for an up, peeked or reveal card. It does not exist for a face-down or gone board card. |

