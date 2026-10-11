import { expect, test, type Page } from '@playwright/test';
import {
  BEFORE_CUTOFF,
  boxOf,
  card,
  cards,
  faceKeys,
  flipMismatch,
  mismatchOf,
  pairsOf,
  pinClock,
  playMatch,
  reveal,
  startGame,
  states,
} from './support';

const TWO_THEMES = { themes: ['dance', 'snowboard'] } as const;
const header = (page: Page, name: string) => page.getByTestId(`header-player-block-${name}`);

test.describe('play loop', () => {
  test.beforeEach(async ({ page }) => {
    await pinClock(page, BEFORE_CUTOFF);
  });

  test('plays a short single-player game to the end screen (AC1, AC8, AC12, AC13)', async ({
    page,
  }) => {
    await startGame(page, TWO_THEMES);
    await expect(cards(page)).toHaveCount(4);
    await expect(page.getByTestId('header-timer-value')).toHaveText('0:00');

    const keys = await faceKeys(page);
    const miss = mismatchOf(keys);
    expect(miss).not.toBeNull();
    await flipMismatch(page, miss!);
    await expect(page.getByTestId('reveal-hint-text')).toHaveText('Tap a card to continue');
    await page.getByTestId('reveal-card-button-2').click();
    await expect(reveal(page, 'mismatch')).toBeHidden();
    expect(await states(page)).toEqual(['down', 'down', 'down', 'down']);
    await expect(page.getByTestId('header-player-block-kira-attempts')).toHaveText('1');

    const [first, last] = pairsOf(keys);
    await playMatch(page, first);
    expect((await states(page)).filter((state) => state === 'gone')).toHaveLength(2);
    await expect(page.getByTestId('header-player-block-kira-pairs')).toHaveText('1');

    await card(page, last[0]).click();
    await card(page, last[1]).click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Well done, Kira!' })).toBeVisible();
    await expect(page.getByTestId('end-stat-tile-1')).toContainText('3');
    await expect(page.getByTestId('end-stat-tile-1')).toContainText('attempts');
    await expect(page.getByTestId('end-stat-tile-2')).toContainText(/\d+:\d\d/);
    await expect(page.getByTestId('end-confetti-root')).toBeAttached();
    await expect(page.getByTestId('end-dialog-root-single')).not.toContainText(/birthday/i);
    await expect(page.getByTestId('end-action-button-restart')).toBeFocused();
  });

  test('a two-player mismatch passes the turn after the reveal is dismissed (AC9)', async ({
    page,
  }) => {
    await startGame(page, { ...TWO_THEMES, twoPlayers: true });
    await expect(page.getByTestId('header-timer-value')).toHaveCount(0);
    await expect(header(page, 'kira')).toHaveAttribute('data-state', 'active');

    const miss = mismatchOf(await faceKeys(page));
    await flipMismatch(page, miss!);
    await expect(page.getByTestId('reveal-card-button-1')).toBeFocused();

    await page.mouse.click(4, 4);
    await expect(reveal(page, 'mismatch')).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(reveal(page, 'mismatch')).toBeHidden();
    await expect(header(page, 'calvin')).toHaveAttribute('data-state', 'active');
    await expect(header(page, 'kira')).toHaveAttribute('data-state', 'idle');
    await expect(page.getByTestId('header-player-block-kira-attempts')).toHaveText('1');
    await expect(page.getByTestId('header-player-block-calvin-attempts')).toHaveText('0');
    expect(await states(page)).toEqual(['down', 'down', 'down', 'down']);
  });

  test('a match leaves an empty slot, moves nothing and keeps the same player (AC8)', async ({
    page,
  }) => {
    await startGame(page, { ...TWO_THEMES, twoPlayers: true });
    const keys = await faceKeys(page);
    const [matched, other] = pairsOf(keys);
    const before = await boxOf(card(page, other[0]));

    await playMatch(page, matched);
    await expect(card(page, matched[0])).toHaveAttribute('data-state', 'gone');
    await expect(card(page, matched[0])).toBeDisabled();
    await expect(cards(page)).toHaveCount(4);
    expect(await boxOf(card(page, other[0]))).toEqual(before);
    await expect(header(page, 'kira')).toHaveAttribute('data-state', 'active');
    await expect(page.getByTestId('header-player-block-kira-pairs')).toHaveText('1');
  });

  test('two-player result names the winner by pairs (AC13)', async ({ page }) => {
    await startGame(page, { ...TWO_THEMES, twoPlayers: true });
    const [one, two] = pairsOf(await faceKeys(page));
    await playMatch(page, one);
    await card(page, two[0]).click();
    await card(page, two[1]).click();
    await expect(page.getByTestId('end-dialog-root-winner')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Kira wins!' })).toBeVisible();
    await expect(page.getByTestId('end-stat-tile-1')).toContainText("Kira's pairs");
    await expect(page.getByTestId('end-stat-tile-1')).toContainText('2');
    await expect(page.getByTestId('end-stat-tile-2')).toContainText('0');
  });

  test('Show All peeks every card for about 3 s, costs one attempt and keeps the timer (AC11)', async ({
    page,
  }) => {
    await startGame(page, TWO_THEMES);
    await page.getByTestId('header-action-button-show-all').click();
    expect(await states(page)).toEqual(['peeked', 'peeked', 'peeked', 'peeked']);
    await expect(page.getByTestId('header-player-block-kira-attempts')).toHaveText('1');
    await expect(page.getByTestId('header-action-button-show-all')).toBeDisabled();
    await expect(page.getByTestId('header-action-button-restart')).toBeDisabled();
    await expect(page.getByTestId('header-action-button-new-game')).toBeDisabled();

    await card(page, 0).click({ force: true });
    expect(await states(page)).toEqual(['peeked', 'peeked', 'peeked', 'peeked']);

    await expect(card(page, 0)).toHaveAttribute('data-state', 'down', { timeout: 5_000 });
    expect(await states(page)).toEqual(['down', 'down', 'down', 'down']);
    await expect(page.getByTestId('header-timer-value')).toHaveText(/0:0[3-9]/);
    await expect(page.getByTestId('header-player-block-kira-attempts')).toHaveText('1');
  });

  test('Show All is unavailable with a card face up (R26)', async ({ page }) => {
    await startGame(page, TWO_THEMES);
    await card(page, 0).click();
    await expect(page.getByTestId('header-action-button-show-all')).toBeDisabled();
  });

  test('Restart asks "Start over?" only once a card has been flipped (AC15)', async ({ page }) => {
    await startGame(page, TWO_THEMES);
    await page.getByTestId('header-action-button-restart').click();
    await expect(page.getByTestId('confirm-dialog-root')).toBeHidden();
    await expect(cards(page)).toHaveCount(4);

    await card(page, 0).click();
    await page.getByTestId('header-action-button-restart').click();
    const confirm = page.getByRole('alertdialog', { name: 'Start over?' });
    await expect(confirm).toBeVisible();
    await expect(page.getByTestId('confirm-action-button-cancel')).toHaveText('Keep playing');
    await expect(page.getByTestId('confirm-action-button-cancel')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(confirm).toBeHidden();
    await expect(card(page, 0)).toHaveAttribute('data-state', 'up');
    await expect(page.getByTestId('header-action-button-restart')).toBeFocused();

    await page.getByTestId('header-action-button-restart').click();
    await page.getByTestId('confirm-action-button-confirm').click();
    await expect(confirm).toBeHidden();
    expect(await states(page)).toEqual(['down', 'down', 'down', 'down']);
    await expect(page.getByTestId('header-player-block-kira-attempts')).toHaveText('0');
    await expect(page.getByTestId('header-timer-value')).toHaveText('0:00');
  });

  test('Go over a game in progress asks; Back to options keeps the draft and the live game (AC16)', async ({
    page,
  }) => {
    await startGame(page, TWO_THEMES);
    await card(page, 0).click();
    await page.getByTestId('header-action-button-new-game').click();
    await page.getByTestId('options-toggle-checkbox-variants').check();
    await page.getByTestId('options-action-button-go').click();

    await expect(page.getByRole('alertdialog', { name: 'Start over?' })).toBeVisible();
    await expect(page.getByTestId('confirm-action-button-cancel')).toHaveText('Back to options');
    await page.getByTestId('confirm-action-button-cancel').click();
    await expect(page.getByTestId('confirm-dialog-root')).toBeHidden();
    await expect(page.getByTestId('options-dialog-root')).toBeVisible();
    await expect(page.getByTestId('options-toggle-checkbox-variants')).toBeChecked();
    await expect(page.getByTestId('options-action-button-go')).toBeFocused();
    await expect(card(page, 0)).toHaveAttribute('data-state', 'up');

    await page.getByTestId('options-action-button-go').click();
    await page.getByTestId('confirm-action-button-confirm').click();
    await expect(page.getByTestId('options-dialog-root')).toBeHidden();
    await expect(cards(page)).toHaveCount(4 * 2);
  });

  test('New Game never asks and Close returns the live game unchanged (AC17)', async ({ page }) => {
    await startGame(page, TWO_THEMES);
    await card(page, 1).click();
    await page.getByTestId('header-action-button-new-game').click();
    await expect(page.getByTestId('options-dialog-root')).toBeVisible();
    await expect(page.getByTestId('confirm-dialog-root')).toBeHidden();
    await expect(page.getByTestId('header-timer-value')).toHaveAttribute('data-state', 'paused');
    await expect(card(page, 1)).toHaveAttribute('data-state', 'up');

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('options-dialog-root')).toBeHidden();
    await expect(card(page, 1)).toHaveAttribute('data-state', 'up');
    await expect(page.getByTestId('header-timer-value')).toHaveAttribute('data-state', 'running');
    await expect(page.getByTestId('header-action-button-new-game')).toBeFocused();
  });

  test('the end screen offers Restart, and New Game over it closes back to the result (AC14)', async ({
    page,
  }) => {
    await startGame(page, { themes: ['dance'], fill: 4 });
    const [one, two] = pairsOf(await faceKeys(page));
    await playMatch(page, one);
    await card(page, two[0]).click();
    await card(page, two[1]).click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();

    await page.getByTestId('end-action-button-new-game').click();
    await expect(page.getByTestId('options-dialog-root')).toBeVisible();
    await expect(page.getByTestId('end-dialog-root-single')).toBeHidden();
    await expect(page.getByTestId('options-theme-checkbox-dance')).toBeChecked();
    await expect(page.getByTestId('options-theme-checkbox-art')).not.toBeChecked();
    await expect(page.getByTestId('confirm-dialog-root')).toBeHidden();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
    await expect(page.getByTestId('end-action-button-new-game')).toBeFocused();

    await page.getByTestId('end-action-button-restart').click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeHidden();
    await expect(page.getByTestId('options-dialog-root')).toBeHidden();
    await expect(page.getByTestId('confirm-dialog-root')).toBeHidden();
    expect(await states(page)).toEqual(['down', 'down', 'down', 'down']);
    await expect(page.getByTestId('header-timer-value')).toHaveText('0:00');
  });

  test('keys reach the cards in grid order and select, reveal and dismiss them (AC4, AC7, AC9)', async ({
    page,
  }) => {
    await startGame(page, TWO_THEMES);
    const keys = await faceKeys(page);
    const miss = mismatchOf(keys)!;
    await expect(page.getByTestId('header-action-button-new-game')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(card(page, 0)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(card(page, 1)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(card(page, 0)).toBeFocused();

    await card(page, miss[0]).focus();
    await page.keyboard.press('Enter');
    await expect(card(page, miss[0])).toHaveAttribute('data-state', 'up');
    await card(page, miss[1]).focus();
    await page.keyboard.press('Space');
    await expect(reveal(page, 'mismatch')).toBeVisible();

    await expect(page.getByTestId('reveal-card-button-1')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('reveal-card-button-2')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('reveal-card-button-1')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('reveal-card-button-2')).toBeFocused();

    await page.keyboard.press('Space');
    await expect(reveal(page, 'mismatch')).toBeHidden();
    expect(await states(page)).toEqual(['down', 'down', 'down', 'down']);
    await expect(card(page, miss[1])).toBeFocused();
  });

  test('gone cards leave the tab order (AC4)', async ({ page }) => {
    await startGame(page, TWO_THEMES);
    const [matched] = pairsOf(await faceKeys(page));
    await playMatch(page, matched);
    const remaining = [0, 1, 2, 3].filter((index) => !matched.includes(index));

    await page.getByTestId('header-action-button-new-game').focus();
    await page.keyboard.press('Tab');
    await expect(card(page, remaining[0])).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(card(page, remaining[1])).toBeFocused();
  });

  test('reduced motion shortens card motion and shows no confetti (AC19, R32)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await startGame(page, { themes: ['dance'], fill: 4 });
    const duration = await card(page, 0)
      .locator('.flipper')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0.001s');

    const [one, two] = pairsOf(await faceKeys(page));
    await playMatch(page, one);
    await card(page, two[0]).click();
    await card(page, two[1]).click();
    await expect(page.getByTestId('end-dialog-root-single')).toBeVisible();
    await expect(page.getByTestId('end-confetti-root')).toHaveCount(0);
  });

  test('full motion keeps the 0.4 s flip and shows confetti', async ({ page }) => {
    await startGame(page, { themes: ['dance'], fill: 4 });
    const duration = await card(page, 0)
      .locator('.flipper')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0.4s');
  });
});
