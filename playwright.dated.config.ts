import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * The `dated-birthday` build (generic splash after the cutoff, STEP-06 AC13/AC27). The
 * default config serves the permanent-birthday build, which cannot render the generic
 * splash, so the dated-build specs run here against a second dev server whose build target
 * applies the `dated-birthday` file replacement. Run with `npm run test:e2e:dated`.
 */
const port = Number(process.env['E2E_DATED_PORT'] ?? 4201);
const baseURL = `http://127.0.0.1:${port}/`;

export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: /dated\.spec\.ts$/,
  outputDir: './test-results-dated',
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report-dated' }], ['list']],
  use: { ...base.use, baseURL },
  webServer: {
    command: `npx ng serve --build-target kira-n-calvin-memory:build:development,dated-birthday --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
