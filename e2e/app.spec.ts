import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const splash = (page: Page) => page.getByTestId(/^splash-screen-root-/);

async function expectNoSeriousAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

async function openGame(page: Page) {
  await page.goto('/game');
  await expect(splash(page)).toBeVisible();
}

async function skipToFirstOptions(page: Page) {
  await splash(page).click();
  await expect(page.getByTestId('options-dialog-root')).toBeVisible();
}

test.describe('app routes', () => {
  test('shows the greeting and navigates to the game without leaving the Angular app', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /happy birthday, kira/i })).toBeVisible();

    await page.getByRole('link', { name: /play the memory game/i }).click();

    await expect(page).toHaveURL(/\/game$/);
    await expect(page.locator('app-game')).toBeVisible();
    await expect(splash(page)).toBeVisible();
  });
});

test.describe('axe accessibility', () => {
  test('greeting route has no serious or critical violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('game splash has no serious or critical violations', async ({ page }) => {
    await openGame(page);
    await expectNoSeriousAxeViolations(page);
  });

  test('first-open options popup over preview board has no serious or critical violations', async ({
    page,
  }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    await expect(page.getByTestId('board-grid-root-preview')).toBeAttached();
    await expectNoSeriousAxeViolations(page);
  });

  test('reopened options popup after Go -> New Game has no serious or critical violations', async ({
    page,
  }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    await page.getByTestId('options-action-button-go').click();
    await expect(page.getByTestId('options-dialog-root')).toBeHidden();

    await page.getByTestId('header-action-button-new-game').click();
    await expect(page.getByTestId('options-dialog-root')).toBeVisible();
    await expect(page.getByTestId('options-dialog-close')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});
