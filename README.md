# KiraNCalvinMemory

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
npm run test:e2e
```

The project uses Playwright for browser e2e coverage. Use `npm run test:e2e:ui` for the interactive runner.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Build-time feature flags (R38)

The birthday splash ("Happy Birthday Kira!") is permanent in the default build. The flag `permanentBirthday` lives in `src/app/config/feature-flags.ts`.

To build the dated-birthday version, which shows the birthday splash only before the cutoff (2026-10-11 00:00 America/Denver):

```bash
npm run build:dated-birthday
```

The flag changes the splash only. Players come from the Kira and Calvin checkboxes in every build, on any date.

## Deployment base path (R34)

The source app uses `<base href="/">` for local development. For subfolder deployment at `https://www.frank-mcguire.com/kira-n-calvin-memory/`, build with:

```bash
npm run build:subfolder
```

The host must serve `index.html` for unknown paths under the folder if deep links such as `/kira-n-calvin-memory/game` are supported.
