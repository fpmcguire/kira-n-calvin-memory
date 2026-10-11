import { expect, test } from '@playwright/test';
import { FEATURE_FLAGS } from '../src/app/config/feature-flags';
import {
  BEFORE_CUTOFF,
  FIRST_SECOND_AFTER_CUTOFF,
  LAST_SECOND_BEFORE_CUTOFF,
  openGame,
  splash,
} from './support';

/**
 * Browser coverage for the cutoff `2026-10-11T00:00 America/Denver` (R2, R3, R38, AC23).
 * The cutoff selects the splash only; players follow the options checkboxes (R4, see
 * `players.spec.ts`). The browser clock is pinned, so none of this depends on the host
 * date. The browser runs in Europe/Berlin, where both pinned instants fall on 2026-10-11,
 * to show that the check follows the cutoff's own time zone and not the device's.
 */
test.use({ timezoneId: 'Europe/Berlin' });

test.describe('one second before the cutoff (2026-10-10 23:59:59 America/Denver)', () => {
  test('birthday splash in every build', async ({ page }) => {
    await page.clock.setFixedTime(LAST_SECOND_BEFORE_CUTOFF);
    await openGame(page);

    await expect(page.getByTestId('splash-screen-root-birthday')).toContainText(
      'Happy Birthday Kira!',
    );
    await expect(page.getByTestId('splash-screen-root-generic')).toHaveCount(0);
  });
});

test.describe('the first second of the cutoff (2026-10-11 00:00:00 America/Denver)', () => {
  test('generic splash, with the title and no birthday headline (dated-birthday build)', async ({
    page,
  }) => {
    test.skip(
      FEATURE_FLAGS.permanentBirthday,
      'the permanent-birthday build shows the birthday splash',
    );
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await openGame(page);

    await expect(page.getByTestId('splash-screen-root-generic')).toContainText(
      'Kira-n-Calvin Memory Game',
    );
    await expect(page.getByTestId('splash-screen-root-birthday')).toHaveCount(0);
    await expect(splash(page)).not.toContainText('Happy Birthday');
  });

  test('birthday splash stays after the cutoff (permanent-birthday build)', async ({ page }) => {
    test.skip(
      !FEATURE_FLAGS.permanentBirthday,
      'the dated-birthday build shows the generic splash',
    );
    await page.clock.setFixedTime(FIRST_SECOND_AFTER_CUTOFF);
    await openGame(page);

    await expect(page.getByTestId('splash-screen-root-birthday')).toContainText(
      'Happy Birthday Kira!',
    );
    await expect(page.getByTestId('splash-screen-root-generic')).toHaveCount(0);
  });
});

test.describe('across the cutoff', () => {
  test('a fresh visit after midnight Denver time shows the splash for its build', async ({
    page,
  }) => {
    await page.clock.install({ time: new Date('2026-10-10T23:59:50-06:00') });
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-birthday')).toBeVisible();

    await page.clock.fastForward(30_000);
    await page.goto('/game');
    const variant = FEATURE_FLAGS.permanentBirthday ? 'birthday' : 'generic';
    await expect(page.getByTestId(`splash-screen-root-${variant}`)).toBeVisible();
  });

  test('the same page before the cutoff shows the birthday splash on a fresh visit', async ({
    page,
  }) => {
    await page.clock.install({ time: BEFORE_CUTOFF });
    await openGame(page);
    await expect(page.getByTestId('splash-screen-root-birthday')).toBeVisible();
  });
});
