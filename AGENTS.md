You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer separate `.ts`, `.html`, and `.scss` files for Angular components, including small components
- Use `templateUrl` and `styleUrl` with paths relative to the component TS file
- Place each Angular component's `.ts`, `.html`, and `.scss` files in that component's own folder
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Testing

- Use Playwright for end-to-end browser tests.
- Keep e2e specs under `e2e/` and run them with `npm run test:e2e`.

## Git

- All future commit messages MUST follow Conventional Commits format, for example `docs(mod-w): add step 03 plan`.

## Generated Project Status

- At session start, read `status.md` first.
- At every gate transition (any Moderator approval, rejection, scope change, or role handoff), overwrite `status.md` first with: the next action and a ready prompt; where the project stands; what is waiting and on whom; open Moderator decisions; recently done; and the base commit.
- `status.md` is derived and never authoritative. If it disagrees, `mod-w/roadmap.md`, Step files, `mod-w/qa.md`, `mod-w/sign-off.md`, `mod-w/review.md`, and Git govern.
- On Moderator approval, record the approval and make a Conventional Commit without asking first. Do not push or tag unless asked. Rejected work is recorded in `status.md` and the appropriate authoritative record. Commit those records on their own (for example `docs(mod-w): record rejection of ...`); do not commit the rejected work product.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
