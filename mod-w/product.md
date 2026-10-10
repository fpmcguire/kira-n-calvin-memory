# Product Definition

**Project:** Kira-n-Calvin Memory Game
**Date:** 2026-10-10
**Owner:** fpmcguire (Grandpa), Product Owner

---

## Problem Statement

Kira and Calvin are the owner's grandchildren, living in Colorado Springs, CO. The owner keeps a family website (kira-n-calvin.com) that he updates for birthdays and major holidays. For Kira's birthday on Saturday, October 10, 2026, he wants a gift that feels made for the two kids: a memory (matching pairs) card game where every card shows an illustrated Kira or Calvin doing an activity they actually love.

Generic memory games do not feel personal, and they give young players little reason to study the cards closely. This game turns the deck into a portrait of the kids' interests and uses small, deliberate card differences (variants) to make matching a game of looking carefully. Playing with the options is part of the fun.

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
4. Make matching a game of careful looking, using variant pairs and a large side-by-side reveal of every flipped pair.
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
| R1  | A birthday greeting page on kira-n-calvin.com, in the site's folder-per-occasion pattern, greets Kira and links to the game. It is separate from the game. | Must have |
| R2  | The game opens with a splash screen of about 3 seconds that a tap can skip. Before the cutoff it shows a "Happy Birthday Kira!" placeholder. After the cutoff it shows the K-n-C logo and the "Kira-n-Calvin Memory Game" title. | Must have |
| R3  | The cutoff is the end of Saturday, October 10, 2026 in Colorado time (2026-10-11 00:00 America/Denver). It is data-driven (date, time zone, player), not hard-coded. | Must have |
| R4  | Before the cutoff, the single player is always Kira, and Kira always goes first in two-player. After the cutoff, both are random between Kira and Calvin, chosen at the start of each game and on Restart. Two-player is always available. | Must have |
| R5  | After the splash, the board is displayed and an options popup opens over it. | Must have |
| R6  | The popup has checkboxes for single or two players, variants, and fill the grid, followed by two columns of theme checkboxes (Kira: Dance, Snowboard, Red Pandas, Squishies, Art; Calvin: Video games, Archery, Rock climbing, Drones, Gymnastics), and Reset and Go buttons. | Must have |
| R7  | Go is disabled until at least one theme is checked. Reset clears all options. | Must have |
| R8  | When fill the grid is checked, a slider or stepper appears: 4 to 40 in steps of 4. The number of cards on the table equals the chosen value exactly. | Must have |
| R9  | Variants off: one pair per checked theme. Variants on: two pairs per checked theme, the two pairs differing slightly. With fill the grid off, cards shown = checked themes x (1 or 2 pairs) x 2 cards. | Must have |
| R10 | Fill the grid on, more supply than needed: pick checked themes at random, include a theme's variant pair when variants are on, and continue until the grid is full. | Must have |
| R11 | Fill the grid on, less supply than needed: repeat the pairs round-robin until the grid is full. Leftover pairs go to randomly chosen themes, so no pair appears more than one extra time compared with the others. Extreme boards (for example one theme across 40 cards) are allowed. | Must have |
| R12 | Two cards match when they show the same face (same theme and same variant). Grid position never takes part in matching. Repeated pairs share one face identity, so any two copies match. | Must have |
| R13 | The grid is responsive: rows and columns follow the available table area and device orientation, and the cards wrap to fit. Cards keep a fixed 3:4 portrait ratio, have a minimum size, and an incomplete last row is left-aligned. | Must have |
| R14 | On rotation or resize the grid re-wraps. The cards keep their order and only the wrapping changes. | Must have |
| R15 | When the second card is selected, the pair appears large and side by side over the table so the details and the variant difference are clearly visible. This happens on every turn. | Must have |
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
| R27 | Card faces are SVG illustrations of Kira or Calvin doing the activity, reflecting each child's hair color, age and likeness. | Must have |
| R28 | The kind of difference between the two variants of an activity (color, pattern, accessory or orientation) is randomized per game, so players cannot memorize fixed variants. | Must have |
| R29 | A secondary cue (pattern or accessory) is available so variants stay distinguishable when the difference is color. | Should have |
| R30 | Every card has the same back: the K-n-C logo (a text placeholder until the logo exists). The back gives no hint about the front. | Must have |
| R31 | A sound on/off button in the header, with sounds for card flip, match and win. | Should have |
| R32 | Flip, reveal and disappear animations. | Should have |
| R33 | Accessibility: large tap targets and keyboard support (Enter and Space to select and dismiss). | Should have |
| R34 | The game is delivered as a static page in its own subfolder of kira-n-calvin.com and linked from the site. | Must have |
| R35 | Personal content (likenesses and activities) is kept separate from the game engine. The names Kira and Calvin and the K-n-C logo are brand and stay in every edition. | Should have |
| R36 | Best scores and last-used options are remembered on the device. | Nice to have |
| R37 | When the options popup is opened from an active or completed game, it has a close button that dismisses the popup and returns to the game exactly as it was, without changing options, rebuilding the deck, resetting scores, changing turns, or altering the timer state. Escape also closes the popup. While the popup is open over an active game, the timer is paused and resumes from the same value on close. | Should have |

---

## Key User Scenarios

1. Kira opens kira-n-calvin.com on her birthday and sees the greeting page, taps the link, sees the birthday splash, and lands on the board with the options popup. She picks a few themes, checks variants, and presses Go. She plays alone as Kira.
2. Kira and Calvin play together: they check two players, leave all ten themes on and variants on (a 40-card board). Kira goes first. She flips two cards, the pair appears large, they match and disappear, and she goes again. On a miss the pair stays up until she taps a card, then it is Calvin's turn.
3. A player looks closely at a mismatch: two blue and red snowboards appear side by side, large. The player studies the difference, remembers it, and taps to continue.
4. A player experiments with the options: one theme, fill the grid at 40. The board fills with that one face and the game becomes a very different challenge.
5. A player rotates a tablet mid-game: the grid re-wraps to the new shape, the cards keep their order, and removed pairs stay empty.
6. A player presses Show All to peek at the remaining cards. It costs an attempt, and the timer keeps running.
7. After the last pair, the end screen shows the result with confetti: attempts and time in single-player, or the winner in two-player. The player taps Restart for the same options, New Game to change them, or closes the options popup to return to the completed game unchanged.
8. After the birthday cutoff, the same game opens with the generic logo splash, and the single player and first player are random.

---

## Acceptance Criteria (Product-Level)

- [ ] All Must-have requirements implemented
- [ ] No unresolved critical risks
- [ ] qa.md completed
- [ ] review.md approved
- [ ] Moderator sign-off
- [ ] Cutoff behavior verified on both sides of 2026-10-11 00:00 America/Denver (Kira-first and birthday splash before, random and generic splash after)
- [ ] Deck-building rules verified: every combination of themes, variants and fill the grid produces the right card count and a board with whole pairs
- [ ] Matching verified by face identity, including boards with repeated pairs
- [ ] Layout verified at phone and tablet sizes in portrait and landscape, including 40 cards, with 3:4 cards and no stretched art
- [ ] A new reviewer can tell the two variants of any activity apart in the large reveal

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
| ---- | ------ | ---------- | ---------- |
| Birthday date (October 10, 2026) is too close for the full workflow | High | High | Ship the greeting page (R1) first. Treat the game as a follow-on release through the workflow. |
| Real children's likenesses used in artwork | Medium | Medium | Gift edition only. The public edition uses invented characters (R35). Source of likeness to be decided. |
| Responsive wrapping changes where cards sit on rotation, hurting position memory | Medium | Medium | Cards keep their order (R14). Accepted by the owner as part of the design. |
| 40 cards on a small phone gives tiny cards | Medium | Medium | Large pair reveal (R15), minimum card size, and a vertical scroll fallback (see Assumptions). |
| Color-only variants are hard to tell apart for color-blind players | Medium | Medium | Secondary cue (R29) and randomized difference types (R28). |
| Cutoff depends on the device clock and time zone handling | Medium | Low | Check the date in the America/Denver zone, keep the rule data-driven (R3), and test both sides of the cutoff. |
| Squishies and Red Pandas are hard to illustrate generically | Low | Medium | Settle the art direction in the prototype step. |
| K-n-C logo not ready | Low | High | Use a text placeholder until it exists (R30). |
| Site repo and hosting path unclear (two private repos) | Medium | Medium | Confirm which repo serves the site and the subfolder base path before the build. |

---

## Assumptions and Constraints

**Constraints**

- Built in Angular 21+ with signals, not React. Delivered as static files. No backend.
- Hosted as a subfolder of kira-n-calvin.com, following the site's folder-per-occasion pattern.
- Card art is SVG. Cards are 3:4 portrait. The board is at most 40 cards.
- The product is called a "memory game", not a "concentration game".
- Cutoff and date checks use the America/Denver time zone.
- Accessibility target is WCAG 2.2 AA. Beyond R33, this includes: visible keyboard focus on every control and card; focus moves into each popup, reveal and end screen when it opens, stays within it while open, and returns to the control that opened it when it closes; Escape closes the options popup when it was opened from a game (R37) and cancels "Start over?"; animations are reduced or removed when the device asks for reduced motion; variant differences are never shown by color alone; and every sound has a visual equivalent.

**Assumed defaults (stated, not yet formally confirmed)**

- Match pause is about 1.5 seconds. A click on either displayed card dismisses a mismatch, as do Enter and Space.
- Show All lasts about 3 seconds. The splash lasts about 3 seconds.
- Restart re-rolls the random theme selection, the variant difference type and the random player.
- If the minimum card size cannot fit every card, the table area scrolls vertically as a last resort.
- The Kira-first rule applies on any day before the cutoff, not only on October 10.
- The end screen celebration is confetti.
- The options popup first opens with all ten themes checked, unless options saved on the device exist (R36).
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
| What is the exact list of variant difference types (color, pattern, accessory, orientation)? | Designer | Prototype step |
| How are Squishies and Red Pandas illustrated? | Designer | Prototype step |
| Are likenesses based on real photos or on described traits (hair color, age)? | Product Owner | Before art production |
| What does the K-n-C logo look like? | Product Owner | Before the final art pass |
| Which sounds are used for flip, match and win? | Designer | Prototype step |
| Which repository serves the site (kira-n-calvin.com or kira-n-calvin), and what is the game's subfolder name? | Product Owner | Before the architecture handoff |
| What is the release scope for the birthday date (must-have versus follow-on)? | Product Owner | Today |

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
| 2026-10-10 | Moderator confirmed design-spec revision 2 decisions. R25 reworded: New Game no longer asks "Start over?"; Go from a popup over a game does. R37 detail added: Escape closes, timer pauses while the popup is open. Added accessibility constraint and assumed defaults (first-open themes, stepper start, board behind popup, header order, best-score key). Removed resolved open questions. | R25, R37 | Design-spec rev. 2, Product Owner re-review |
| 2026-10-10 | Added options popup close behavior for returning to the current game unchanged | R37 | Prototype review |
| 2026-10-10 | Initial draft derived from the working spec | R1 to R36 | spec-01.docx, Draft 03 |

---

MOD-W v5.0.1
