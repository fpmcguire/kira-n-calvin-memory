// Serves the production build under its subfolder and checks the app loads there (R34, AC30).
// Run after `npm run build:subfolder`. It exercises only the app's own routing and asset paths,
// through a SPA fallback this script supplies itself. It does NOT show real static-host
// deep-link support (AC25), the approved production base path (AC23) or final audio (AC6).
// BASE below is the assumed value used by `build:subfolder`, not an approved one.
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
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

const ART_DIR = join(import.meta.dirname, '..', 'public', 'content', 'kira-calvin', 'art');
const ART_FILES = readdirSync(ART_DIR).filter((name) => name.endsWith('.svg'));
const LOGO_FILE = 'content/kira-calvin/brand/logo.svg';
if (ART_FILES.length !== 10) {
  failures.push(
    `expected 10 activity SVGs in public/content/kira-calvin/art, found ${ART_FILES.length}`,
  );
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const badResponses = [];
  const okResponses = new Set();
  const requests = new Set();
  const consoleErrors = [];
  page.on('request', (request) => requests.add(request.url()));
  page.on('requestfailed', (request) => badResponses.push(`failed ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    } else {
      okResponses.add(response.url());
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const chunks = () => [...requests].filter((url) => /\.js$/.test(url)).length;

  // Greeting route, then the lazy game route through the app's own link.
  await page.goto(`${origin}${BASE}`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  const chunksAtGreeting = chunks();
  await page.getByRole('link', { name: /play the memory game/i }).click();
  await page.waitForURL(`${origin}${BASE}game`);
  await page.getByTestId(/^splash-screen-root-/).waitFor();
  if (chunks() <= chunksAtGreeting) {
    failures.push('navigating from the greeting loaded no further script (lazy game route)');
  }

  // Direct /game navigation and refresh.
  await page.goto(`${origin}${BASE}game`);
  await page.getByTestId(/^splash-screen-root-/).waitFor();
  await page.reload();
  await page.getByTestId(/^splash-screen-root-/).waitFor();
  await page.getByTestId(/^splash-screen-root-/).click();
  await page.getByTestId('options-dialog-root').waitFor();

  // Deal all ten themes with variants and a full 40-card grid so every activity SVG is on the board.
  await page.getByTestId('options-toggle-checkbox-variants').check();
  await page.getByTestId('options-toggle-checkbox-fill').check();
  await page.getByTestId('options-fill-stepper-slider').fill('40');
  await page.getByTestId('options-action-button-go').click();
  await page.getByTestId('board-grid-root-live').waitFor();

  // Show All turns every card face up, so every activity's inline SVG is on the board.
  await page.getByTestId('header-action-button-show-all').click();
  await page.locator('[data-testid^="board-card-button-"][data-state="peeked"]').first().waitFor();
  const drawn = await page
    .locator('[data-testid^="board-card-button-"] .front svg')
    .evaluateAll((svgs) => [...new Set(svgs.map((el) => el.getAttribute('data-activity')))]);
  if (drawn.length !== ART_FILES.length) {
    failures.push(
      `expected ${ART_FILES.length} inline activity SVGs on the board, found ${drawn.length}`,
    );
  }
  const edition = `content/kira-calvin/edition.json`;
  for (const src of [edition, ...ART_FILES.map((file) => `content/kira-calvin/art/${file}`)]) {
    if (![...okResponses].some((url) => url === `${origin}${BASE}${src}`)) {
      failures.push(`no successful request for ${BASE}${src}`);
    }
  }
  const decoded = new Set(drawn);

  // The logo (card back, header mark and generic splash all use this one path).
  const logoUrl = `${origin}${BASE}${LOGO_FILE}`;
  if (![...okResponses].some((url) => url === logoUrl)) {
    failures.push(`no successful request for ${BASE}${LOGO_FILE}`);
  }
  const logoDecoded = await page
    .locator(`img[src$="${LOGO_FILE}"]`)
    .first()
    .evaluate((el) => el.complete && el.naturalWidth > 0);
  if (!logoDecoded) {
    failures.push('the logo did not decode under the subfolder');
  }
  console.log(
    `Drew ${decoded.size} distinct inline activity SVGs (expected ${ART_FILES.length}), loaded edition.json and the logo.`,
  );

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
    `Loaded ${requests.size} URLs under ${origin}${BASE}; greeting, lazy game route, direct /game and refresh checked.`,
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
