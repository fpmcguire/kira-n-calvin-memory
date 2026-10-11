import { expect, test, type Page } from '@playwright/test';
import {
  BEFORE_CUTOFF,
  FIRST_SECOND_AFTER_CUTOFF,
  fixRandom,
  LAST_SECOND_BEFORE_CUTOFF,
  openGame,
  skipToFirstOptions,
  splash,
} from './support';

/**
 * Browser coverage for the cutoff `2026-10-11T00:00 America/Denver` (R2, R3, R4, AC23).
 * The browser clock is pinned, so none of this depends on the host date. The browser
 * runs in Europe/Berlin, where both pinned instants fall on 2026-10-11, to show that
 * the check follows the cutoff's own time zone and not the device's.
 */
test.use({ timezoneId: 'Europe/Berlin' });

const kira = (page: Page) => page.getByTestId('header-player-block-kira');
const calvin = (page: Page) => page.getByTestId('header-player-block-calvin');

/** Skips the splash, applies the player count and presses Go (the board is untouched). */
async function go(page: Page, twoPlayers: boolean) {
  await skipToFirstOptions(page);
  await page.getByTestId('options-toggle-checkbox-two-players').setChecked(twoPlayers);
  await page.getByTestId('options-action-button-go').click();
  await expect(page.getByTestId('options-dialog-root')).toBeHidden();
}

test.describe('one second before the cutoff (2026-10-10 23:59:59 America/Denver)', () => {
  for (const roll of [0, 0.99]) {
    test(`birthday splash, Kira alone and Kira first when the roll is ${roll}`, async ({
      page,
    }) => {
      await page.clock.setFixedTime(LAST_SECOND_BEFORE_CUTOFF);
      await fixRandom(page, roll);
      await openGame(page);

      await expect(page.getByTestId('splash-screen-root-birthday')).toContainText(
        'Happy Birthday Kira!',
      );
      await expect(page.getByTestId('splash-screen-root-generic')).toHaveCount(0);

      await go(page, false);
      await expect(kira(page)).toBeVisible();
      await expect(calvin(page)).toHaveCount(0);

      await page.getByTestId('header-action-button-new-game').click();
      await page.getByTestId('options-toggle-checkbox-two-players').check();
      await page.getByTestId('options-action-button-go').click();
      await expect(page.getByTestId('options-dialog-root')).toBeHidden();
      await expect(kira(page)).toHaveAttribute('data-state', 'active');
      await expect(calvin(page)).toHaveAttribute('data-state', 'idle');
    });
  }

  test('Restart keeps Kira first, every time', async ({ page }) => {
    await page.clock.setFixedTime(LAST_SECOND_BEFORE_CUTOFF);
    await fixRandom(page, 0.99);
    await openGame(page);
    await go(page, true);

    for (let i = 0; i < 3; i++) {
      await page.getByTestId('header-action-button-restart').click();
      await expect(kira(page)).toHaveAttribute('data-state', 'active');
    }
  });
});

test.describe('the first second of the cutoff (2026-10-11 00:00:00 America/Denver)', () => {
  test('generic splash, with the title and no birthday headline', async ({ page }) => {
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await openGame(page);

    await expect(page.getByTestId('splash-screen-root-generic')).toContainText(
      'Kira-n-Calvin Memory Game',
    );
    await expect(page.getByTestId('splash-screen-root-birthday')).toHaveCount(0);
    await expect(splash(page)).not.toContainText('Happy Birthday');
  });

  test('a roll of 0.99 makes Calvin the single player and the first player', async ({ page }) => {
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await fixRandom(page, 0.99);
    await openGame(page);

    await go(page, false);
    await expect(calvin(page)).toBeVisible();
    await expect(kira(page)).toHaveCount(0);

    await page.getByTestId('header-action-button-new-game').click();
    await page.getByTestId('options-toggle-checkbox-two-players').check();
    await page.getByTestId('options-action-button-go').click();
    await expect(calvin(page)).toHaveAttribute('data-state', 'active');
    await expect(kira(page)).toHaveAttribute('data-state', 'idle');
    await expect(page.locator('.player').first()).toHaveAttribute('data-child', 'kira');
  });

  test('a roll of 0 makes Kira the single player and the first player', async ({ page }) => {
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await fixRandom(page, 0);
    await openGame(page);

    await go(page, true);
    await expect(kira(page)).toHaveAttribute('data-state', 'active');
  });
});

test.describe('across the cutoff', () => {
  test('a session open over midnight Denver time goes random on Restart (R4)', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-10T23:59:50-06:00') });
    await fixRandom(page, 0.99);
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-birthday')).toBeVisible();
    await go(page, true);
    await expect(kira(page)).toHaveAttribute('data-state', 'active');

    await page.clock.fastForward(30_000);
    await page.getByTestId('header-action-button-restart').click();
    await expect(calvin(page)).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('confirm-dialog-root')).toHaveCount(0);

    await page.goto('/game');
    await expect(page.getByTestId('splash-screen-root-generic')).toBeVisible();
  });

  test('the same page before the cutoff shows the birthday splash on a fresh visit', async ({
    page,
  }) => {
    await page.clock.install({ time: BEFORE_CUTOFF });
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-birthday')).toBeVisible();
  });
});
