import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env['E2E_PORT'] ?? 4200);
const baseURL = `http://127.0.0.1:${port}/`;

export default defineConfig({
  testDir: './e2e',
  // Dated-build specs need the other build; they run via playwright.dated.config.ts.
  testIgnore: /dated\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run start -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
