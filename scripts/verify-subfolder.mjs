// Serves the production build under its subfolder and checks the app loads there (R34, AC24).
// Run after `npm run build:subfolder`. It exercises only the app's own routing and asset paths;
// the real static host and its deep-link fallback are checked separately (AC25).
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = join(import.meta.dirname, '..', 'dist', 'kira-n-calvin-memory', 'browser');
const BASE = '/kira-n-calvin-memory/';
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.png': 'image/png',
};

if (!existsSync(join(ROOT, 'index.html'))) {
  console.error(`No build at ${ROOT}. Run npm run build:subfolder first.`);
  process.exit(1);
}
const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
if (!index.includes(`<base href="${BASE}">`)) {
  console.error(`index.html does not declare <base href="${BASE}">; rebuild with build:subfolder.`);
  process.exit(1);
}

/** Serves files only under BASE; unknown extensionless paths fall back to index.html (SPA). */
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (!url.pathname.startsWith(BASE)) {
    res.writeHead(404).end('outside the subfolder');
    return;
  }
  const relative = normalize(decodeURIComponent(url.pathname.slice(BASE.length)));
  const file = join(ROOT, relative);
  const isFile = file.startsWith(ROOT) && existsSync(file) && statSync(file).isFile();
  const target = isFile ? file : extname(relative) ? null : join(ROOT, 'index.html');
  if (!target) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(target)] ?? 'application/octet-stream' });
  createReadStream(target).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;
const failures = [];

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const badResponses = [];
  const requests = new Set();
  const consoleErrors = [];
  page.on('request', (request) => requests.add(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${origin}${BASE}game`);
  await page.getByTestId(/^splash-screen-root-/).waitFor();
  await page.reload();
  await page.getByTestId(/^splash-screen-root-/).waitFor();
  await page.getByTestId(/^splash-screen-root-/).click();
  await page.getByTestId('options-dialog-root').waitFor();
  await page.getByTestId('options-action-button-go').click();
  await page.getByTestId('board-grid-root-live').waitFor();
  const art = page.locator('[data-testid="board-card-button-0"] .front img');
  // Settles on load or error, so a failed request reports below instead of hanging.
  await art.evaluate(
    (el) =>
      new Promise((resolve) => {
        if (el.complete) {
          resolve(true);
        } else {
          el.addEventListener('load', () => resolve(true));
          el.addEventListener('error', () => resolve(false));
        }
      }),
  );
  if ((await art.evaluate((el) => el.naturalWidth)) === 0) {
    failures.push('the first card art did not decode under the subfolder');
  }

  const leaked = [...requests].filter(
    (url) => url.startsWith(origin) && !url.startsWith(origin + BASE),
  );
  if (leaked.length > 0) {
    failures.push(`root-relative requests outside ${BASE}: ${leaked.join(', ')}`);
  }
  if (badResponses.length > 0) {
    failures.push(`failed responses: ${badResponses.join(', ')}`);
  }
  if (consoleErrors.length > 0) {
    failures.push(`console errors: ${consoleErrors.join(' | ')}`);
  }
  console.log(
    `Loaded ${requests.size} URLs under ${origin}${BASE}; deep link and refresh checked.`,
  );
} finally {
  await browser.close();
  server.close();
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Subfolder check passed.');
