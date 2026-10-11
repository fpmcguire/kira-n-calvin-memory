import { expect, test, type Page } from '@playwright/test';
import {
  boxOf,
  card,
  expectNoAxeViolations,
  faceKeys,
  fixRandom,
  openGame,
  pairsOf,
  playMatch,
  skipToFirstOptions,
  startGame,
} from './support';

/**
 * Device memory and sound (STEP-05: R31, R36, DS-006, DS-016, DS-024). Each test gets a
 * fresh browser context, so storage starts empty and reloads exercise real localStorage.
 */
const ONE_THEME_FOUR_CARDS = { themes: ['dance'], fill: 4 } as const;
const checkbox = (page: Page, id: string) => page.getByTestId(`options-${id}`);
const bestNote = (page: Page) => page.getByTestId('end-best-note');
const soundButton = (page: Page) => page.getByTestId('header-action-button-sound');

/** Clears the four-card board: two matched pairs, two attempts. */
async function clearBoard(page: Page) {
  const [one, two] = pairsOf(await faceKeys(page));
  await playMatch(page, one);
  await card(page, two[0]).click();
  await card(page, two[1]).click();
}

async function reopenAfterReload(page: Page) {
  await page.reload();
  await skipToFirstOptions(page);
}

test('Go remembers the options; Close, Escape and Reset do not change them (AC2, AC4, AC5)', async ({
  page,
}) => {
  await startGame(page, {
    themes: ['dance', 'drones'],
    players: ['kira', 'calvin'],
    variants: true,
  });

  // A dirty draft discarded with Escape is not remembered.
  await page.getByTestId('header-action-button-new-game').click();
  await checkbox(page, 'player-checkbox-calvin').uncheck();
  await checkbox(page, 'theme-checkbox-art').check();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('options-dialog-root')).toBeHidden();

  await reopenAfterReload(page);
  await expect(checkbox(page, 'player-checkbox-kira')).toBeChecked();
  await expect(checkbox(page, 'player-checkbox-calvin')).toBeChecked();
  await expect(checkbox(page, 'theme-checkbox-dance')).toBeChecked();
  await expect(checkbox(page, 'theme-checkbox-drones')).toBeChecked();
  await expect(checkbox(page, 'theme-checkbox-art')).not.toBeChecked();
  await expect(checkbox(page, 'toggle-checkbox-variants')).toBeChecked();
  await expect(checkbox(page, 'toggle-checkbox-fill')).not.toBeChecked();
  await expect(page.getByTestId('options-summary-text')).toHaveText('8 cards · 4 pairs');
  await expect(page.getByTestId('board-grid-root-preview').locator(':scope > *')).toHaveCount(8);
  await expect(page.getByTestId('options-action-button-go')).toBeEnabled();
  await expectNoAxeViolations(page);

  // Reset clears the draft, including both players, but leaves the remembered options.
  await page.getByTestId('options-action-button-reset').click();
  await expect(checkbox(page, 'player-checkbox-kira')).not.toBeChecked();
  await expect(checkbox(page, 'player-checkbox-calvin')).not.toBeChecked();
  await reopenAfterReload(page);
  await expect(checkbox(page, 'player-checkbox-calvin')).toBeChecked();
  await expect(page.getByTestId('options-summary-text')).toHaveText('8 cards · 4 pairs');
});

test('a single-player best is kept on the device; equal or worse games do not replace it (AC8, AC9, AC17)', async ({
  page,
}) => {
  await startGame(page, ONE_THEME_FOUR_CARDS);
  await clearBoard(page);
  await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
  await expect(bestNote(page)).toHaveText('New best for Kira on this board!');
  await expect(page.getByTestId('end-dialog-root-single')).not.toContainText(/birthday/i);
  await expectNoAxeViolations(page);

  // A worse game: Show All costs one extra attempt.
  await page.getByTestId('end-action-button-restart').click();
  await page.getByTestId('header-action-button-show-all').click();
  await expect(card(page, 0)).toHaveAttribute('data-state', 'peeked');
  await expect(card(page, 0)).toHaveAttribute('data-state', 'down', { timeout: 6_000 });
  await clearBoard(page);
  await expect(page.getByTestId('end-stat-tile-1')).toContainText('3');
  await expect(bestNote(page)).toHaveText("Kira's best on this board: 2 attempts");

  // An equal game after a reload: the best survived and is not replaced.
  await reopenAfterReload(page);
  await page.getByTestId('options-action-button-go').click();
  await clearBoard(page);
  await expect(page.getByTestId('end-stat-tile-1')).toContainText('2');
  await expect(bestNote(page)).toHaveText("Kira's best on this board: 2 attempts");
});

test('Calvin keeps his own best on the same board (AC10)', async ({ page }) => {
  await startGame(page, ONE_THEME_FOUR_CARDS);
  await clearBoard(page);
  await expect(bestNote(page)).toHaveText('New best for Kira on this board!');

  await page.getByTestId('end-action-button-new-game').click();
  await checkbox(page, 'player-checkbox-kira').uncheck();
  await checkbox(page, 'player-checkbox-calvin').check();
  await page.getByTestId('options-action-button-go').click();
  await clearBoard(page);
  await expect(page.getByRole('dialog', { name: 'Well done, Calvin!' })).toBeVisible();
  await expect(bestNote(page)).toHaveText('New best for Calvin on this board!');
});

test('a two-player game shows no best note (AC12, AC17)', async ({ page }) => {
  await fixRandom(page, 0);
  await startGame(page, { ...ONE_THEME_FOUR_CARDS, players: ['kira', 'calvin'] });
  await clearBoard(page);
  await expect(page.getByTestId('end-dialog-root-winner')).toBeVisible();
  await expect(bestNote(page)).toHaveCount(0);
  await expect(page.getByTestId('end-dialog-root-winner')).not.toContainText(/birthday/i);
  await expectNoAxeViolations(page);
});

test('the Sound toggle keeps its state across reloads and route visits (AC13, AC17)', async ({
  page,
}) => {
  await startGame(page);
  await expect(soundButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(soundButton(page)).toHaveAttribute('data-state', 'on');
  await expect(soundButton(page)).toHaveText('Sound on');
  const box = await boxOf(soundButton(page));
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);
  await expectNoAxeViolations(page);

  await soundButton(page).click();
  await expect(soundButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(soundButton(page)).toHaveAttribute('data-state', 'off');
  await expect(soundButton(page)).toHaveText('Sound off');
  await expectNoAxeViolations(page);

  // Playing with Sound off works as before.
  await card(page, 0).click();
  await expect(card(page, 0)).toHaveAttribute('data-state', 'up');

  await page.reload();
  await expect(soundButton(page)).toHaveAttribute('aria-pressed', 'false');

  await page.goto('/');
  await openGame(page);
  await expect(soundButton(page)).toHaveAttribute('data-state', 'off');
});
