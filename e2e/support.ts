import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Instants either side of the cutoff `2026-10-11T00:00 America/Denver` (R3). Denver is UTC-6
 * (MDT) on these dates. Pinning the browser clock keeps the suite independent of the host
 * date and time zone, which is already past the cutoff.
 */
export const LAST_SECOND_BEFORE_CUTOFF = new Date('2026-10-10T23:59:59-06:00');
export const FIRST_SECOND_AFTER_CUTOFF = new Date('2026-10-11T00:00:00-06:00');
/** An ordinary pre-cutoff time for tests that only need Kira-first behaviour. */
export const BEFORE_CUTOFF = new Date('2026-10-10T18:00:00-06:00');

/**
 * Findings that are documented and accepted. Everything else fails, whatever its impact
 * (STEP-02 D4: moderate, minor and best-practice findings are reported too). None are
 * accepted today. STEP-02 D3 (the 16 px fill slider) is a design-spec size deviation that
 * axe does not report; STEP-06 owns it.
 */
interface AxeException {
  readonly rule: string;
  /** A fragment of the offending node's HTML that identifies the one accepted element. */
  readonly htmlIncludes: string;
  readonly reason: string;
}

export const AXE_EXCEPTIONS: readonly AxeException[] = [];

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Fails on every axe finding (critical to minor, WCAG and best-practice) not listed above. */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  const reported = violations.flatMap((violation) =>
    violation.nodes
      .filter(
        (node) =>
          !AXE_EXCEPTIONS.some(
            (exception) =>
              exception.rule === violation.id && node.html.includes(exception.htmlIncludes),
          ),
      )
      .map((node) => `${violation.id} (${violation.impact}): ${node.target.join(' ')}`),
  );
  expect(reported).toEqual([]);
}

export const splash = (page: Page) => page.getByTestId(/^splash-screen-root-/);
export const cards = (page: Page) => page.locator('[data-testid^="board-card-button-"]');
export const card = (page: Page, index: number) => page.getByTestId(`board-card-button-${index}`);

export interface GameSetup {
  /** Theme IDs to check after Reset; omitted keeps the first-open default of all ten. */
  readonly themes?: readonly string[];
  /** Children to check; omitted keeps Kira alone (the first-open default, re-applied after Reset). */
  readonly players?: readonly ('kira' | 'calvin')[];
  readonly variants?: boolean;
  /** Fill the grid at this card count. */
  readonly fill?: number;
}

/** Pins the browser clock at `time` and lets it flow, so timers still run in real time. */
export async function pinClock(page: Page, time: Date): Promise<void> {
  await page.clock.install({ time });
}

/** Replaces `Math.random` so player and deck rolls are known: 0 picks Kira, 0.99 picks Calvin. */
export async function fixRandom(page: Page, value: number): Promise<void> {
  await page.addInitScript((roll) => {
    Math.random = () => roll;
  }, value);
}

export async function openGame(page: Page): Promise<void> {
  await page.goto('/game');
  await expect(splash(page)).toBeVisible();
}

export async function skipToFirstOptions(page: Page): Promise<void> {
  await splash(page).click();
  await expect(page.getByTestId('options-dialog-root')).toBeVisible();
}

/** Applies options in an open popup without pressing Go. */
export async function configure(page: Page, setup: GameSetup): Promise<void> {
  if (setup.themes) {
    await page.getByTestId('options-action-button-reset').click();
    // Reset re-renders asynchronously; a checkbox ticked before it lands would be overwritten.
    await expect(page.getByTestId('options-summary-text')).toHaveText(
      'Pick at least one player and one theme',
    );
    for (const theme of setup.themes) {
      await page.getByTestId(`options-theme-checkbox-${theme}`).check();
    }
  }
  const players = setup.players ?? ['kira'];
  for (const child of ['kira', 'calvin'] as const) {
    await page.getByTestId(`options-player-checkbox-${child}`).setChecked(players.includes(child));
  }
  if (setup.variants !== undefined) {
    await page.getByTestId('options-toggle-checkbox-variants').setChecked(setup.variants);
  }
  if (setup.fill !== undefined) {
    await page.getByTestId('options-toggle-checkbox-fill').check();
    await page.getByTestId('options-fill-stepper-slider').fill(String(setup.fill));
    await expect(page.getByTestId('options-fill-stepper-value')).toHaveText(String(setup.fill));
  }
}

/** Opens the game, skips the splash, applies `setup` and presses Go. */
export async function startGame(page: Page, setup: GameSetup = {}): Promise<void> {
  await openGame(page);
  await skipToFirstOptions(page);
  await configure(page, setup);
  await page.getByTestId('options-action-button-go').click();
  await expect(page.getByTestId('options-dialog-root')).toBeHidden();
  await expect(page.getByTestId('board-grid-root-live')).toBeVisible();
}

/** `theme|variant` of every dealt card, in grid order (test hooks per design-spec 3.9). */
export async function faceKeys(page: Page): Promise<string[]> {
  return cards(page).evaluateAll((elements) =>
    elements.map(
      (element) => `${element.getAttribute('data-theme')}|${element.getAttribute('data-variant')}`,
    ),
  );
}

/** Grid indexes grouped into matching pairs by face identity. */
export function pairsOf(keys: readonly string[]): [number, number][] {
  const byFace = new Map<string, number[]>();
  keys.forEach((key, index) => byFace.set(key, [...(byFace.get(key) ?? []), index]));
  const pairs: [number, number][] = [];
  for (const indexes of byFace.values()) {
    for (let i = 0; i + 1 < indexes.length; i += 2) {
      pairs.push([indexes[i], indexes[i + 1]]);
    }
  }
  return pairs;
}

/** Two card indexes that do not match, or null when every card shares one face. */
export function mismatchOf(keys: readonly string[]): [number, number] | null {
  const other = keys.findIndex((key) => key !== keys[0]);
  return other === -1 ? null : [0, other];
}

export const reveal = (page: Page, outcome: 'match' | 'mismatch') =>
  page.getByTestId(`reveal-overlay-root-${outcome}`);

/** Flips two cards that match and waits for the reveal to close on its own (R16). */
export async function playMatch(page: Page, [a, b]: readonly [number, number]): Promise<void> {
  await card(page, a).click();
  await card(page, b).click();
  await expect(reveal(page, 'match')).toBeVisible();
  await expect(reveal(page, 'match')).toBeHidden();
}

/** Flips two cards that do not match and leaves the mismatch reveal open. */
export async function flipMismatch(page: Page, [a, b]: readonly [number, number]): Promise<void> {
  await card(page, a).click();
  await card(page, b).click();
  await expect(reveal(page, 'mismatch')).toBeVisible();
}

export async function states(page: Page): Promise<(string | null)[]> {
  return cards(page).evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-state')),
  );
}

export async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Expected the element to have a layout box');
  }
  return box;
}
