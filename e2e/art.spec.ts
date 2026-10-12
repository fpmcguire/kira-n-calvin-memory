import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { edition } from './edition';
import {
  BEFORE_CUTOFF,
  boxOf,
  card,
  cards,
  contrast,
  expectNoAxeViolations,
  fixRandom,
  flipMismatch,
  openGame,
  paintOf,
  pinClock,
  skipToFirstOptions,
  startGame,
  styleOf,
} from './support';

const ROOT = join(__dirname, '..');
const ALL_THEMES = edition.themes.map((theme) => theme.id);
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const themeOf = (id: string) => edition.themes.find((theme) => theme.id === id)!;

interface FaceReading {
  readonly theme: string;
  readonly variant: string;
  readonly slot: string | null;
  readonly treatment: string | null;
  readonly cue: string | null;
  readonly medallions: number;
  readonly customProperties: Record<string, string>;
}

/** Shows every remaining card (Show All) and reads each face root, in grid order. */
async function readFaces(page: Page): Promise<FaceReading[]> {
  await page.getByTestId('header-action-button-show-all').click();
  await expect(page.locator('[data-state="peeked"]').first()).toBeVisible();
  return page.locator('[data-testid^="board-card-button-"]').evaluateAll((buttons) =>
    buttons.map((button) => {
      const face = button.querySelector<HTMLElement>('app-card-face')!;
      const art = face.querySelector<HTMLElement>('.art')!;
      const custom: Record<string, string> = {};
      for (const name of Array.from(art.style)) {
        if (name.startsWith('--')) {
          custom[name] = art.style.getPropertyValue(name);
        }
      }
      return {
        theme: button.getAttribute('data-theme')!,
        variant: button.getAttribute('data-variant')!,
        slot: face.getAttribute('data-variant-slot'),
        treatment: face.getAttribute('data-treatment-id'),
        cue: face.getAttribute('data-cue-present'),
        medallions: face.querySelectorAll('.medallion').length,
        customProperties: custom,
      };
    }),
  );
}

/** Waits for every running CSS transition and animation (flip, pop) to finish. */
async function settleMotion(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => null))),
  );
}

/**
 * Per top-level group, the rendered fill and stroke of every shape: what the user sees. Two
 * faces of one activity must differ in exactly the selected slot's groups (AC5).
 */
function paintSignature(page: Page, index: number): Promise<Record<string, string>> {
  return page.getByTestId(`board-card-button-${index}`).evaluate((button) => {
    const out: Record<string, string> = {};
    const groups = Array.from(button.querySelectorAll('svg > g'));
    groups.forEach((group, position) => {
      const key = `${position}:${group.getAttribute('data-group')}:${
        group.getAttribute('data-slot') ?? group.getAttribute('data-part')
      }`;
      out[key] = Array.from(group.querySelectorAll('polyline, circle, ellipse, rect, path'))
        .map((shape) => {
          const style = getComputedStyle(shape);
          return `${shape.tagName}|${style.fill}|${style.stroke}`;
        })
        .join(';');
    });
    return out;
  });
}

test.describe('structured activity art, variant slots and medallion (R27-R30, R35)', () => {
  test.beforeEach(async ({ page }) => {
    await pinClock(page, BEFORE_CUTOFF);
  });

  test('every theme names a supplied child-prefixed SVG, served unchanged, and the logo is the supplied file (AC1, AC9)', () => {
    for (const theme of edition.themes) {
      const served = join(ROOT, 'public', theme.art.assetPath);
      expect(basename(theme.art.assetPath), theme.id).toMatch(/^(kira|calvin)-/);
      expect(sha256(served), theme.id).toBe(
        sha256(join(ROOT, 'resources/art', basename(theme.art.assetPath))),
      );
      expect(readFileSync(served, 'utf8').trimStart(), theme.id).toMatch(/^<svg[\s>]/);
    }
    expect(sha256(join(ROOT, 'public', edition.brand.logo))).toBe(
      sha256(join(ROOT, 'resources/art/logo.svg')),
    );
  });

  test('the dev server serves edition.json, every activity and the logo with the right types (AC1, AC30)', async ({
    page,
  }) => {
    const json = await page.request.get('/content/kira-calvin/edition.json');
    expect(json.status()).toBe(200);
    expect(json.headers()['content-type']).toContain('application/json');
    for (const path of [
      ...edition.themes.map((theme) => theme.art.assetPath),
      edition.brand.logo,
    ]) {
      const response = await page.request.get(`/${path}`);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type'], path).toContain('image/svg+xml');
    }
  });

  test('face-down cards have no front SVG, medallion, hooks or face names (AC6, AC7)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const board = page.getByTestId('board-grid-root-live');
    await expect(cards(page)).toHaveCount(40);
    await expect(board.locator('.front, app-card-face, svg, .medallion')).toHaveCount(0);
    await expect(
      board.locator('[data-variant-slot], [data-treatment-id], [data-cue-present]'),
    ).toHaveCount(0);
    await expect(board.locator('[data-difference]')).toHaveCount(0);

    const snapshot = await board.ariaSnapshot();
    expect(snapshot).toContain('Card 1, face down');
    expect(snapshot).not.toMatch(/Kira:|Calvin:|medallion|slot/i);
  });

  test('every shown face draws its own inline SVG, never an image or base64 (AC1, AC9)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const faces = await readFaces(page);
    expect(faces).toHaveLength(40);
    expect(new Set(faces.map((face) => face.theme))).toEqual(new Set(ALL_THEMES));
    const board = page.getByTestId('board-grid-root-live');
    await expect(board.locator('.front svg')).toHaveCount(40);
    await expect(board.locator('.front img')).toHaveCount(0);
    expect(await board.innerHTML()).not.toContain('base64');
    for (const theme of ALL_THEMES) {
      const index = faces.findIndex((face) => face.theme === theme);
      await expect(card(page, index).locator('svg')).toHaveAttribute(
        'data-activity',
        themeOf(theme).name,
      );
    }
  });

  test('variants on: one eligible slot per theme, identical for every copy, base uses defaults (AC4, AC5)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const faces = await readFaces(page);

    for (const theme of ALL_THEMES) {
      const art = themeOf(theme).art;
      const alternates = faces.filter((f) => f.theme === theme && f.variant === 'alternate');
      const bases = faces.filter((f) => f.theme === theme && f.variant === 'base');
      expect(alternates, theme).toHaveLength(2);
      expect(bases, theme).toHaveLength(2);

      const selected = art.eligibleSlotTreatments.find(
        (entry) => entry.slotId === alternates[0].slot,
      );
      expect(selected, `${theme} slot is on the allow-list`).toBeDefined();
      for (const face of alternates) {
        expect(face).toMatchObject({
          slot: selected!.slotId,
          treatment: selected!.treatmentId,
          cue: 'true',
          medallions: 1,
          customProperties: selected!.properties,
        });
      }
      for (const face of bases) {
        expect(face, theme).toMatchObject({
          slot: null,
          treatment: null,
          cue: 'false',
          medallions: 0,
          customProperties: {},
        });
      }
    }
  });

  test('an alternate face repaints exactly its selected slot and nothing else (AC5)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const faces = await readFaces(page);

    for (const theme of ALL_THEMES) {
      const alternate = faces.findIndex((f) => f.theme === theme && f.variant === 'alternate');
      const base = faces.findIndex((f) => f.theme === theme && f.variant === 'base');
      const slot = faces[alternate].slot!;
      const [a, b] = [await paintSignature(page, alternate), await paintSignature(page, base)];
      expect(Object.keys(a), theme).toEqual(Object.keys(b));

      const changed = Object.keys(a).filter((key) => a[key] !== b[key]);
      expect(changed.length, `${theme} changes something`).toBeGreaterThan(0);
      for (const key of changed) {
        const [, group, name] = key.split(':');
        expect(group, `${theme} ${key}`).toBe('variant');
        expect(name, `${theme} ${key}`).toBe(slot);
      }
    }
  });

  test('Drones drone recolors both of its variables, and only the drone (AC5, AC15)', async ({
    page,
  }) => {
    // Roll 0 selects the first eligible entry, which for Drones is the multi-variable `drone`.
    await fixRandom(page, 0);
    await startGame(page, { themes: ['drones'], variants: true, fill: 4 });
    const faces = await readFaces(page);
    const alternate = faces.findIndex((f) => f.variant === 'alternate');
    const base = faces.findIndex((f) => f.variant === 'base');
    expect(faces[alternate]).toMatchObject({
      slot: 'drone',
      treatment: 'drone-gold-berry',
      customProperties: { '--drone': '#e1a21a', '--drone-2': '#a33f73' },
    });
    const [a, b] = [await paintSignature(page, alternate), await paintSignature(page, base)];
    const changed = Object.keys(a).filter((key) => a[key] !== b[key]);
    expect(changed.map((key) => key.split(':').slice(1).join(':'))).toEqual(['variant:drone']);
    const drone = faces[alternate].customProperties;
    expect(Object.keys(drone).sort()).toEqual(['--drone', '--drone-2']);
  });

  test('Go and Restart reroll the selection; flips and Show All do not (AC4)', async ({ page }) => {
    await fixRandom(page, 0);
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const slotsOf = async () => {
      const faces = await readFaces(page);
      return Object.fromEntries(
        ALL_THEMES.map((theme) => [
          theme,
          faces.find((f) => f.theme === theme && f.variant === 'alternate')!.slot,
        ]),
      );
    };
    const first = await slotsOf();
    expect(first).toEqual(
      Object.fromEntries(
        ALL_THEMES.map((theme) => [theme, themeOf(theme).art.eligibleSlotTreatments[0].slotId]),
      ),
    );

    // Show All again after it has closed: same selection.
    await expect(page.locator('[data-state="peeked"]')).toHaveCount(0, { timeout: 6000 });
    expect(await slotsOf()).toEqual(first);

    await page.evaluate(() => {
      Math.random = () => 0.99;
    });
    await expect(page.locator('[data-state="peeked"]')).toHaveCount(0, { timeout: 6000 });
    await page.getByTestId('header-action-button-restart').click();
    // Show All counted as an attempt, so the game is in progress and Restart asks first.
    await page.getByTestId('confirm-action-button-confirm').click();
    const rerolled = await slotsOf();
    expect(rerolled).toEqual(
      Object.fromEntries(
        ALL_THEMES.map((theme) => {
          const list = themeOf(theme).art.eligibleSlotTreatments;
          return [theme, list[list.length - 1].slotId];
        }),
      ),
    );
    expect(rerolled).not.toEqual(first);
  });

  test('variants off: base faces only, no recoloring, no medallion (AC4, AC6)', async ({
    page,
  }) => {
    await startGame(page, { themes: ['dance', 'snowboard'], variants: false, fill: 8 });
    const faces = await readFaces(page);
    expect(faces.every((face) => face.variant === 'base')).toBe(true);
    for (const face of faces) {
      expect(face).toMatchObject({
        slot: null,
        treatment: null,
        cue: 'false',
        medallions: 0,
        customProperties: {},
      });
    }
    await expect(page.locator('.medallion')).toHaveCount(0);
  });

  test('the reveal shows the same slot, treatment and medallion as the board (AC6, AC7)', async ({
    page,
  }) => {
    await startGame(page, { themes: ['dance', 'snowboard'], variants: true, fill: 8 });
    const keys = await page
      .locator('[data-testid^="board-card-button-"]')
      .evaluateAll((els) =>
        els.map((el) => `${el.getAttribute('data-theme')}|${el.getAttribute('data-variant')}`),
      );
    const alternate = keys.indexOf('dance|alternate');
    const base = keys.indexOf('snowboard|base');
    await card(page, alternate).click();
    await card(page, base).click();
    const boardFace = card(page, alternate).locator('app-card-face');
    const boardAttrs = {
      slot: await boardFace.getAttribute('data-variant-slot'),
      treatment: await boardFace.getAttribute('data-treatment-id'),
      cue: await boardFace.getAttribute('data-cue-present'),
    };
    await expect(page.getByTestId('reveal-overlay-root-mismatch')).toBeVisible();
    await settleMotion(page);

    const first = page.getByTestId('reveal-card-button-1').locator('app-card-face');
    const second = page.getByTestId('reveal-card-button-2').locator('app-card-face');
    await expect(first).toHaveAttribute('data-variant-slot', boardAttrs.slot!);
    await expect(first).toHaveAttribute('data-treatment-id', boardAttrs.treatment!);
    await expect(first).toHaveAttribute('data-cue-present', 'true');
    await expect(first.locator('.medallion')).toHaveCount(1);
    await expect(first.locator('svg')).toHaveCount(1);
    await expect(second).toHaveAttribute('data-cue-present', 'false');
    await expect(second).not.toHaveAttribute('data-variant-slot', /.*/);
    await expect(second.locator('.medallion')).toHaveCount(0);

    const medallion = await boxOf(first.locator('.medallion'));
    expect(medallion.width).toBeCloseTo(28, 0);
    expect(medallion.height).toBeCloseTo(28, 0);
    const square = await boxOf(first.locator('.art-svg'));
    const medallionBottom = medallion.y + medallion.height;
    expect(medallionBottom, 'medallion clears the square art').toBeLessThanOrEqual(square.y + 0.5);
  });

  test('the board medallion is at least 12 px with a 2 px ring and clears the art (AC6)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const faces = await readFaces(page);
    await settleMotion(page);
    const index = faces.findIndex((f) => f.variant === 'alternate');
    const face = card(page, index).locator('app-card-face');
    const cardBox = await boxOf(card(page, index));
    const medallion = await boxOf(face.locator('.medallion'));
    const diamond = await boxOf(face.locator('.diamond'));
    expect(cardBox.width).toBeGreaterThanOrEqual(52);
    expect(medallion.width).toBeGreaterThanOrEqual(12 - 0.5);
    expect(medallion.width / cardBox.width).toBeCloseTo(12 / 52, 1);
    expect(diamond.width).toBeGreaterThanOrEqual(5);
    expect(diamond.height).toBeGreaterThanOrEqual(5);
    const ring = parseFloat(await styleOf(face.locator('.medallion'), 'border-top-width'));
    expect(ring).toBeGreaterThanOrEqual(2);

    const art = await boxOf(face.locator('.art-svg'));
    expect(medallion.y + medallion.height).toBeLessThanOrEqual(art.y + 0.5);
    // The square art is contained in the 3:4 card, not stretched.
    const svg = await boxOf(face.locator('svg'));
    expect(svg.width).toBeLessThanOrEqual(art.width + 0.5);
    expect(svg.height).toBeLessThanOrEqual(art.height + 0.5);
  });

  test('inline SVG faces, the medallion and the reveal pass axe (AC19)', async ({ page }) => {
    await startGame(page, { themes: ['dance', 'snowboard'], variants: true, fill: 8 });
    const keys = await page
      .locator('[data-testid^="board-card-button-"]')
      .evaluateAll((els) =>
        els.map((el) => `${el.getAttribute('data-theme')}|${el.getAttribute('data-variant')}`),
      );
    const alternate = keys.indexOf('dance|alternate');
    await card(page, alternate).click();
    await expect(card(page, alternate).locator('svg')).toHaveCount(1);
    await settleMotion(page);
    await expectNoAxeViolations(page);

    await flipMismatch(page, [alternate, keys.indexOf('snowboard|base')]);
    await settleMotion(page);
    await expectNoAxeViolations(page);
  });

  test('every card shows the same logo back and no face (R30, AC6)', async ({ page }) => {
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
    expect(new Set(backs.map((back) => back.src))).toEqual(new Set([edition.brand.logo]));
    expect(new Set(backs.map((back) => back.markup)).size).toBe(1);
    expect(backs.every((back) => back.text === '')).toBe(true);
  });

  test('the fill slider and its steppers have an effective 44 by 44 px target (AC18, D3)', async ({
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

  test('every option checkbox label is at least 44 px tall (AC18)', async ({ page }) => {
    await openGame(page);
    await skipToFirstOptions(page);
    const labels = page.locator('[data-testid="options-dialog-root"] label.check');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      expect((await boxOf(labels.nth(i))).height, `label ${i}`).toBeGreaterThanOrEqual(44);
    }
  });

  test('face ink, the medallion and the logo ring meet WCAG AA contrast when rendered (AC17)', async ({
    page,
  }) => {
    await startGame(page, { themes: ALL_THEMES, variants: true, fill: 40 });
    const faces = await readFaces(page);

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

    for (const theme of ALL_THEMES) {
      const index = faces.findIndex((f) => f.theme === theme && f.variant === 'alternate');
      const face = card(page, index).locator('.face');
      const ink = await paintOf(page, await styleOf(face, 'color'));
      const surface = await paintOf(page, await styleOf(face, 'background-color'));
      const text = contrast(ink, surface);
      expect(text, `${theme} face ink`).toBeGreaterThanOrEqual(4.5);

      const medallion = card(page, index).locator('.medallion');
      const cream = await paintOf(page, await styleOf(medallion, 'background-color'));
      const ring = await paintOf(page, await styleOf(medallion, 'border-top-color'));
      const ringOnCream = contrast(ring, cream);
      const creamOnFace = contrast(cream, surface);
      const ringOnFace = contrast(ring, surface);
      expect(ringOnCream, `${theme} medallion ring on cream`).toBeGreaterThanOrEqual(3);
      expect(ringOnFace, `${theme} medallion ring on face`).toBeGreaterThanOrEqual(3);
      expect(ring, `${theme} medallion ring`).toEqual(await paintOf(page, '#17233f'));
      test.info().annotations.push({
        type: 'contrast',
        description:
          `${theme}: face ink ${text.toFixed(2)}:1 (min 4.5), medallion ring on cream ` +
          `${ringOnCream.toFixed(2)}:1, ring on face ${ringOnFace.toFixed(2)}:1 (non-text, min 3), ` +
          `cream on face ${creamOnFace.toFixed(2)}:1 (informational)`,
      });
    }
  });
});
