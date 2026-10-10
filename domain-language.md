# Domain Language - Kira-n-Calvin Memory Game

**Date:** 2026-10-10
**Tech Lead:** Codex
**Status:** Approved by Moderator

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved Tech Lead domain language for STEP-01 planning.

| Term | Decision | Canonical meaning | Rationale |
| ---- | -------- | ----------------- | --------- |
| Theme | Ratify | One approved activity owned by Kira or Calvin. | Matches product wording and options UI. |
| Variant | Modify | One of two face variants for a theme: base or alternate. | Names should avoid numeric-only IDs in code while preserving R9. |
| Difference type | Ratify | The per-game visual transformation used to distinguish variants: color, pattern, accessory or orientation. | Needed for R28/R29 and art generation. |
| Face | Modify | A matchable identity made from theme plus variant. | Make equality explicit for R12 and repeated pairs. |
| Pair | Ratify | Two cards sharing the same face. | Matches header and summary language. |
| Attempt | Ratify | One completed two-card turn, or one Show All use. | Matches R19 and R26. |
| Reveal | Ratify | The large side-by-side overlay showing the two selected cards. | Matches R15 and DS-012. |
| Show All | Ratify | A timed peek at all remaining cards. | Product-facing term already approved. |
| Fill the grid | Ratify | Option that requests an exact card count from 4 to 40. | Product-facing term already approved. |
| Table | Ratify | The play area containing the card grid. | Matches R13/R16 and design language. |
| Cutoff | Modify | A data record defining the local date/time, time zone and birthday player that gates splash and player assignment. | Avoid treating the cutoff as a hard-coded instant. |
| Empty slot | Ratify | The invisible position left by a matched card. | Needed for R16 and layout tests. |
| Draft options | Ratify | Unsaved popup selections applied only by Go. | Central to R37 non-destructive options behavior. |
| Game in progress | Ratify | A dealt, unfinished game where a card has been flipped or Show All has been used. | Matches R25 product decision. |
| Preview board | Ratify | A first-open face-down count preview behind the options popup; not the dealt deck. | Matches DS-007 and avoids live-board confusion. |

## Additional Canonical Terms

| Term | Meaning |
| ---- | ------- |
| Edition content | Static content package containing children, themes, art, brand and cutoff data for one edition. |
| Game engine | Domain and state logic that does not depend on personal likenesses or edition-specific activities. |
| Live game | The current dealt game record, preserved under the options popup until Go or Restart replaces it. |
| Face identity | Stable string or object key derived from theme and variant; repeated pairs share this identity. |

