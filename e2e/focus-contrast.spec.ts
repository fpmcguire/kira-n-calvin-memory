import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  BEFORE_CUTOFF,
  card,
  contrast,
  faceKeys,
  flipMismatch,
  focusRingOf,
  openGame,
  pairsOf,
  pinClock,
  playMatch,
  skipToFirstOptions,
  splash,
  startGame,
} from './support';

/**
 * Focus-indicator contrast (STEP-06 AC11; WCAG 2.2 1.4.11 and 2.4.7/2.4.11). Each case gives
 * a control keyboard focus, reads the ring it paints and the surface behind it, and requires
 * at least 3:1. Colors are resolved by the browser's canvas (oklch() tokens included), not
 * sampled from screenshot pixels. The three-pixel ring sits 3 px off the control (or inside
 * the splash), so it is measured against the surface behind it, not the control's own fill.
 */
test.beforeEach(async ({ page }) => {
  await pinClock(page, BEFORE_CUTOFF);
});

async function expectRing(page: Page, locator: Locator, label: string, wanted: 'navy' | 'cream') {
  const focus = await focusRingOf(page, locator);
  expect(focus.focusVisible, `${label} shows :focus-visible`).toBe(true);
  expect(focus.style, `${label} outline style`).toBe('solid');
  expect(focus.width, `${label} outline width`).toBeGreaterThanOrEqual(2);
  const ratio = contrast(focus.ring, focus.surface);
  expect(
    ratio,
    `${label}: ring ${focus.ring} on ${focus.surface.map(Math.round)}`,
  ).toBeGreaterThanOrEqual(3);
  // Navy rings are dark and cream rings are light, so the cases below cover both token paths.
  const light = contrast(focus.ring, [255, 255, 255]) < 3;
  expect(light, `${label} ring tone`).toBe(wanted === 'cream');
  test.info().annotations.push({
    type: 'contrast',
    description: `${label}: ${wanted} focus ring on its surface ${ratio.toFixed(2)}:1 (non-text, min 3)`,
  });
}

test('navy ring on the light surfaces: greeting, header, options, board and end screen (AC11)', async ({
  page,
}) => {
  await page.goto('/');
  await expectRing(
    page,
    page.getByRole('link', { name: /play the memory game/i }),
    'greeting link',
    'navy',
  );

  await openGame(page);
  await skipToFirstOptions(page);
  await expectRing(
    page,
    page.getByTestId('options-player-checkbox-kira'),
    'options checkbox',
    'navy',
  );
  await expectRing(page, page.getByTestId('options-action-button-go'), 'options Go', 'navy');

  await page.getByTestId('options-action-button-go').click();
  await expect(page.getByTestId('board-grid-root-live')).toBeVisible();
  await expectRing(
    page,
    page.getByTestId('header-action-button-restart'),
    'header Restart',
    'navy',
  );
  await expectRing(page, card(page, 0), 'board card on the table', 'navy');
});

test('navy ring on the end-screen dialog (AC11)', async ({ page }) => {
  await startGame(page, { themes: ['dance'], fill: 4 });
  const pairs = pairsOf(await faceKeys(page));
  await playMatch(page, pairs[0]);
  await card(page, pairs[1][0]).click();
  await card(page, pairs[1][1]).click();
  await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
  await expectRing(
    page,
    page.getByTestId('end-action-button-new-game'),
    'end-screen New game',
    'navy',
  );
});

test('cream ring on the dark reveal overlay and on the navy splash (AC11)', async ({ page }) => {
  await startGame(page, { themes: ['dance', 'snowboard'] });
  const keys = await faceKeys(page);
  const other = keys.findIndex((key) => key.split('|')[0] !== keys[0].split('|')[0]);
  await flipMismatch(page, [0, other]);
  await expectRing(page, page.getByTestId('reveal-card-button-1'), 'reveal card', 'cream');

  await page.getByTestId('reveal-card-button-1').click();
  await page.goto('/game');
  await expect(splash(page)).toBeVisible();
  await expectRing(page, splash(page).locator('button'), 'splash', 'cream');
});
