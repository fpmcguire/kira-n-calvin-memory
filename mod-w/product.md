# Product Definition

**Project:** Kira-n-Calvin Memory Game
**Date:** 2026-10-12 (slot-based SVG variants, R9, R15, R27, R28, R29, R35; permanent birthday screens, R38; player checkboxes, R4/R6)
**Owner:** fpmcguire (Grandpa), Product Owner

---

## Problem Statement

Kira and Calvin are the owner's grandchildren, living in Colorado Springs, CO. The owner keeps a family website (kira-n-calvin.com) that he updates for birthdays and major holidays. For Kira's birthday on Saturday, October 10, 2026, he wants a gift that feels made for the two kids: a memory (matching pairs) card game where every card shows an illustrated Kira or Calvin doing an activity they actually love.

Generic memory games do not feel personal, and they give young players little reason to study the cards closely. This game turns the deck into a portrait of the kids' interests and uses small, deliberate card differences (variants) to make matching a game of looking carefully. Playing with the options is part of the fun.

A "small difference" means this: in the alternate face of an activity, exactly one approved part of the picture (for example the skirt, the shoes or the board) is recolored, and a visible non-color cue marks the difference. The child, the pose and the scene never change. Which part is recolored, and in what color, is chosen at random for each game, so the differences cannot be memorized.

If the game proves successful, the owner may release a public edition under the "Kira-n-Calvin" brand with the personal content swapped out.

---

## Target Users

| User | Context | Goal |
| ---- | ------- | ---- |
| Kira | Birthday girl, a young child. Plays on a phone or tablet, alone or against her brother. | Enjoy a game that is clearly about her and her favorite things. |
| Calvin | Kira's brother, a young child. Plays alone or against Kira. | Enjoy the same game, with his own favorite activities on the cards. |
| Grandpa (owner) | Maintains kira-n-calvin.com and updates it on occasions. | Give the kids a personal gift, host it on the existing site, and keep the option of a public edition. |
| Future public players | Possible later audience if the game succeeds. | Play a polished memory game under the Kira-n-Calvin brand (not part of this release). |

---

## Goals

1. Deliver a playable one- or two-player memory game with classic matching rules and a clear, fast feedback loop for young players.
2. Make the game personal: ten activities (five per child), each card showing an illustrated Kira or Calvin doing the activity.
3. Make the game fun to configure: the player chooses themes, variants, players and board size before each game.
4. Make matching a game of careful looking, using variant pairs (one recolored part, always with a non-color cue) and a large side-by-side reveal of every flipped pair.
5. Keep personalization separable from the engine, so a public edition can reuse the game without the real kids' content.

---

## Non-Goals

1. Building the public edition now. This release only keeps the door open to it.
2. Accounts, logins, leaderboards, online multiplayer, or any backend service.
3. A how-to-play button or tutorial screen (decided: none).
4. More than two players.
5. Birthday messages inside the game after the splash screen (the end screen has none).

---

## High-Level Requirements

> Stable IDs (R-IDs) are required for traceability.

| ID  | Requirement | Priority     |
| --- | ----------- | ------------ |
| R1  | A birthday greeting page on kira-n-calvin.com, in the site's folder-per-occasion pattern, greets Kira and links to the game. It is separate from the game. It stays up after the birthday (R38). | Must have |
| R2  | The game opens with a splash screen of about 3 seconds that a tap can skip. The birthday splash shows a "Happy Birthday Kira!" placeholder. In the default build it shows on every visit (R38). In the dated-birthday build it shows before the cutoff and the generic splash (K-n-C logo and the "Kira-n-Calvin Memory Game" title) shows after it. | Must have |
| R3  | The cutoff is the end of Saturday, October 10, 2026 in Colorado time (2026-10-11 00:00 America/Denver). It is data-driven (date, time zone), not hard-coded. It affects the splash only, and only in the dated-birthday build (R2, R38). It does not affect players (R4). | Must have |
| R4  | The player checkboxes (R6) decide who plays. Only Kira or only Calvin checked: single-player with that child. Both checked: two-player, and the first player is chosen at random at the start of each game and on Restart. The date and the cutoff play no part. First open checks Kira alone. | Must have |
| R5  | After the splash, the board is displayed and an options popup opens over it. | Must have |
| R6  | The popup has a Players group with one checkbox per child (Kira, Calvin), then checkboxes for variants and fill the grid, followed by two columns of theme checkboxes (Kira: Dance, Snowboard, Red Pandas, Squishies, Art; Calvin: Video games, Archery, Rock climbing, Drones, Gymnastics), and Reset and Go buttons. | Must have |
| R7  | Go is disabled until at least one player and at least one theme are checked. Reset clears all options, including both player checkboxes. | Must have |
| R8  | When fill the grid is checked, a slider or stepper appears: 4 to 40 in steps of 4. The number of cards on the table equals the chosen value exactly. | Must have |
| R9  | Variants off: one `base` pair per checked theme, using the approved default SVG appearance. Variants on: a `base` pair and an `alternate` pair per checked theme. The alternate differs slightly but clearly by recoloring one approved variant slot and by showing the required non-color cue (R28, R29). With fill the grid off, cards shown = checked themes x (1 or 2 pairs) x 2 cards. | Must have |
| R10 | Fill the grid on, more supply than needed: pick checked themes at random, include a theme's variant pair when variants are on, and continue until the grid is full. | Must have |
| R11 | Fill the grid on, less supply than needed: repeat the pairs round-robin until the grid is full. Leftover pairs go to randomly chosen themes, so no pair appears more than one extra time compared with the others. Extreme boards (for example one theme across 40 cards) are allowed. | Must have |
| R12 | Two cards match when they show the same face (same theme and same variant). Grid position never takes part in matching. Repeated pairs share one face identity, so any two copies match. | Must have |
| R13 | The grid is responsive: rows and columns follow the available table area and device orientation, and the cards wrap to fit. Cards keep a fixed 3:4 portrait ratio, have a minimum size, and an incomplete last row is left-aligned. | Must have |
| R14 | On rotation or resize the grid re-wraps. The cards keep their order and only the wrapping changes. | Must have |
| R15 | When the second card is selected, the pair appears large and side by side over the table so the details are clearly visible. When variants are on, the base and alternate faces must be clearly distinguishable there: the recolored slot and the non-color cue (R28, R29) are both plainly visible at reveal size. This happens on every turn. | Must have |
| R16 | Match: after a short pause the reveal goes away and the two cards disappear from the table. Their positions stay empty (no border or placeholder), the other cards do not move, and the same player goes again. | Must have |
| R17 | Mismatch: the reveal stays, with a "Tap a card to continue" hint, until the player clicks one of the two displayed cards. The cards return face down and the turn passes to the other player in two-player. | Must have |
| R18 | Input is locked while a reveal is showing. | Must have |
| R19 | The header shows, per player, attempts (pairs turned over) and pairs matched. In two-player the active player's block is highlighted. The players are always named Kira and Calvin. | Must have |
| R20 | Single-player shows a running timer in the header. | Must have |
| R21 | The game ends when the table is empty. The end screen shows the winning score and a celebration (confetti) and has no birthday message. Single-player: total attempts and time. Two-player: the winner and pairs matched per player, ties broken by fewest total turns. | Must have |
| R22 | The end screen offers Restart and New Game. | Must have |
| R23 | Restart keeps the same options and rebuilds the cards as a fresh game, with scores and timer reset and no popup. | Must have |
| R24 | New Game opens the options popup with the current settings filled in. | Must have |
| R25 | Restart, and Go from an options popup opened over a game, ask "Start over?" only when a game is in progress (a card has been flipped or Show All used, and the game has not ended). New Game opens the options popup without asking, because nothing is lost until Go is confirmed. | Should have |
| R26 | Show All flips every remaining card face up for about 3 seconds. It costs one extra attempt to the player who pressed it, does not change the turn, works between turns only, and the timer keeps running. | Should have |
| R27 | Card faces are SVG illustrations of Kira or Calvin doing the activity, reflecting each child's hair color, age and likeness. Each illustration separates non-variant groups (likeness, skin, head, hair, glasses, shadow, background scene), which never change, from controlled variant slots (clothing, shoes, props, sparkles, activity objects), the only parts that may change (R28). With default colors, every card shows the approved illustration. | Must have |
| R28 | For every checked theme in a game with variants on, the `base` face uses the approved SVG defaults. The `alternate` face recolors exactly one slot, selected at random from the edition's approved slot allow-list, using a Designer-approved alternate color treatment. The selection is made once per theme when the game is dealt, so both cards of a face and every repeated copy of it look identical. Go and Restart reroll it. Non-variant groups are never recolored, hidden, moved, mirrored or otherwise changed. Pattern, accessory-presence and orientation differences are not required. The selected slot and color are presentation data for that game and never change face identity (R12). | Must have |
| R29 | Every slot-based color difference includes an approved non-color cue, so the base and alternate faces never rely on color alone. The cue is part of the card presentation, not necessarily part of the activity SVG. It appears consistently on the board card and in the large reveal, and it exposes no face information (theme, variant or selected slot) while the card is face down. With variants off, no variant cue is shown. | Must have |
| R30 | Every card has the same back: the K-n-C logo (a text placeholder until the logo exists). The back gives no hint about the front. | Must have |
| R31 | A sound on/off button in the header, with sounds for card flip, match and win. | Should have |
| R32 | Flip, reveal and disappear animations. | Should have |
| R33 | Accessibility: large tap targets and keyboard support (Enter and Space to select and dismiss). | Should have |
| R34 | The game is delivered as a static page in its own subfolder of kira-n-calvin.com and linked from the site. | Must have |
| R35 | Personal content (likenesses and activities) is kept separate from the game engine. The names Kira and Calvin and the K-n-C logo are brand and stay in every edition. The edition-content package owns the activity SVGs and their group/slot markup, the art manifest, the variant-slot allow-lists and the approved alternate color treatments. The reusable engine consumes a generic typed art contract and does not hard-code Kira, Calvin, activity filenames, slot names or edition-specific palettes. | Should have |
| R36 | Best scores and last-used options are remembered on the device. | Nice to have |
| R37 | When the options popup is opened from an active or completed game, it has a close button that dismisses the popup and returns to the game exactly as it was, without changing options, rebuilding the deck, resetting scores, changing turns, or altering the timer state. Escape also closes the popup. While the popup is open over an active game, the timer is paused and resumes from the same value on close. | Should have |
| R38 | Permanent birthday screens: a build-time feature flag, `permanentBirthday`, decides whether the birthday splash stays after the cutoff. The default build sets it on, so the birthday splash shows on every visit. The `dated-birthday` build configuration sets it off and restores the cutoff rule for the splash (R2, R3). The flag is fixed at build time and is never set per visitor or by the date at run time. It changes the splash only, never the players (R4), and never adds birthday messages inside gameplay or to the end screen (Non-goal 5, R21). | Must have |

---

## Key User Scenarios

1. Kira opens kira-n-calvin.com on her birthday and sees the greeting page, taps the link, sees the birthday splash, and lands on the board with the options popup. She picks a few themes, checks variants, and presses Go. She plays alone as Kira.
2. Kira and Calvin play together: they check both Kira and Calvin, leave all ten themes on and variants on (a 40-card board). The game picks Kira to go first this time. She flips two cards, the pair appears large, they match and disappear, and she goes again. On a miss the pair stays up until she taps a card, then it is Calvin's turn.
3. A player looks closely at a mismatch: two Snowboard cards appear side by side, large. In this game one part of the picture (for example the helmet) is a different color on one card, and a visible non-color cue marks that card. The player studies the difference, remembers it, and taps to continue. In the next game the recolored part and color may be different.
4. A player experiments with the options: one theme, fill the grid at 40. The board fills with that one face and the game becomes a very different challenge.
5. A player rotates a tablet mid-game: the grid re-wraps to the new shape, the cards keep their order, and removed pairs stay empty.
6. A player presses Show All to peek at the remaining cards. It costs an attempt, and the timer keeps running.
7. After the last pair, the end screen shows the result with confetti: attempts and time in single-player, or the winner in two-player. The player taps Restart for the same options, New Game to change them, or closes the options popup to return to the completed game unchanged.
8. After the birthday cutoff, the default build still opens the game with the birthday splash. In the dated-birthday build, the same visit opens with the generic logo splash. Players work the same on any date (R4).
9. Calvin wants to play alone: he unchecks Kira, checks Calvin and presses Go. The header shows only Calvin, with the timer.
10. A player with variants on finishes a game and taps Restart. The same themes are dealt, but each theme may now recolor a different part in a different color, so the differences learned in the last game no longer help.
11. A player with variants off sees only default-appearance cards and no variant cue anywhere on the board or in the reveal.

---

## Acceptance Criteria (Product-Level)

- [ ] All Must-have requirements implemented
- [ ] No unresolved critical risks
- [ ] qa.md completed
- [ ] review.md approved
- [ ] Moderator sign-off
- [ ] Player checkboxes verified on both sides of 2026-10-11 00:00 America/Denver: one child checked plays alone as that child, both checked is two-player with a random first player on every Go and Restart, none checked disables Go (R4, R6, R7)
- [ ] Splash verified in both builds: default (permanent birthday) shows the birthday splash on both sides of the cutoff; dated-birthday shows the birthday splash before and the generic splash after (R2, R38)
- [ ] Both build configurations compile: `npm run build` (default) and `npm run build:dated-birthday`
- [ ] Deck-building rules verified: every combination of themes, variants and fill the grid produces the right card count and a board with whole pairs
- [ ] Matching verified by face identity, including boards with repeated pairs
- [ ] Layout verified at phone and tablet sizes in portrait and landscape, including 40 cards, with 3:4 cards and no stretched art
- [ ] A new reviewer can tell the base and alternate faces of any activity apart in the large reveal (R15)
- [ ] Base face uses the manifest default colors, so it matches the approved SVG appearance (R9, R28)
- [ ] The alternate face changes exactly one approved variant slot compared with the base (R28)
- [ ] Non-variant groups are unchanged between base and alternate, and between every copy of a face (R27, R28)
- [ ] Only slots on the edition's approved allow-list can be selected, and excluded slots never are (R28, R35)
- [ ] A non-color cue accompanies every slot recoloring (R29)
- [ ] The non-color cue appears consistently on the board card and in the large reveal (R15, R29)
- [ ] Both cards of a face render identically within a game (R12, R28)
- [ ] Repeated pairs of a face (fill the grid) render identically to each other (R11, R12, R28)
- [ ] Go and Restart reroll the per-theme slot and color treatment (R28)
- [ ] Variants off deals only base faces, with no variant cues (R9, R29)
- [ ] Face-down cards show neither the selected slot, the cue, nor the face identity (R29, R30)
- [ ] A reviewer can tell every approved base/alternate combination apart without relying on color alone, at board size and reveal size, including a color-blind simulation (R29)
- [ ] Face identity stays `{ themeId, variantId }`: the selected slot or color creates no extra match identities (R12)

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Birthday date (October 10, 2026) is too close for the full workflow | High | High | Superseded 2026-10-11: birthday screens are permanent (R38), so the date is no longer a launch deadline. The greeting page (R1) still ships first. |
| Real children's likenesses used in artwork | Medium | Medium | Gift edition only. The public edition uses invented characters (R35). Source of likeness to be decided. |
| Responsive wrapping changes where cards sit on rotation, hurting position memory | Medium | Medium | Cards keep their order (R14). Accepted by the owner as part of the design. |
| 40 cards on a small phone gives tiny cards | Medium | Medium | Large pair reveal (R15), minimum card size, and a vertical scroll fallback (see Assumptions). |
| Color differences are hard to tell apart for color-blind players | Medium | Medium | Every recoloring carries a non-color cue (R29), and QA checks every approved combination at board and reveal size. |
| A recolored slot is too small or ambiguous to be a clear but slight difference (for example sparkles or a single climbing hold) | Medium | Medium | Only slots on an approved allow-list can be selected (R28). The allow-list was confirmed 2026-10-12 (DS-009 §3.9.1), and QA checks legibility of every included slot. |
| The non-color cue gives away the face while the card is face down | High | Low | The cue is part of the face side only and the back stays identical (R29, R30). QA checks face-down cards. |
| The current build and STEP-06 integration still use the former flat SVGs and a fixed circle/star difference, which no longer match R28 and R29 | Medium | High | Downstream role-owned updates are listed in the change log. The new art package is not release evidence until integrated and approved. |
| Prior activity SVGs carried C2PA provenance blocks that the new files drop, while the logo keeps its block | Low | Medium | The Moderator decides whether the removal is acceptable for publication (Open Questions). |
| Cutoff depends on the device clock and time zone handling | Medium | Low | Check the date in the America/Denver zone, keep the rule data-driven (R3), and test both sides of the cutoff. The default build no longer depends on the cutoff for the splash (R38), and players never do (R4). |
| Permanent birthday screens reach the wrong audience or outlive the family's wishes | Low | Low | The flag is build-time only. The `dated-birthday` build restores the original splash behavior (R38). Birthday messages stay out of gameplay and the end screen. |
| Squishies and Red Pandas are hard to illustrate generically | Low | Medium | Settle the art direction in the prototype step. |
| K-n-C logo not ready | Low | High | Use a text placeholder until it exists (R30). |
| Site repo and hosting path unclear (two private repos) | Medium | Medium | Confirm which repo serves the site and the subfolder base path before the build. |

---

## Assumptions and Constraints

**Constraints**

- Built in Angular 21+ with signals, not React. Delivered as static files. No backend.
- Hosted as a subfolder of kira-n-calvin.com, following the site's folder-per-occasion pattern.
- Card art is SVG. Cards are 3:4 portrait. The board is at most 40 cards.
- Each activity is one square SVG with top-level non-variant groups and variant slots, plus a manifest of groups, slots and default colors. Slot differences are color changes only. Non-variant groups never change (R27, R28).
- The product is called a "memory game", not a "concentration game".
- Cutoff and date checks use the America/Denver time zone.
- Accessibility target is WCAG 2.2 AA. Beyond R33, this includes: visible keyboard focus on every control and card; focus moves into each popup, reveal and end screen when it opens, stays within it while open, and returns to the control that opened it when it closes; Escape closes the options popup when it was opened from a game (R37) and cancels "Start over?"; animations are reduced or removed when the device asks for reduced motion; variant differences are never shown by color alone; and every sound has a visual equivalent.

**Assumed defaults (stated, not yet formally confirmed)**

- Match pause is about 1.5 seconds. A click on either displayed card dismisses a mismatch, as do Enter and Space.
- Show All lasts about 3 seconds. The splash lasts about 3 seconds.
- Restart (like Go) re-rolls the random theme selection, each theme's variant slot and alternate color treatment and, in two-player, the first player. A single player stays the checked child.
- The slot and color treatment are chosen once per theme per game, uniformly at random among the activity's eligible slots on the confirmed allow-list (design-spec.md DS-009 §3.9.1). No slot is preferred and none is weighted. The allow-list is edition content (R35), not engine logic.
- If QA rejects an included slot at board or reveal size, the slot is removed from the allow-list and the others are not reweighted. An activity left with fewer than two eligible slots returns to the Product Owner and Designer.
- Exactly one slot differs between the base and alternate face of a theme. The alternate color must differ clearly from the slot's default.
- The non-color cue is supplied by the card presentation, so the activity SVGs need not contain it.
- If the minimum card size cannot fit every card, the table area scrolls vertically as a last resort.
- The permanent birthday flag (R38) changes the splash only. Players follow the checkboxes in every build (R4).
- The player checkboxes apply in every build. The `dated-birthday` build does not bring back the old Two players option or the Kira-first rule.
- Player checkboxes do not filter themes: any child can play any theme.
- The default build has the permanent birthday flag on. The `dated-birthday` build is the build-time fallback.
- The end screen celebration is confetti.
- The options popup first opens with all ten themes checked and Kira checked alone, unless options saved on the device exist (R36).
- When fill the grid is first checked, the value starts at the current card count rounded up to a multiple of 4 (within 4 to 40).
- Behind the first-open popup the table shows a face-down preview; when the popup opens from a game, the live board stays behind it.
- In two-player, the header always lists Kira, then Calvin; the first player is shown by the active highlight.
- Best single-player scores are kept per card count, variants on or off, and player.

---

## Open Questions

| Question | Owner | Due |
| -------- | ----- | --- |
| What does the website greeting page say, and does it include photos? | Product Owner | Before the greeting page is built |
| What is the minimum card size? | Designer | Prototype step |
| What is the exact list of variant difference types (color, pattern, accessory, orientation)? | Designer | Superseded 2026-10-12: the difference is a slot recoloring (R28). Pattern, accessory-presence and orientation are not required. |
| Which slots are on the approved allow-list for each activity? Very small or ambiguous slots must be excluded. | Product Owner and Designer | Resolved 2026-10-12: the allow-list in design-spec.md DS-009 §3.9.1 is confirmed. QA legibility results may still remove a slot (Assumptions). |
| Is any slot preferred rather than uniformly random? | Product Owner and Designer | Resolved 2026-10-12: no slot is preferred. Selection is uniform among each activity's eligible slots. |
| Which alternate colors or palettes are approved for each allowed slot? | Designer | Before the design-spec revision is approved |
| What is the final non-color cue treatment, and how is it drawn consistently on the board card and the reveal without showing anything face down? | Designer | Before the design-spec revision is approved |
| What are the minimum legibility and color-blind verification criteria at board and reveal sizes? | QA | Before the acceptance plan is updated |
| Is the removal of the C2PA provenance blocks from the activity SVGs acceptable for publication, given the logo still carries its block? | Moderator | Before publication |
| Approval of the revised requirement baseline (R9, R15, R27, R28, R29, R35). | Moderator | Resolved 2026-10-12: approved by the Moderator, including R29 at Must have. |
| How are Squishies and Red Pandas illustrated? | Designer | Prototype step |
| Are likenesses based on real photos or on described traits (hair color, age)? | Product Owner | Before art production |
| What does the K-n-C logo look like? | Product Owner | Before the final art pass |
| Which sounds are used for flip, match and win? | Designer | Prototype step |
| Which repository serves the site (kira-n-calvin.com or kira-n-calvin), and what is the game's subfolder name? | Product Owner | Before the architecture handoff |
| What is the release scope for the birthday date (must-have versus follow-on)? | Product Owner | Resolved 2026-10-11: birthday screens are permanent (R38). |
| After the cutoff, should Kira stay the single player and first player (R4), or should players stay random as the cutoff rule says? | Product Owner with stakeholders | Resolved 2026-10-11: players are chosen with the Kira and Calvin checkboxes (R4, R6). |
| Should birthday messages appear beyond the splash (for example on the end screen)? Non-goal 5 and R21 say no. The 2026-10-11 decision covers screens and messages on the splash only. | Product Owner with stakeholders | Before the next release |

---

## Sources / References

- spec-01.docx, Draft 03 (spec notes 1 to 47)
- templates/PRODUCT.md from the MOD-W repository (https://github.com/fpmcguire/mod-w)
- Site: http://kira-n-calvin.com/ and the private repositories fpmcguire/kira-n-calvin.com and fpmcguire/kira-n-calvin
- Reference memory-game projects reviewed early on: sen-ltd/memory-game, mdevworks/memory-game, fallaciousreasoning/memory, MimsySith/pairs-game

---

## Change Log

| Date | Change | Affected R-IDs | Source |
| ---- | ------ | -------------- | ------ |
| 2026-10-12 | Moderator approved the Product Owner's confirmation of the slot allow-list, the no-preferred-slot decision and the related `product.md` change (commit 7da2ee0). Tech Lead work may now start. | R9, R15, R27, R28, R29, R30, R35 | Moderator approval |
| 2026-10-12 | Product Owner confirmed the Designer's per-activity slot allow-list (design-spec.md DS-009 §3.9.1) and its recommendation that no slot is preferred, as approved by the Moderator in commit d899e8b. Selection stays uniform among each activity's eligible slots. The allow-list remains edition content under R35. Excluded slots are accepted as too small, thin, scattered, ambiguous or dominant. No requirement text changed. Resolved the allow-list and preferred-slot open questions. QA may still remove an included slot on legibility evidence, without reweighting. | R9, R15, R27, R28, R29, R30, R35 (R12 unchanged) | Product Owner validation of Designer revision 024bae8; Moderator approval d899e8b |
| 2026-10-12 | Moderator approved the Product Owner's slot-based SVG variant revision and its recommendations as the requirement baseline, including R29 raised to Must have. Downstream role-owned updates (Designer, Tech Lead, Development Team, QA) may now start. The slot allow-list, alternate palettes, final non-color cue, QA legibility criteria and the C2PA-removal decision remain open with their named owners. | R9, R15, R27, R28, R29, R35 | Moderator approval |
| 2026-10-12 | Adopted the structured, child-prefixed SVG activity-art contract and slot-based recoloring. R9: variants off deals the default base pair, variants on adds an alternate pair that recolors one approved slot with a non-color cue. R15: the recolored slot and cue must stay clearly distinguishable in the reveal. R27: non-variant groups never change, variant slots are the only changeable parts. R28: replaced the random choice among color, pattern, accessory and orientation with a per-theme, per-game choice of one allow-listed slot and a Designer-approved color treatment, rerolled on Go and Restart. R29: every color difference carries a non-color cue supplied by the card presentation, and its priority is raised from Should have to Must have. R35: SVGs, manifest, allow-lists and palettes are edition content and the engine stays generic. R12 unchanged. Scenarios 3, 10 and 11, acceptance criteria, risks, assumptions and open questions aligned. | R9, R15, R27, R28, R29, R35 (R12 unchanged) | Tech Lead review of the structured SVG format, approved by the Moderator 2026-10-12; Product Owner revision |
| 2026-10-11 | Stakeholder decision, relayed by the Moderator: the Two players checkbox is replaced by Kira and Calvin checkboxes. One checked is single-player with that child; both checked is two-player with a random first player on every Go and Restart; none checked disables Go; first open checks Kira alone. The cutoff no longer affects players, and its record no longer holds a player. Applies in every build. Moderator agreed the eight Product Owner recommendations. Added scenario 9. | R3, R4, R6, R7, R38 | Stakeholder decision via Moderator |
| 2026-10-11 | Stakeholder decision, relayed by the Moderator: the birthday screens and messages become permanent, not only for 2026-10-10. Added R38 (build-time flag `permanentBirthday`; default build on; `dated-birthday` build restores the cutoff for the splash). R1, R2, R3 and R4 reworded to match; R4 player rules unchanged. Scenario 8, acceptance checks, risks, assumptions and open questions updated. Resolves STEP-04 N7. | R1, R2, R3, R4, R38 | Stakeholder decision via Moderator |
| 2026-10-10 | Moderator confirmed design-spec revision 2 decisions. R25 reworded: New Game no longer asks "Start over?"; Go from a popup over a game does. R37 detail added: Escape closes, timer pauses while the popup is open. Added accessibility constraint and assumed defaults (first-open themes, stepper start, board behind popup, header order, best-score key). Removed resolved open questions. | R25, R37 | Design-spec rev. 2, Product Owner re-review |
| 2026-10-10 | Added options popup close behavior for returning to the current game unchanged | R37 | Prototype review |
| 2026-10-10 | Initial draft derived from the working spec | R1 to R36 | spec-01.docx, Draft 03 |

---

MOD-W v5.0.1
