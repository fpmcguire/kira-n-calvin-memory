import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { kiraCalvinEdition } from '../src/app/content/kira-calvin';
import {
  BEFORE_CUTOFF,
  boxOf,
  card,
  cards,
  contrast,
  faceKeys,
  flipMismatch,
  openGame,
  paintOf,
  pinClock,
  skipToFirstOptions,
  startGame,
  styleOf,
} from './support';

const ROOT = join(__dirname, '..');
const ALL_THEMES = kiraCalvinEdition.themes.map((theme) => theme.id);
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const artOf = (theme: string) => kiraCalvinEdition.themes.find((t) => t.id === theme)!.art;

test.describe('activity art, cues and logo (R27, R28, R29, R30, R35)', () => {
  test.beforeEach(async ({ page }) => {
    await pinClock(page, BEFORE_CUTOFF);
  });

  test('each theme maps to a supplied SVG, copied unchanged, and the logo is the supplied file (AC1, AC4)', () => {
    for (const theme of kiraCalvinEdition.themes) {
      const served = join(ROOT, 'public', theme.art);
      expect(sha256(served), theme.id).toBe(
        sha256(join(ROOT, 'resources/art', basename(theme.art))),
      );
      expect(readFileSync(served, 'utf8').trimStart(), theme.id).toMatch(/^<svg[\s>]/);
    }
    const logo = join(ROOT, 'public', kiraCalvinEdition.brand.logo);
    expect(sha256(logo)).toBe(sha256(join(ROOT, 'resources/art/logo.svg')));
  });

  test('the dev server serves every activity and the logo as SVG (AC1, AC24)', async ({ page }) => {
    const paths = [
      ...kiraCalvinEdition.themes.map((theme) => theme.art),
      kiraCalvinEdition.brand.logo,
    ];
    for (const path of paths) {
      const response = await page.request.get(`/${path}`);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type'], path).toContain('image/svg+xml');
    }
  });

  test('every card shows its own theme art, and the art decodes (AC1, AC3)', async ({ page }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const keys = await cards(page).evaluateAll((elements) =>
      elements.map((el) => el.getAttribute('data-theme')),
    );
    expect(keys).toHaveLength(40);
    for (const [index, theme] of keys.entries()) {
      const src = await card(page, index).locator('.front img').getAttribute('src');
      expect(src, `card ${index} ${theme}`).toBe(artOf(theme!));
    }
    for (const theme of ALL_THEMES) {
      const img = card(page, keys.indexOf(theme)).locator('.front img');
      await expect
        .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
        .toBe(true);
    }
  });

  test('base is a filled circle and alternate a filled star, on the board and in the reveal (AC3)', async ({
    page,
  }) => {
    await startGame(page, { themes: ['dance'], variants: true, fill: 4 });
    const keys = await faceKeys(page);
    const baseIndex = keys.findIndex((key) => key.endsWith('|base'));
    const alternateIndex = keys.findIndex((key) => key.endsWith('|alternate'));
    expect(baseIndex).toBeGreaterThanOrEqual(0);
    expect(alternateIndex).toBeGreaterThanOrEqual(0);

    await expect(card(page, baseIndex).locator('app-card-face')).toHaveAttribute(
      'data-badge',
      'circle',
    );
    await expect(card(page, alternateIndex).locator('app-card-face')).toHaveAttribute(
      'data-badge',
      'star',
    );
    expect(await styleOf(card(page, baseIndex).locator('.badge'), 'clip-path')).toMatch(
      /^circle\(/,
    );
    expect(await styleOf(card(page, alternateIndex).locator('.badge'), 'clip-path')).toMatch(
      /^polygon\(/,
    );
    expect(await card(page, baseIndex).locator('.front img').getAttribute('src')).toBe(
      await card(page, alternateIndex).locator('.front img').getAttribute('src'),
    );

    await flipMismatch(page, [baseIndex, alternateIndex]);
    const first = page.getByTestId('reveal-card-button-1');
    const second = page.getByTestId('reveal-card-button-2');
    await expect(first.locator('app-card-face')).toHaveAttribute('data-badge', 'circle');
    await expect(second.locator('app-card-face')).toHaveAttribute('data-badge', 'star');
    await expect(first.locator('img')).toHaveAttribute('src', artOf('dance'));
    await expect(second.locator('img')).toHaveAttribute('src', artOf('dance'));
  });

  test('with variants off only base faces are dealt, and none shows a cue (AC3)', async ({
    page,
  }) => {
    await startGame(page, { themes: ['dance', 'snowboard'], variants: false, fill: 8 });
    const keys = await faceKeys(page);
    expect(keys.every((key) => key.endsWith('|base'))).toBe(true);
    await expect(page.locator('app-card-face[data-badge="none"]')).toHaveCount(8);
  });

  test('every face-down card shows the same logo back and no face (R30, AC5)', async ({ page }) => {
    await startGame(page, { themes: ALL_THEMES, fill: 20 });
    const backs = await cards(page).evaluateAll((elements) =>
      elements.map((el) => {
        const back = el.querySelector('.back');
        return {
          src: back?.querySelector('img')?.getAttribute('src') ?? null,
          text: back?.textContent?.trim() ?? null,
          markup: back?.innerHTML ?? null,
        };
      }),
    );
    expect(backs).toHaveLength(20);
    expect(new Set(backs.map((back) => back.src))).toEqual(new Set([kiraCalvinEdition.brand.logo]));
    expect(new Set(backs.map((back) => back.markup)).size).toBe(1);
    expect(backs.every((back) => back.text === '')).toBe(true);
  });

  test('the fill slider and its steppers have an effective 44 by 44 px target (AC12, D3)', async ({
    page,
  }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    await page.getByTestId('options-toggle-checkbox-fill').check();
    const slider = await boxOf(page.getByTestId('options-fill-stepper-slider'));
    expect(slider.height).toBeGreaterThanOrEqual(44);
    expect(slider.width).toBeGreaterThanOrEqual(44);
    const minus = await boxOf(page.getByTestId('options-fill-stepper-decrement'));
    const plus = await boxOf(page.getByTestId('options-fill-stepper-increment'));
    expect(minus.width).toBeGreaterThanOrEqual(44);
    expect(minus.height).toBeGreaterThanOrEqual(44);
    expect(plus.width).toBeGreaterThanOrEqual(44);
    expect(plus.height).toBeGreaterThanOrEqual(44);
  });

  test('every option checkbox label is at least 44 px tall (AC12)', async ({ page }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    const labels = page.locator('[data-testid="options-dialog-root"] label.check');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      expect((await boxOf(labels.nth(i))).height, `label ${i}`).toBeGreaterThanOrEqual(44);
    }
  });

  test('face ink, the badge cue and the logo ring meet WCAG AA contrast when rendered (AC11)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const sample = await cards(page).evaluateAll((elements) => {
      const firstOfTheme = new Map<string, number>();
      elements.forEach((el, index) => {
        const theme = el.getAttribute('data-theme') ?? '';
        if (!firstOfTheme.has(theme)) {
          firstOfTheme.set(theme, index);
        }
      });
      return [...firstOfTheme.entries()].map(([theme, index]) => ({ theme, index }));
    });
    expect(sample).toHaveLength(10);

    const backPaint = await paintOf(
      page,
      await styleOf(card(page, 0).locator('.back'), 'background-color'),
    );
    // The cream ring of logo.svg is a fixed SVG fill (#f3e6cc) on the navy back.
    const ringRatio = contrast(await paintOf(page, '#f3e6cc'), backPaint);
    expect(ringRatio, 'logo ring on card back').toBeGreaterThanOrEqual(3);
    test.info().annotations.push({
      type: 'contrast',
      description: `logo ring #f3e6cc on card back: ${ringRatio.toFixed(2)}:1 (non-text, min 3)`,
    });

    for (const { index, theme } of sample) {
      const face = card(page, index).locator('.face');
      const ink = await paintOf(page, await styleOf(face, 'color'));
      const surface = await paintOf(page, await styleOf(face, 'background-color'));
      const text = contrast(ink, surface);
      expect(text, `${theme} face ink`).toBeGreaterThanOrEqual(4.5);

      const badge = await paintOf(
        page,
        await styleOf(card(page, index).locator('.badge'), 'background-color'),
      );
      const cue = contrast(badge, surface);
      expect(cue, `${theme} badge cue`).toBeGreaterThanOrEqual(3);
      test.info().annotations.push({
        type: 'contrast',
        description: `${theme}: face ink ${text.toFixed(2)}:1 (min 4.5), badge cue ${cue.toFixed(2)}:1 (min 3)`,
      });
    }
  });
});
