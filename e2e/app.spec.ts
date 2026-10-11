import { expect, test } from '@playwright/test';
import {
  BEFORE_CUTOFF,
  card,
  cards,
  expectNoAxeViolations,
  faceKeys,
  fixRandom,
  flipMismatch,
  mismatchOf,
  openGame,
  pairsOf,
  pinClock,
  playMatch,
  playToTwoPlayerTie,
  reveal,
  skipToFirstOptions,
  splash,
  startGame,
  TIE_THEMES,
} from './support';

test.describe('app routes', () => {
  test('shows the greeting and navigates to the game without leaving the Angular app', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: /happy birthday, kira/i }),
    ).toBeVisible();

    await page.getByRole('link', { name: /play the memory game/i }).click();

    await expect(page).toHaveURL(/\/game$/);
    await expect(page.locator('app-game')).toBeVisible();
    await expect(splash(page)).toBeVisible();
  });
});

test.describe('axe accessibility (all impacts, WCAG and best-practice)', () => {
  test.beforeEach(async ({ page }) => {
    await pinClock(page, BEFORE_CUTOFF);
  });

  test('greeting route has no violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('game splash has no violations', async ({ page }) => {
    await openGame(page);
    await expectNoAxeViolations(page);
  });

  test('first-open options popup over preview board has no violations', async ({ page }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    await expect(page.getByTestId('board-grid-root-preview')).toBeAttached();
    await expectNoAxeViolations(page);
  });

  test('options popup with Fill the grid checked (stepper visible) has no violations', async ({
    page,
  }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    await page.getByTestId('options-toggle-checkbox-fill').check();
    await expect(page.getByTestId('options-fill-stepper-slider')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('post-Go play board has no violations, header inside a banner landmark (D1, D2)', async ({
    page,
  }) => {
    await startGame(page);
    await expect(page.locator('header [data-testid="header-action-button-restart"]')).toBeVisible();
    await expect(page.locator('header h1')).toHaveText('Memory Game');
    await expectNoAxeViolations(page);
  });

  test('post-Go 40-card board at a narrow viewport with a scrolling table has no violations (D1)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await startGame(page, { variants: true });
    await expect(cards(page)).toHaveCount(40);
    const scrolls = await page
      .locator('app-board .table')
      .evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(scrolls).toBe(true);
    await expectNoAxeViolations(page);
  });

  test('a single face-up card has no violations', async ({ page }) => {
    await startGame(page, { themes: ['dance', 'snowboard'] });
    await card(page, 0).click();
    await expect(card(page, 0)).toHaveAttribute('data-state', 'up');
    await expectNoAxeViolations(page);
  });

  test('Show All has no violations while every card is peeked', async ({ page }) => {
    await startGame(page, { themes: ['dance', 'snowboard'] });
    await page.getByTestId('header-action-button-show-all').click();
    await expect(card(page, 0)).toHaveAttribute('data-state', 'peeked');
    await expectNoAxeViolations(page);
  });

  test('mismatch and match reveals have no violations', async ({ page }) => {
    await startGame(page, { themes: ['dance', 'snowboard'] });
    const keys = await faceKeys(page);
    const miss = mismatchOf(keys);
    expect(miss).not.toBeNull();
    await flipMismatch(page, miss!);
    await expectNoAxeViolations(page);
    await page.getByTestId('reveal-card-button-1').click();
    await expect(reveal(page, 'mismatch')).toBeHidden();

    const [pair] = pairsOf(keys);
    await card(page, pair[0]).click();
    await card(page, pair[1]).click();
    await expect(reveal(page, 'match')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('reopened options popup over a live board has no violations', async ({ page }) => {
    await startGame(page);
    await page.getByTestId('header-action-button-new-game').click();
    await expect(page.getByTestId('options-dialog-root')).toBeVisible();
    await expect(page.getByTestId('options-dialog-close')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('"Start over?" from Restart and from Go has no violations', async ({ page }) => {
    await startGame(page, { themes: ['dance', 'snowboard'] });
    await card(page, 0).click();
    await page.getByTestId('header-action-button-restart').click();
    await expect(page.getByTestId('confirm-dialog-root')).toBeVisible();
    await expectNoAxeViolations(page);
    await page.getByTestId('confirm-action-button-cancel').click();

    await page.getByTestId('header-action-button-new-game').click();
    await page.getByTestId('options-action-button-go').click();
    await expect(page.getByTestId('confirm-dialog-root')).toBeVisible();
    await expect(page.getByTestId('confirm-action-button-cancel')).toHaveText('Back to options');
    await expectNoAxeViolations(page);
  });

  test('end screen, with and without the options popup over it, has no violations', async ({
    page,
  }) => {
    await startGame(page, { themes: ['dance'], fill: 4 });
    const pairs = pairsOf(await faceKeys(page));
    for (const pair of pairs.slice(0, -1)) {
      await playMatch(page, pair);
    }
    await card(page, pairs[pairs.length - 1][0]).click();
    await card(page, pairs[pairs.length - 1][1]).click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
    await expectNoAxeViolations(page);

    await page.getByTestId('end-action-button-new-game').click();
    await expect(page.getByTestId('options-dialog-close')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('two-player winner screen has no violations (AC13)', async ({ page }) => {
    await fixRandom(page, 0); // Kira goes first in two-player (R4).
    await startGame(page, { themes: ['dance', 'snowboard'], players: ['kira', 'calvin'], fill: 4 });
    const [one, two] = pairsOf(await faceKeys(page));
    await playMatch(page, one);
    await card(page, two[0]).click();
    await card(page, two[1]).click();
    await expect(page.getByTestId('end-dialog-root-winner')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('two-player tie screen has no violations (AC13, STEP-06)', async ({ page }) => {
    await fixRandom(page, 0); // Kira goes first in two-player (R4).
    await startGame(page, { themes: TIE_THEMES, players: ['kira', 'calvin'], fill: 8 });
    await playToTwoPlayerTie(page);
    await expect(page.getByTestId('end-dialog-root-tie')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('end screen at a narrow viewport with an empty scrolling table has no violations (D1)', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 320, height: 480 });
    await startGame(page, { themes: ['dance'], fill: 24 });
    const table = page.locator('app-board .table');
    expect(await table.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);

    const pairs = pairsOf(await faceKeys(page));
    for (const pair of pairs.slice(0, -1)) {
      await playMatch(page, pair);
    }
    const last = pairs[pairs.length - 1];
    await card(page, last[0]).click();
    await card(page, last[1]).click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
    await expectNoAxeViolations(page);
  });
});
