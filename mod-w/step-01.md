# STEP-01 - Greeting Page and Static Hosting Shape

**Status:** Approved by Moderator
**Development Team interface:** Claude Code
**Step type:** Implementation

## Approval Record

- **Moderator:** fpmcguire
- **Date:** 2026-10-10
- **Decision:** Approved for Development Team implementation.
- **Final Gate:** Approved Development Team implementation and Tech Lead review on 2026-10-10.

## Goal

Deliver the separate birthday greeting page required by R1 before the game work. It should fit the static Angular app and link to a game placeholder route without implementing game behavior.

## Requirements

- R1: birthday greeting page greets Kira and links to the game.
- R34: static page in its own subfolder of `kira-n-calvin.com`, with site linking assumptions documented.
- Product risk: birthday date is urgent; ship greeting first.

Design coverage: no DS-ID exists. `design-spec.md` section 4.7 explicitly says the greeting page is not designed.

## Scope

- Add a greeting route/page and a game placeholder route/page.
- Keep greeting copy minimal and easy to replace when Product Owner supplies final wording.
- Make the game link a normal accessible link or button-style link.
- Document the assumed deployment subfolder/base href in the implementation notes or README.
- Do not implement game rules, options, card art, prototype behavior or QA sign-off.

## Likely Affected Areas

- `src/app/app.routes.ts`
- New greeting component under `src/app/greeting/`
- New placeholder game route under `src/app/game/`
- Global styles only if needed for accessible layout
- README or implementation note for base path assumption

## Acceptance Checks

- AC1: Visiting the root route shows a greeting page for Kira and a clear link to the game.
- AC2: The game link navigates to a game placeholder without a full page reload.
- AC3: The greeting page has one logical `h1`, visible focus on the game link, and no obvious keyboard trap.
- AC4: Text contrast meets WCAG AA and automated axe checks pass for the greeting and placeholder pages.
- AC5: The build remains static and succeeds with `npm run build`.
- AC6: No prototype files, `design-spec.md`, `qa.md` or Product Owner sign-off files are edited.

## Test Expectations

- Add or update Angular tests to verify route rendering and the game link target.
- Run `npm test` if available for the touched tests.
- Run `npm run build`.
- Run an automated accessibility check if the project has tooling available; otherwise record that axe evidence remains due in QA/Step 06.

## Reference Implementation

No prototype component covers R1.

- Greeting page: Reject - not present in prototype.
- Game placeholder: Reject - prototype is a full non-Angular game and must not be imported.

## Notes for Development

The Product Owner still owes final greeting copy, photos/layout, exact site repository and subfolder name. Use conservative placeholder copy that can be replaced without changing architecture. Keep this Step intentionally small so the urgent R1 deliverable can move independently of the game.

