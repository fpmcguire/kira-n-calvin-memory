import { expect, test, type Page } from '@playwright/test';
import {
  FIRST_SECOND_AFTER_CUTOFF,
  fixRandom,
  LAST_SECOND_BEFORE_CUTOFF,
  openGame,
  skipToFirstOptions,
} from './support';

/**
 * Player checkboxes (R4, R6, DS-020): the checked children decide single-player or
 * two-player and who plays alone; two-player rolls the first player on every Go and
 * Restart. The date plays no part, so each check runs on both sides of the cutoff.
 */
test.use({ timezoneId: 'Europe/Berlin' });

const kira = (page: Page) => page.getByTestId('header-player-block-kira');
const calvin = (page: Page) => page.getByTestId('header-player-block-calvin');
const box = (page: Page, child: 'kira' | 'calvin') =>
  page.getByTestId(`options-player-checkbox-${child}`);

async function pressGo(page: Page) {
  await page.getByTestId('options-action-button-go').click();
  await expect(page.getByTestId('options-dialog-root')).toBeHidden();
}

for (const [when, time] of [
  ['before the cutoff', LAST_SECOND_BEFORE_CUTOFF],
  ['after the cutoff', FIRST_SECOND_AFTER_CUTOFF],
] as const) {
  test.describe(when, () => {
    test('first open checks Kira alone, and Kira plays alone whatever the roll', async ({
      page,
    }) => {
      await page.clock.setFixedTime(time);
      await fixRandom(page, 0.99);
      await openGame(page);
      await skipToFirstOptions(page);

      await expect(box(page, 'kira')).toBeChecked();
      await expect(box(page, 'calvin')).not.toBeChecked();
      await pressGo(page);
      await expect(kira(page)).toBeVisible();
      await expect(calvin(page)).toHaveCount(0);
    });

    test('Calvin alone plays alone, and stays the player on Restart', async ({ page }) => {
      await page.clock.setFixedTime(time);
      await fixRandom(page, 0);
      await openGame(page);
      await skipToFirstOptions(page);

      await box(page, 'kira').uncheck();
      await box(page, 'calvin').check();
      await pressGo(page);
      await expect(calvin(page)).toBeVisible();
      await expect(kira(page)).toHaveCount(0);

      await page.getByTestId('header-action-button-restart').click();
      await expect(calvin(page)).toBeVisible();
      await expect(kira(page)).toHaveCount(0);
    });

    for (const [roll, first] of [
      [0, 'kira'],
      [0.99, 'calvin'],
    ] as const) {
      test(`both checked is two-player, and a roll of ${roll} puts ${first} first`, async ({
        page,
      }) => {
        await page.clock.setFixedTime(time);
        await fixRandom(page, roll);
        await openGame(page);
        await skipToFirstOptions(page);

        await box(page, 'calvin').check();
        await pressGo(page);
        await expect(page.getByTestId(`header-player-block-${first}`)).toHaveAttribute(
          'data-state',
          'active',
        );
        await expect(page.locator('.player').first()).toHaveAttribute('data-child', 'kira');
        await expect(page.getByTestId('header-timer-value')).toHaveCount(0);
      });
    }
  });
}

test('neither child checked disables Go and says so', async ({ page }) => {
  await openGame(page);
  await skipToFirstOptions(page);

  await box(page, 'kira').uncheck();
  await expect(page.getByTestId('options-action-button-go')).toBeDisabled();
  await expect(page.getByTestId('options-summary-text')).toHaveText('Pick at least one player');

  await box(page, 'calvin').check();
  await expect(page.getByTestId('options-action-button-go')).toBeEnabled();
});

test('two-player rolls the first player again on Restart', async ({ page }) => {
  // A roll the test can change between Go and Restart: 0 picks Kira, 0.99 picks Calvin.
  await page.addInitScript(() => {
    const w = window as unknown as { roll: number };
    w.roll = 0;
    Math.random = () => w.roll;
  });
  await openGame(page);
  await skipToFirstOptions(page);
  await box(page, 'calvin').check();
  await pressGo(page);
  await expect(kira(page)).toHaveAttribute('data-state', 'active');

  await page.evaluate(() => ((window as unknown as { roll: number }).roll = 0.99));
  await page.getByTestId('header-action-button-restart').click();
  await expect(calvin(page)).toHaveAttribute('data-state', 'active');
  await expect(page.getByTestId('confirm-dialog-root')).toHaveCount(0);
});
