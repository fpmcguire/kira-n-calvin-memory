# STEP-05 - Persistence and Sound Feedback

**Status:** Completed. Product Owner accepted with notes; Moderator signed off 2026-10-11 (tag `step-05-complete`)
**Development Team interface:** Claude Code
**Step type:** Implementation

---

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Tech Lead's STEP-05 planning, architecture/domain/roadmap updates, and STEP-05 prep work for Development Team implementation.

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Reviewed the Development Team's STEP-05 implementation (commit `b1ce86c`, Claude Code) and approved it for Tech Lead review. Dev Team reported, under Node v26.0.0: `npm test -- --watch=false` 303 passed / 1 skipped; `npm run build` and `npm run build:dated-birthday` succeeded; `npm run test:e2e` 62 passed / 1 skipped (pre-existing flag-dependent skip in `e2e/cutoff.spec.ts`). Per the STEP-04 Moderator decision, the Tech Lead review record goes in a separate commit.

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Tech Lead's STEP-05 review record and Pass verdict (`628c6a3`) and approved STEP-05 for QA handoff.

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the QA record for STEP-05 (`1fce1ac`, Pass with notes: AC1-AC19 pass, no defects, non-blocking notes N1-N5) and approved STEP-05 for Product Owner acceptance.

- **Moderator:** fpmcguire
- **Date:** 2026-10-11
- **Decision:** Approved the Product Owner's STEP-05 sign-off, verdict "Accepted with notes" (`sign-off.md`). N1 accepted as-is with a Designer docs fix to design-spec §3.6 later. N2 accepted for STEP-05 with a follow-up for future edition work. STEP-05 is complete and tagged `step-05-complete`.

---

## Goal

Add the remaining small user-facing continuity features after STEP-04: remember last-used options, remember single-player best scores on the device, persist the sound preference, and wire the Sound toggle to card flip, match and win feedback.

STEP-04 already implemented the end screen, Restart/New Game, "Start over?" confirms, timer pause/resume under the options popup, permanent birthday flag and player checkboxes. STEP-05 must build on that behavior without reworking it.

---

## Related Requirements

- R4 - Player checkboxes decide who plays; both checked randomizes first player on every Go and Restart. Cutoff does not affect players.
- R6 - Options popup includes Kira and Calvin player checkboxes plus the approved options.
- R7 - Go requires at least one player and one theme; Reset clears all options.
- R21 - End screen shows result and no birthday message.
- R31 - Sound on/off button in the header, with sounds for card flip, match and win.
- R36 - Best scores and last-used options are remembered on the device.
- R38 - Permanent birthday flag changes the splash only, never players or gameplay.

## Related Design IDs

| Design ID | Design element | Design intent to preserve | Product requirement |
| --------- | -------------- | ------------------------- | ------------------- |
| DS-006 | Sound toggle | Header toggle exposes on/off state with `aria-pressed`; sound state is not the only feedback. | R31 |
| DS-016 | End screen | Single-player best-score note; no birthday message; two-player result stays winner/tie oriented. | R21, R36 |
| DS-021 | Sound cues | Flip, match and win cues; muted when Sound is off. Placeholder tones are acceptable until final assets. | R31 |
| DS-024 | Memory on the device | Last options restored on first open; best score keyed by player plus board. | R36 |
| DS-020 | Player assignment | Persist `players` as Kira/Calvin checkboxes; never restore the retired Two players option. | R4, R6, R7 |

---

## Assigned Dev Team Interface

- [x] Claude Code
- [ ] Claude Design

---

## Scope

- Add a small storage boundary for game preferences and scores. It validates stored JSON and falls back to defaults when storage is missing, malformed, stale, unavailable or references unknown players/themes.
- Restore last-used options on the first options popup when valid. This includes `players`, `variants`, `fill`, `fillCount` and selected `themes`.
- Save last-used options only when Go successfully starts a game. Dirty draft changes, Close/Escape and cancelled "Start over?" do not update storage.
- Keep Reset semantics unchanged: Reset clears the draft, including both player checkboxes; it does not overwrite the remembered options unless the player later starts a valid game.
- Store and display single-player best scores per player plus board key (`card count + variants on/off`). Fewest attempts is the primary score; elapsed time may be stored/displayed as supporting data when useful.
- Show the approved single-player end-screen best note from DS-016. Two-player games do not create or display best-score records in this Step.
- Persist the sound preference and move Sound state out of the header-only local signal so the setting survives route visits/reloads.
- Wire sound cues for card flip, match and win through an injectable service. Stubbed/generated tones are acceptable; final sound assets remain STEP-06.
- Ensure sound respects the toggle and storage preference. If audio cannot play, the game must continue normally.
- Preserve the approved post-STEP-04 behavior: permanent birthday flag affects splash only; dated-birthday restores cutoff-driven splash only; player checkboxes are independent of the cutoff in every build.

---

## Out of Scope

- Final sound files or sound design beyond simple placeholder tones.
- Final SVG likeness art, final K-n-C logo asset and release hosting/base-path hardening.
- Two-player best-score history or leaderboards.
- Cloud sync, accounts, backend storage or cross-device persistence.
- Changing Restart/New Game/confirm/timer behavior already accepted in STEP-04.
- Changing splash feature flags or dated-birthday build behavior.
- D3 fill-slider target-size follow-up, real-device matrix and screen-reader smoke tests; STEP-06 still owns those.
- Editing prototype files, `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md` or `mod-w/sign-off.md` during Dev Team implementation.

---

## Inputs

- `mod-w/product.md` (R4, R6, R7, R21, R31, R36, R38)
- `mod-w/design-spec.md` (DS-006, DS-016, DS-020, DS-021, DS-024)
- `mod-w/architecture.md` (Device Persistence and Sound; Build-Time Feature Flags)
- `mod-w/domain-language.md` (Last-used options, Best score, Board key, Sound preference)
- `mod-w/roadmap.md` (STEP-05 row and carry-forward notes)
- `mod-w/review.md`, `mod-w/qa.md`, `mod-w/sign-off.md` (STEP-04 completion and post-STEP-04 approved changes)
- Existing STEP-04 game state, end screen, header and e2e coverage

---

## Likely Affected Files

- `src/app/game/game-state.ts` and related specs
- `src/app/game/game-header/**`
- `src/app/game/end-screen/**`
- New focused helpers/services under `src/app/game/`, for example `game-storage`, `sound`, or equivalent names
- `src/app/domain/**` only for pure score-key/storage-shape helpers if useful
- `src/app/content/**` only if a typed placeholder sound/content reference is needed
- `e2e/**` for focused persistence and sound-toggle coverage

---

## Reference Implementation

**Location:** `prototype/Memory Game.dc.html`

**Disposition:** Adopt with modifications.

- Preserve the approved user-visible behavior for Sound, best-score note text and remembered options.
- Do not port prototype runtime code. Implement through Angular signals/services, typed storage validation, component inputs/outputs and existing game-state flow.
- Do not copy prototype inline content into the engine.
- Placeholder Web Audio tones may follow the prototype's "short flip tone / rising match / rising win" intent, but tests must use fakes or observable service calls rather than depending on real audio.
- Storage keys and schemas are production architecture decisions, not prototype decisions. Keep them versioned or otherwise safely invalidatable.

---

## Acceptance Checks

- [ ] AC1: On a first visit with no valid saved options, the first-open popup keeps the approved default: Kira checked alone, Calvin unchecked, all ten themes checked, variants/fill off, and Go enabled.
- [ ] AC2: When Go starts a valid game, last-used options are saved with `players` as an array of child IDs. Reopening the game later restores those options in the first-open popup and preview summary.
- [ ] AC3: Restored options are validated. Malformed JSON, unknown players/themes, impossible fill counts, empty players or empty themes fall back safely to defaults without throwing.
- [ ] AC4: Reset clears the draft, including both player checkboxes, but does not replace remembered options unless a later valid Go starts a game.
- [ ] AC5: New Game over a live or completed game still opens with current applied settings. Close/Escape and cancelling "Start over?" do not save dirty draft changes.
- [ ] AC6: Cutoff and `FEATURE_FLAGS.permanentBirthday` do not affect restored players, saved players or player assignment. The dated-birthday build changes splash behavior only.
- [ ] AC7: Saved two-player options restore both player checkboxes, but they do not save or restore a first player. First player is still randomized on every Go and Restart.
- [ ] AC8: Single-player completion stores a best score under player + board key (`card count + variants on/off`) when the score is new or no record exists.
- [ ] AC9: A worse or equal single-player completion does not overwrite a better best score. The end screen shows the appropriate DS-016 best-score note.
- [ ] AC10: Best scores are per player. Kira and Calvin single-player games on the same board do not overwrite each other.
- [ ] AC11: Best scores are per board key. Different card counts or variants on/off have separate records.
- [ ] AC12: Two-player completions do not create single-player best-score records and do not show a best-score note.
- [ ] AC13: The Sound button state is owned by game state/service, exposes correct `aria-pressed` and `data-state`, persists across route visits/reloads, and remains at least 44 px.
- [ ] AC14: With Sound on, selecting a card triggers a flip cue, a match triggers a match cue, and completing the game triggers a win cue. With Sound off, no cue is requested.
- [ ] AC15: Audio failures or unavailable Web Audio do not break gameplay, tests, focus flow or end-screen completion.
- [ ] AC16: Existing STEP-04 flows still pass: Restart rerolls players when both are checked, Go/Restart confirmations preserve draft/live state as before, and no birthday message appears inside gameplay or on the end screen.
- [ ] AC17: Accessibility coverage remains clean for affected states: first-open popup with restored options, Sound toggle on/off, single-player end screen with best note, and two-player end screen without best note.
- [ ] AC18: Required verification passes under a compatible Node version: `npm test -- --watch=false`, `npm run build`, `npm run build:dated-birthday`, and `npm run test:e2e`.
- [ ] AC19: Dev Team implementation does not edit prototype files, `mod-w/design-spec.md`, `mod-w/qa.md`, `mod-w/review.md`, `mod-w/sign-off.md`, or unrelated implementation areas. Per the STEP-04 Moderator decision, the later Tech Lead review record must be a separate commit.

---

## Test Expectations

- Unit tests cover storage parsing/validation, defaults, save timing, malformed data fallback, best-score comparison, per-player/per-board keys, and storage failure fallback.
- Game-state/component tests cover restored first-open draft, Reset versus saved options, dirty draft not saved on Close/Escape/cancel, best-note display and two-player no-best behavior.
- Sound tests use a fake/injected sound service to assert requested cue names and mute behavior. They must not rely on actual audio output.
- Browser e2e covers at least one route/reload persistence path for last-used options, one single-player best-score path, one worse-score no-overwrite path and the Sound toggle state.
- Axe checks cover the affected states listed in AC16 with the existing widened helper.
- Keep timer/audio tests deterministic with fake timers, injected clocks or service fakes rather than wall-clock sleeps.

---

## Plan

1. Add typed storage helpers/services with validation and graceful failure behavior.
2. Hydrate initial draft options and sound preference from storage, falling back to current defaults.
3. Save options on successful Go only, preserving existing non-destructive draft behavior.
4. Add best-score keying, comparison and end-screen note data for single-player results.
5. Move sound state into game state or an injected service and wire flip/match/win cue requests.
6. Add focused unit/component/e2e coverage, then run the required command set including the dated-birthday build.

---

## Change Notes

| Date | Change | Reason |
| ---- | ------ | ------ |
| 2026-10-11 | Initial STEP-05 draft. | Plan the remaining persistence and sound slice after STEP-04 absorbed end/restart/confirm behavior and after post-STEP-04 birthday/player changes were approved. |
| 2026-10-11 | Development Team implementation committed in `b1ce86c`; Moderator approved it for Tech Lead review. | Hand off STEP-05 for Tech Lead review before QA. |
| 2026-10-11 | QA recorded Pass with notes (`1fce1ac`); Moderator approved it for Product Owner acceptance. | Hand off STEP-05 to the Product Owner gate. |
| 2026-10-11 | Product Owner recorded Accepted with notes (`67fb161`); Moderator approved and tagged `step-05-complete`. | Close STEP-05. N2 follow-up and STEP-06 carry-forwards recorded in `roadmap.md`. |

---

## Review Notes

---

## QA Notes

---

MOD-W v5.0.1
