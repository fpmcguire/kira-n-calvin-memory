import { expect, test, type Page } from '@playwright/test';
import { BEFORE_CUTOFF, boxOf, card, cards, faceKeys, pinClock, startGame } from './support';

const VIEWPORTS = [
  { name: 'phone portrait', width: 390, height: 844 },
  { name: 'phone landscape', width: 844, height: 390 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'tablet landscape', width: 1024, height: 768 },
] as const;

const BOARDS = [
  { count: 4, setup: { themes: ['dance', 'snowboard'] } },
  { count: 20, setup: {} },
  { count: 40, setup: { variants: true } },
] as const;

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const rectsOf = (page: Page) =>
  cards(page).evaluateAll((elements): Rect[] =>
    elements.map((element) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      return { left, top, width, height };
    }),
  );

test.describe('board layout (R13, R14)', () => {
  test.beforeEach(async ({ page }) => {
    await pinClock(page, BEFORE_CUTOFF);
  });

  for (const viewport of VIEWPORTS) {
    for (const board of BOARDS) {
      test(`${board.count} cards on a ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await startGame(page, board.setup);
        await expect(cards(page)).toHaveCount(board.count);
        // Layout settles after the first ResizeObserver pass.
        await expect(card(page, 0)).toBeVisible();

        const table = page.locator('app-board .table');
        const tableBox = await boxOf(table);
        const { clientWidth, scrolls } = await table.evaluate((el) => ({
          clientWidth: el.clientWidth,
          scrolls: el.scrollHeight > el.clientHeight,
        }));
        const minimum = clientWidth < 520 ? 52 : 64;
        const rects = await rectsOf(page);

        for (const rect of rects) {
          expect(Math.abs(rect.width / rect.height - 3 / 4)).toBeLessThan(0.01);
          expect(rect.width).toBeGreaterThanOrEqual(minimum - 0.5);
          expect(rect.width).toBeLessThanOrEqual(220.5);
          expect(rect.left).toBeGreaterThanOrEqual(tableBox.x - 0.5);
          expect(rect.left + rect.width).toBeLessThanOrEqual(tableBox.x + tableBox.width + 0.5);
        }

        if (scrolls) {
          // Vertical scrolling is only the fallback once cards are at the minimum size.
          expect(rects[0].width).toBeLessThanOrEqual(minimum + 1);
        } else {
          const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));
          expect(bottom).toBeLessThanOrEqual(tableBox.y + tableBox.height + 0.5);
        }

        // Source order is reading order: row by row, left to right.
        const order = rects
          .map((rect, index) => ({ index, row: Math.round(rect.top), left: rect.left }))
          .sort((a, b) => a.row - b.row || a.left - b.left)
          .map((entry) => entry.index);
        expect(order).toEqual(rects.map((_, index) => index));

        // An incomplete last row starts at the left edge of the grid.
        const firstTop = Math.round(rects[0].top);
        const columns = rects.filter((rect) => Math.round(rect.top) === firstTop).length;
        const lastRow = rects.slice(Math.floor((rects.length - 1) / columns) * columns);
        expect(lastRow[0].left).toBeCloseTo(rects[0].left, 0);
      });
    }
  }

  test('rotating keeps card order, ids and states, scores and the active player (AC3)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startGame(page, { players: ['kira', 'calvin'] });
    await card(page, 3).click();

    const snapshot = () =>
      cards(page).evaluateAll((elements) =>
        elements.map((el) => [
          el.getAttribute('data-card-id'),
          el.getAttribute('data-state'),
          el.getAttribute('data-theme'),
        ]),
      );
    const before = await snapshot();
    const faces = await faceKeys(page);
    const portrait = await rectsOf(page);
    const active = await page
      .locator('[data-testid^="header-player-block-"][data-state="active"]')
      .getAttribute('data-testid');

    await page.setViewportSize({ width: 844, height: 390 });
    await expect.poll(async () => (await rectsOf(page))[0].width !== portrait[0].width).toBe(true);

    expect(await snapshot()).toEqual(before);
    expect(await faceKeys(page)).toEqual(faces);
    expect(before[3][1]).toBe('up');
    await expect(
      page.locator('[data-testid^="header-player-block-"][data-state="active"]'),
    ).toHaveAttribute('data-testid', active ?? '');
    await expect(page.getByTestId('header-player-block-kira-attempts')).toHaveText('0');
    await expect(page.getByTestId('header-player-block-calvin-attempts')).toHaveText('0');
  });

  test('the live board is not covered by the header and the page itself never scrolls (DS-002)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startGame(page, { variants: true });
    const { documentScrolls, headerBottom, tableTop } = await page.evaluate(() => {
      const header = document.querySelector('header')!.getBoundingClientRect();
      const table = document.querySelector('app-board .table')!.getBoundingClientRect();
      return {
        documentScrolls:
          document.documentElement.scrollHeight > document.documentElement.clientHeight,
        headerBottom: header.bottom,
        tableTop: table.top,
      };
    });
    expect(documentScrolls).toBe(false);
    expect(tableTop).toBeGreaterThanOrEqual(headerBottom - 0.5);
  });
});
