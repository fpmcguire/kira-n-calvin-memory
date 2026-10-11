import { expect, test, type Page } from '@playwright/test';
import { kiraCalvinEdition } from '../src/app/content/kira-calvin';
import {
  BEFORE_CUTOFF,
  card,
  expectNoAxeViolations,
  faceKeys,
  FIRST_SECOND_AFTER_CUTOFF,
  fixRandom,
  LAST_SECOND_BEFORE_CUTOFF,
  openGame,
  pairsOf,
  playMatch,
  playToTwoPlayerTie,
  skipToFirstOptions,
  splash,
  startGame,
  TIE_THEMES,
} from './support';

/**
 * The `dated-birthday` build (R2, R3, R38, STEP-06 AC13 and AC27). Run through
 * `playwright.dated.config.ts` (`npm run test:e2e:dated`), which serves that build. The
 * default config ignores this file because its permanent-birthday build cannot show the
 * generic splash. Nothing here skips: if the wrong build is served, the first tests fail.
 */
test.use({ timezoneId: 'Europe/Berlin' });

const BIRTHDAY = /birthday/i;
const kira = (page: Page) => page.getByTestId('header-player-block-kira');
const calvin = (page: Page) => page.getByTestId('header-player-block-calvin');

async function expectNoBirthdayCopy(page: Page, where: string): Promise<void> {
  const text = await page.locator('app-game').innerText();
  expect(text, `${where} text`).not.toMatch(BIRTHDAY);
  const tree = await page.locator('app-game').ariaSnapshot();
  expect(tree, `${where} accessibility tree`).not.toMatch(BIRTHDAY);
}

test.describe('splash by date in the dated build', () => {
  test('generic splash after the cutoff: title, approved logo, no birthday copy', async ({
    page,
  }) => {
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await openGame(page);

    const generic = page.getByTestId('splash-screen-root-generic');
    await expect(generic).toContainText('Kira-n-Calvin Memory Game');
    await expect(page.getByTestId('splash-screen-root-birthday')).toHaveCount(0);
    await expect(splash(page)).not.toContainText(BIRTHDAY);

    const logo = generic.locator('img');
    await expect(logo).toHaveCount(1);
    await expect(logo).toHaveAttribute('src', kiraCalvinEdition.brand.logo);
    await expect(logo).toHaveAttribute('alt', '');
    await expect
      .poll(() => logo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  });

  test('generic splash has no axe violations, with the full filter and no exceptions', async ({
    page,
  }) => {
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-generic')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('birthday splash one second before the cutoff', async ({ page }) => {
    await page.clock.setFixedTime(LAST_SECOND_BEFORE_CUTOFF);
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-birthday')).toContainText(
      'Happy Birthday Kira!',
    );
    await expect(page.getByTestId('splash-screen-root-generic')).toHaveCount(0);
  });

  test('a fresh visit across the cutoff switches to the generic splash', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-10T23:59:50-06:00') });
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-birthday')).toBeVisible();

    await page.clock.fastForward(30_000);
    await page.goto('/game');
    await expect(page.getByTestId('splash-screen-root-generic')).toBeVisible();
  });
});

test.describe('no birthday copy once play has begun, after the cutoff', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
  });

  test('options popup and live board', async ({ page }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    await expectNoBirthdayCopy(page, 'options');
    await page.getByTestId('options-action-button-go').click();
    await expect(page.getByTestId('board-grid-root-live')).toBeVisible();
    await expectNoBirthdayCopy(page, 'board');
  });

  test('mismatch reveal and single-player end screen', async ({ page }) => {
    await startGame(page, { themes: ['dance', 'snowboard'], fill: 4 });
    const keys = await faceKeys(page);
    const pairs = pairsOf(keys);
    const other = keys.findIndex((key) => key.split('|')[0] !== keys[0].split('|')[0]);
    await card(page, 0).click();
    await card(page, other).click();
    await expect(page.getByTestId('reveal-overlay-root-mismatch')).toBeVisible();
    await expectNoBirthdayCopy(page, 'mismatch reveal');
    await page.getByTestId('reveal-card-button-1').click();
    await expect(page.getByTestId('reveal-overlay-root-mismatch')).toBeHidden();

    await playMatch(page, pairs[0]);
    await card(page, pairs[1][0]).click();
    await card(page, pairs[1][1]).click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
    await expectNoBirthdayCopy(page, 'single-player end screen');
    await expectNoAxeViolations(page);
  });

  test('two-player winner end screen', async ({ page }) => {
    await fixRandom(page, 0);
    await startGame(page, { themes: ['dance', 'snowboard'], players: ['kira', 'calvin'], fill: 4 });
    const [one, two] = pairsOf(await faceKeys(page));
    await playMatch(page, one);
    await card(page, two[0]).click();
    await card(page, two[1]).click();
    await expect(page.getByTestId('end-dialog-root-winner')).toBeVisible();
    await expectNoBirthdayCopy(page, 'winner screen');
    await expectNoAxeViolations(page);
  });

  test('two-player tie end screen', async ({ page }) => {
    await fixRandom(page, 0);
    await startGame(page, { themes: TIE_THEMES, players: ['kira', 'calvin'], fill: 8 });
    await playToTwoPlayerTie(page);
    await expect(page.getByTestId('end-dialog-root-tie')).toBeVisible();
    await expectNoBirthdayCopy(page, 'tie screen');
    await expectNoAxeViolations(page);
  });
});

test.describe('player selection does not depend on the cutoff or the build (R4)', () => {
  for (const [when, time] of [
    ['before the cutoff', BEFORE_CUTOFF],
    ['after the cutoff', FIRST_SECOND_AFTER_CUTOFF],
  ] as const) {
    test.describe(when, () => {
      test.beforeEach(async ({ page }) => {
        await page.clock.setFixedTime(time);
        await fixRandom(page, 0.99);
        await openGame(page);
        await skipToFirstOptions(page);
      });

      test('first open checks Kira alone, and Kira plays alone', async ({ page }) => {
        await expect(page.getByTestId('options-player-checkbox-kira')).toBeChecked();
        await expect(page.getByTestId('options-player-checkbox-calvin')).not.toBeChecked();
        await page.getByTestId('options-action-button-go').click();
        await expect(kira(page)).toBeVisible();
        await expect(calvin(page)).toHaveCount(0);
      });

      test('Calvin alone plays alone', async ({ page }) => {
        await page.getByTestId('options-player-checkbox-kira').uncheck();
        await page.getByTestId('options-player-checkbox-calvin').check();
        await page.getByTestId('options-action-button-go').click();
        await expect(calvin(page)).toBeVisible();
        await expect(kira(page)).toHaveCount(0);
      });

      test('both checked is two-player, and the roll picks the first player', async ({ page }) => {
        await page.getByTestId('options-player-checkbox-calvin').check();
        await page.getByTestId('options-action-button-go').click();
        await expect(page.getByTestId('header-player-block-calvin')).toHaveAttribute(
          'data-state',
          'active',
        );
        await expect(kira(page)).toBeVisible();
      });
    });
  }
});
