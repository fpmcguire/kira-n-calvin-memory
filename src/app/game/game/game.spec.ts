import { Provider, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { FEATURE_FLAGS } from '../../config/feature-flags';
import { Clock } from '../clock';
import { DEVICE_STORAGE, STORAGE_KEYS } from '../game-storage';
import { Random } from '../random';
import { ReducedMotion } from '../reduced-motion';
import { SPLASH_MS } from '../splash/splash';
import { END_DELAY_MS, FLIP_MS, MATCH_PAUSE_MS, SHOW_ALL_MS } from '../timings';
import { Game } from './game';

const BEFORE = new Date('2026-10-10T18:00:00Z');
const AFTER = new Date('2026-10-11T06:00:00Z');

const onDevice = (device: Storage): Provider => ({ provide: DEVICE_STORAGE, useValue: device });

async function setup(now: Date, random = 0.9, extra: Provider[] = []) {
  TestBed.configureTestingModule({
    providers: [
      { provide: Clock, useValue: { now: () => now } },
      { provide: Random, useValue: { next: () => random } },
      ...extra,
    ],
  });
  const fixture = TestBed.createComponent(Game);
  fixture.detectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const q = <T extends HTMLElement = HTMLElement>(id: string) =>
    root.querySelector<T>(`[data-testid="${id}"]`);
  const settle = async () => {
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
  };
  const click = async (el: HTMLElement | null) => {
    el?.click();
    await settle();
  };
  const press = async (el: HTMLElement | null, init: KeyboardEventInit) => {
    el?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
    await settle();
  };
  const skipSplash = () => click(root.querySelector('app-splash button'));
  const cards = () =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('[data-testid^="board-card-button-"]'));
  const card = (index: number) => q<HTMLButtonElement>(`board-card-button-${index}`);
  /** A pointer user focuses the card they tap, so overlay focus return has an opener. */
  const tap = async (index: number) => {
    const el = card(index);
    el?.focus();
    await click(el);
  };
  return { fixture, root, q, click, press, settle, skipSplash, cards, card, tap };
}

describe('Game shell', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the birthday splash before the cutoff (R2, R3)', async () => {
    const before = await setup(BEFORE);
    expect(before.q('splash-screen-root-birthday')?.textContent).toContain('Happy Birthday Kira!');
  });

  it.skipIf(FEATURE_FLAGS.permanentBirthday)(
    'shows the generic splash after the cutoff in the dated-birthday build (R2, R3)',
    async () => {
      const after = await setup(AFTER);
      expect(after.q('splash-screen-root-generic')?.textContent).toContain(
        'Kira-n-Calvin Memory Game',
      );
      expect(after.q('splash-screen-root-birthday')).toBeNull();
    },
  );

  it.skipIf(!FEATURE_FLAGS.permanentBirthday)(
    'keeps the birthday splash after the cutoff in the permanent-birthday build',
    async () => {
      const after = await setup(AFTER);
      expect(after.q('splash-screen-root-birthday')?.textContent).toContain('Happy Birthday Kira!');
      expect(after.q('splash-screen-root-generic')).toBeNull();
    },
  );

  it('opens the options popup over the preview board after a tap on the splash (R5)', async () => {
    const t = await setup(BEFORE);
    expect(t.q('options-dialog-root')).toBeNull();
    await t.skipSplash();
    expect(t.q('splash-screen-root-birthday')).toBeNull();
    expect(t.q('options-dialog-root')).not.toBeNull();
    expect(t.q('board-grid-root-preview')?.children.length).toBe(20);
  });

  it('advances from the splash on its own after about three seconds (R2)', async () => {
    vi.useFakeTimers();
    const t = await setup(BEFORE);
    expect(t.q('options-dialog-root')).toBeNull();
    await vi.advanceTimersByTimeAsync(SPLASH_MS);
    await t.settle();
    expect(t.q('options-dialog-root')).not.toBeNull();
  });

  it('has one h1 and moves focus into the splash, then into the popup (DS-026)', async () => {
    const t = await setup(BEFORE);
    expect(t.root.querySelectorAll('h1')).toHaveLength(1);
    await t.settle();
    expect(document.activeElement?.closest('app-splash')).not.toBeNull();
    await t.skipSplash();
    await t.settle();
    expect(document.activeElement).toBe(t.q('options-player-checkbox-kira'));
  });

  describe('first-open popup', () => {
    it('has all ten themes checked, no Close button and ignores Escape (R6, DS-025)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      // Prefix selector is intentional: counts the whole theme checkbox family.
      const themeBoxes = t.root.querySelectorAll<HTMLInputElement>(
        '[data-testid^="options-theme-checkbox-"]',
      );
      expect(themeBoxes).toHaveLength(10);
      expect(Array.from(themeBoxes).every((box) => box.checked)).toBe(true);
      expect(t.q('options-dialog-close')).toBeNull();
      expect(t.q('options-summary-text')?.textContent).toBe('20 cards · 10 pairs');

      await t.press(t.q('options-dialog-root'), { key: 'Escape' });
      expect(t.q('options-dialog-root')).not.toBeNull();
    });

    it('restores the last-used options in the checkboxes and summary (R36, AC2, AC17)', async () => {
      const device = new MemoryStorage({
        [STORAGE_KEYS.options]: JSON.stringify({
          players: ['calvin', 'kira'],
          variants: true,
          fill: false,
          fillCount: 4,
          themes: ['dance', 'drones'],
        }),
      });
      const t = await setup(AFTER, 0.9, [onDevice(device)]);
      await t.skipSplash();
      const checked = (id: string) => t.q<HTMLInputElement>(id)?.checked;
      expect(checked('options-player-checkbox-kira')).toBe(true);
      expect(checked('options-player-checkbox-calvin')).toBe(true);
      expect(checked('options-theme-checkbox-dance')).toBe(true);
      expect(checked('options-theme-checkbox-drones')).toBe(true);
      expect(checked('options-theme-checkbox-art')).toBe(false);
      expect(checked('options-toggle-checkbox-variants')).toBe(true);
      expect(checked('options-toggle-checkbox-fill')).toBe(false);
      expect(t.q('options-summary-text')?.textContent).toContain('8 cards · 4 pairs');
      expect(t.q('board-grid-root-preview')?.children.length).toBe(8);
      expect(t.q<HTMLButtonElement>('options-action-button-go')?.disabled).toBe(false);
    });

    it('Reset clears the draft but not the remembered options (AC4)', async () => {
      const saved = JSON.stringify({
        players: ['calvin'],
        variants: false,
        fill: false,
        fillCount: 4,
        themes: ['drones'],
      });
      const device = new MemoryStorage({ [STORAGE_KEYS.options]: saved });
      const t = await setup(BEFORE, 0.9, [onDevice(device)]);
      await t.skipSplash();
      await t.click(t.q('options-action-button-reset'));
      expect(t.q<HTMLInputElement>('options-player-checkbox-kira')?.checked).toBe(false);
      expect(t.q<HTMLInputElement>('options-player-checkbox-calvin')?.checked).toBe(false);
      expect(device.getItem(STORAGE_KEYS.options)).toBe(saved);
    });

    it('Reset clears every option and disables Go (R7, DS-010)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-variants'));
      await t.click(t.q('options-toggle-checkbox-fill'));
      await t.click(t.q('options-action-button-reset'));
      expect(t.q<HTMLInputElement>('options-toggle-checkbox-variants')?.checked).toBe(false);
      expect(t.q<HTMLInputElement>('options-toggle-checkbox-fill')?.checked).toBe(false);
      expect(t.q('options-fill-stepper-value')).toBeNull();
      expect(t.q<HTMLInputElement>('options-player-checkbox-kira')?.checked).toBe(false);
      expect(t.q<HTMLInputElement>('options-player-checkbox-calvin')?.checked).toBe(false);
      expect(t.q<HTMLButtonElement>('options-action-button-go')?.disabled).toBe(true);
      expect(t.q('options-summary-text')?.textContent).toBe(
        'Pick at least one player and one theme',
      );
      expect(t.q('board-grid-root-preview')?.children.length).toBe(0);
      expect(t.q('options-dialog-root')).not.toBeNull();
    });

    it('enables Go once a theme is checked, and the preview follows the draft (R7, DS-007)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-action-button-reset'));
      await t.click(t.q('options-theme-checkbox-dance'));
      expect(t.q('options-summary-text')?.textContent).toBe('Pick at least one player');
      expect(t.q<HTMLButtonElement>('options-action-button-go')?.disabled).toBe(true);
      await t.click(t.q('options-player-checkbox-kira'));
      expect(t.q<HTMLButtonElement>('options-action-button-go')?.disabled).toBe(false);
      expect(t.q('options-summary-text')?.textContent).toBe('2 cards · 1 pair');
      expect(t.q('board-grid-root-preview')?.children.length).toBe(2);
      await t.click(t.q('options-toggle-checkbox-variants'));
      expect(t.q('options-summary-text')?.textContent).toBe('4 cards · 2 pairs');
      expect(t.q('board-grid-root-preview')?.children.length).toBe(4);
    });

    it('shows the 4-40 stepper when fill is checked and keeps the count exact (R8, DS-011)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-fill'));
      expect(t.q('options-fill-stepper-value')?.textContent).toBe('20');
      await t.click(t.q('options-fill-stepper-increment'));
      expect(t.q('options-fill-stepper-value')?.textContent).toBe('24');
      expect(t.q('options-summary-text')?.textContent).toBe('24 cards · 12 pairs');
      expect(t.q('board-grid-root-preview')?.children.length).toBe(24);
      for (let i = 0; i < 10; i++) {
        await t.click(t.q('options-fill-stepper-increment'));
      }
      expect(t.q('options-fill-stepper-value')?.textContent).toBe('40');
      expect(t.q<HTMLButtonElement>('options-fill-stepper-increment')?.disabled).toBe(true);
    });

    it('contains Tab inside the popup (DS-026)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.settle();
      const first = t.q('options-player-checkbox-kira') as HTMLElement;
      const go = t.q('options-action-button-go') as HTMLElement;
      go.focus();
      await t.press(go, { key: 'Tab' });
      expect(document.activeElement).toBe(first);
      await t.press(first, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(go);
    });
  });

  describe('after Go', () => {
    it('applies the draft, closes the popup and deals the live board (DS-010)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-variants'));
      await t.click(t.q('options-action-button-go'));
      expect(t.q('options-dialog-root')).toBeNull();
      expect(t.q('board-grid-root-preview')).toBeNull();
      expect(t.cards()).toHaveLength(40);
      expect(t.q<HTMLButtonElement>('header-action-button-new-game')?.disabled).toBe(false);
      await t.settle();
      expect(document.activeElement).toBe(t.q('header-action-button-new-game'));
    });

    it('New Game reopens with current options; Close discards the draft (R24, R37)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-variants'));
      await t.click(t.q('options-action-button-go'));

      await t.click(t.q('header-action-button-new-game'));
      expect(t.q('options-dialog-close')).not.toBeNull();
      expect(t.q<HTMLInputElement>('options-toggle-checkbox-variants')?.checked).toBe(true);
      expect(t.q<HTMLButtonElement>('header-action-button-new-game')?.disabled).toBe(true);
      await t.settle();
      expect(document.activeElement).toBe(t.q('options-dialog-close'));

      await t.click(t.q('options-action-button-reset'));
      await t.click(t.q('options-dialog-close'));
      expect(t.q('options-dialog-root')).toBeNull();
      expect(t.cards()).toHaveLength(40);

      await t.click(t.q('header-action-button-new-game'));
      expect(t.q('options-summary-text')?.textContent).toBe('40 cards · 20 pairs');
      expect(t.q<HTMLInputElement>('options-theme-checkbox-dance')?.checked).toBe(true);
    });

    it('Escape closes the reopened popup and returns focus to New Game (R37, DS-026)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-action-button-go'));
      const newGame = t.q('header-action-button-new-game') as HTMLButtonElement;
      newGame.focus();
      await t.click(newGame);
      await t.press(t.q('options-dialog-root'), { key: 'Escape' });
      await t.settle();
      expect(t.q('options-dialog-root')).toBeNull();
      expect(document.activeElement).toBe(newGame);
    });
  });

  describe('live board', () => {
    type Harness = Awaited<ReturnType<typeof setup>>;
    /** Dealt order with the constant 0.9 roll: Dance, Dance, Snowboard, Snowboard. */
    async function startTwoPairs(t: Harness, twoPlayers = false) {
      await t.skipSplash();
      await t.click(t.q('options-action-button-reset'));
      await t.click(t.q('options-theme-checkbox-dance'));
      await t.click(t.q('options-theme-checkbox-snowboard'));
      await t.click(t.q('options-player-checkbox-kira'));
      if (twoPlayers) {
        await t.click(t.q('options-player-checkbox-calvin'));
      }
      await t.click(t.q('options-action-button-go'));
    }
    /** Four cards of one face: any two match. */
    async function startSameFace(t: Harness) {
      await t.skipSplash();
      await t.click(t.q('options-action-button-reset'));
      await t.click(t.q('options-theme-checkbox-dance'));
      await t.click(t.q('options-player-checkbox-kira'));
      await t.click(t.q('options-toggle-checkbox-fill'));
      await t.click(t.q('options-action-button-go'));
    }
    const advance = async (t: Harness, ms: number) => {
      await vi.advanceTimersByTimeAsync(ms);
      await t.settle();
    };
    // Reads the faked Date, which starts at BEFORE and advances only with the fake timers.
    const ticking: Provider = { provide: Clock, useValue: { now: () => new Date() } };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(BEFORE);
    });

    it('deals exactly the card count with one shared back that names no face (AC1, R30)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-action-button-go'));
      expect(t.q('board-grid-root-live')).not.toBeNull();
      expect(t.cards()).toHaveLength(20);
      for (const [i, card] of t.cards().entries()) {
        expect(card.getAttribute('aria-label')).toBe(`Card ${i + 1}, face down`);
        expect(card.getAttribute('data-state')).toBe('down');
        expect(card.querySelector('.back')?.textContent?.trim()).toBe('');
        expect(card.querySelector('.back img')?.getAttribute('src')).toMatch(/brand\/logo\.svg$/);
      }
    });

    it('renders cards as native, focusable buttons in grid order (AC4)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-action-button-go'));
      for (const card of t.cards()) {
        expect(card.tagName).toBe('BUTTON');
        expect(card.disabled).toBe(false);
        expect(card.hasAttribute('tabindex')).toBe(false);
      }
      expect(t.cards().map((card) => card.getAttribute('data-testid'))).toEqual(
        t.cards().map((_, i) => `board-card-button-${i}`),
      );
    });

    it('puts the header content in the banner landmark and the table in main (D2)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-action-button-go'));
      const header = t.root.querySelector('header[data-testid="header-bar-root"]');
      expect(header?.querySelector('h1')).not.toBeNull();
      expect(header?.querySelector('[data-testid="header-action-button-restart"]')).not.toBeNull();
      expect(t.root.querySelector('main [data-testid="board-grid-root-live"]')).not.toBeNull();
    });

    it('flips one card, then opens the reveal with focus on its first card (AC5-AC7)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t);
      expect(t.cards().map((card) => card.getAttribute('data-theme'))).toEqual([
        'dance',
        'dance',
        'snowboard',
        'snowboard',
      ]);

      await t.tap(0);
      expect(t.card(0)?.getAttribute('data-state')).toBe('up');
      expect(t.card(0)?.getAttribute('aria-label')).toBe('Kira: Dance');
      expect(t.q('header-player-block-kira-attempts')?.textContent).toBe('0');
      expect(t.q('reveal-overlay-root-mismatch')).toBeNull();

      await t.tap(2);
      expect(t.q('header-player-block-kira-attempts')?.textContent).toBe('1');
      expect(t.q('reveal-overlay-root-mismatch')).toBeNull();
      await advance(t, FLIP_MS);

      const reveal = t.q('reveal-overlay-root-mismatch');
      expect(reveal?.getAttribute('role')).toBe('dialog');
      expect(reveal?.getAttribute('aria-modal')).toBe('true');
      expect(t.q('reveal-card-button-1')?.getAttribute('aria-label')).toBe('Kira: Dance');
      expect(t.q('reveal-card-button-2')?.getAttribute('aria-label')).toBe('Kira: Snowboard');
      expect(t.q('reveal-hint-text')?.textContent).toBe('Tap a card to continue');
      expect(reveal?.querySelector('h2')?.textContent).toBe('Not a match');
      expect(document.activeElement).toBe(t.q('reveal-card-button-1'));
    });

    it('keeps Tab inside the two reveal cards (AC7, DS-026)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t);
      await t.tap(0);
      await t.tap(2);
      await advance(t, FLIP_MS);
      const [one, two] = [t.q('reveal-card-button-1')!, t.q('reveal-card-button-2')!];
      two.focus();
      await t.press(two, { key: 'Tab' });
      expect(document.activeElement).toBe(one);
      await t.press(one, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(two);
    });

    it('ignores the scrim, dismisses a mismatch once and returns focus to the card (AC9)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t, true);
      await t.tap(0);
      await t.tap(2);
      await advance(t, FLIP_MS);

      await t.click(t.q('reveal-overlay-root-mismatch'));
      expect(t.q('reveal-overlay-root-mismatch')).not.toBeNull();

      await t.click(t.q('reveal-card-button-2'));
      expect(t.q('reveal-overlay-root-mismatch')).toBeNull();
      expect(t.cards().map((card) => card.getAttribute('data-state'))).toEqual([
        'down',
        'down',
        'down',
        'down',
      ]);
      // Calvin went first on the 0.9 roll, so the turn passes to Kira.
      expect(t.q('header-player-block-kira')?.getAttribute('data-state')).toBe('active');
      expect(t.q('header-player-block-calvin')?.getAttribute('data-state')).toBe('idle');
      expect(document.activeElement).toBe(t.card(2));
    });

    it('dismisses on Enter or Space when focus is not on a button, never twice from a button (OBS-012)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t, true);
      await t.tap(0);
      await t.tap(2);
      await advance(t, FLIP_MS);

      // A key press whose target is a card button is left to the button's own activation.
      await t.press(t.q('reveal-card-button-1'), { key: 'Enter' });
      expect(t.q('reveal-overlay-root-mismatch')).not.toBeNull();

      // A press on the scrim keeps focus inside the dialog.
      const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      t.q('reveal-overlay-root-mismatch')?.dispatchEvent(press);
      expect(press.defaultPrevented).toBe(true);

      (document.activeElement as HTMLElement).blur();
      await t.press(document.body, { key: ' ' });
      expect(t.q('reveal-overlay-root-mismatch')).toBeNull();
      expect(t.q('header-player-block-kira')?.getAttribute('data-state')).toBe('active');

      await t.press(document.body, { key: 'Enter' });
      expect(t.q('header-player-block-kira')?.getAttribute('data-state')).toBe('active');
    });

    it('announces Match!, closes on its own and leaves an empty slot (AC8)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t);
      await t.tap(0);
      await t.tap(1);
      await advance(t, FLIP_MS);

      const reveal = t.q('reveal-overlay-root-match');
      expect(reveal?.querySelector('h2')?.textContent).toBe('Match!');
      expect(t.q('reveal-hint-text')?.textContent).toBe('');
      await t.click(t.q('reveal-card-button-1'));
      expect(t.q('reveal-overlay-root-match')).not.toBeNull();

      await advance(t, MATCH_PAUSE_MS);
      expect(t.q('reveal-overlay-root-match')).toBeNull();
      expect(t.cards()).toHaveLength(4);
      expect(t.card(0)?.getAttribute('data-state')).toBe('gone');
      expect(t.card(0)?.disabled).toBe(true);
      expect(t.card(1)?.getAttribute('data-state')).toBe('gone');
      expect(t.card(2)?.getAttribute('data-state')).toBe('down');
      expect(t.q('header-player-block-kira-pairs')?.textContent).toBe('1');
      expect(t.q('header-player-block-kira-attempts')?.textContent).toBe('1');
    });

    it('Show All peeks every remaining card for 3 s and costs one attempt (AC11)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t);
      await t.click(t.q('header-action-button-show-all'));
      expect(t.cards().map((card) => card.getAttribute('data-state'))).toEqual([
        'peeked',
        'peeked',
        'peeked',
        'peeked',
      ]);
      expect(t.q('header-player-block-kira-attempts')?.textContent).toBe('1');
      expect(t.q<HTMLButtonElement>('header-action-button-show-all')?.disabled).toBe(true);
      expect(t.q<HTMLButtonElement>('header-action-button-restart')?.disabled).toBe(true);
      expect(t.q<HTMLButtonElement>('header-action-button-new-game')?.disabled).toBe(true);

      await advance(t, SHOW_ALL_MS);
      expect(t.cards().map((card) => card.getAttribute('data-state'))).toEqual([
        'down',
        'down',
        'down',
        'down',
      ]);
      expect(t.q<HTMLButtonElement>('header-action-button-new-game')?.disabled).toBe(false);
    });

    it('shows 0:00, not time since 1970, before the first game is dealt', async () => {
      const t = await setup(BEFORE, 0.9, [ticking]);
      await t.skipSplash();
      expect(t.q('header-timer-value')?.textContent).toBe('0:00');
    });

    it('runs the single-player timer and pauses it under the popup (AC12, AC17)', async () => {
      const t = await setup(BEFORE, 0.9, [ticking]);
      await startTwoPairs(t);
      expect(t.q('header-timer-value')?.textContent).toBe('0:00');
      await advance(t, 5000);
      expect(t.q('header-timer-value')?.textContent).toBe('0:05');

      await t.click(t.q('header-action-button-new-game'));
      expect(t.q('header-timer-value')?.getAttribute('data-state')).toBe('paused');
      await advance(t, 20_000);
      expect(t.q('header-timer-value')?.textContent).toBe('0:05');
      await t.click(t.q('options-dialog-close'));
      expect(t.q('header-timer-value')?.getAttribute('data-state')).toBe('running');
      await advance(t, 2000);
      expect(t.q('header-timer-value')?.textContent).toBe('0:07');
    });

    it('shows no timer in two-player and highlights the active player (AC12)', async () => {
      const t = await setup(BEFORE);
      await startTwoPairs(t, true);
      expect(t.q('header-timer-value')).toBeNull();
      expect(t.q('header-player-block-calvin')?.getAttribute('data-state')).toBe('active');
    });

    describe('end screen', () => {
      async function finish(t: Harness) {
        await startSameFace(t);
        await t.tap(0);
        await t.tap(1);
        await advance(t, FLIP_MS + MATCH_PAUSE_MS);
        await t.tap(2);
        await t.tap(3);
        await advance(t, FLIP_MS + MATCH_PAUSE_MS + END_DELAY_MS);
      }

      it('shows the single-player result without a birthday message (AC13)', async () => {
        const t = await setup(BEFORE, 0.9, [ticking]);
        await finish(t);
        const end = t.q('end-dialog-root-single');
        expect(end?.getAttribute('role')).toBe('dialog');
        expect(end?.querySelector('h2')?.textContent).toBe('Well done, Kira!');
        expect(t.q('end-stat-tile-1')?.textContent).toContain('2');
        expect(t.q('end-stat-tile-1')?.textContent).toContain('attempts');
        expect(t.q('end-stat-tile-2')?.textContent).toMatch(/\d:\d\d/);
        expect(end?.textContent?.toLowerCase()).not.toContain('birthday');
        expect(t.q('end-confetti-root')).not.toBeNull();
        expect(t.cards().every((card) => card.getAttribute('data-state') === 'gone')).toBe(true);
        expect(document.activeElement).toBe(t.q('end-action-button-restart'));
      });

      it('notes a new best, then the kept best after a worse game (R36, AC8, AC9)', async () => {
        const t = await setup(BEFORE, 0.9, [ticking]);
        await finish(t);
        expect(t.q('end-best-note')?.textContent?.trim()).toBe('New best for Kira on this board!');

        await t.click(t.q('end-action-button-restart'));
        await t.click(t.q('header-action-button-show-all'));
        await advance(t, SHOW_ALL_MS);
        await t.tap(0);
        await t.tap(1);
        await advance(t, FLIP_MS + MATCH_PAUSE_MS);
        await t.tap(2);
        await t.tap(3);
        await advance(t, FLIP_MS + MATCH_PAUSE_MS + END_DELAY_MS);
        expect(t.q('end-stat-tile-1')?.textContent).toContain('3');
        expect(t.q('end-best-note')?.textContent?.trim()).toBe(
          "Kira's best on this board: 2 attempts",
        );
      });

      it('shows no best note after a two-player game (AC12)', async () => {
        const device = new MemoryStorage();
        const t = await setup(BEFORE, 0.9, [onDevice(device)]);
        await t.skipSplash();
        await t.click(t.q('options-action-button-reset'));
        await t.click(t.q('options-theme-checkbox-dance'));
        await t.click(t.q('options-player-checkbox-kira'));
        await t.click(t.q('options-player-checkbox-calvin'));
        await t.click(t.q('options-toggle-checkbox-fill'));
        await t.click(t.q('options-action-button-go'));
        await t.tap(0);
        await t.tap(1);
        await advance(t, FLIP_MS + MATCH_PAUSE_MS);
        await t.tap(2);
        await t.tap(3);
        await advance(t, FLIP_MS + MATCH_PAUSE_MS + END_DELAY_MS);
        expect(t.q('end-dialog-root-winner')).not.toBeNull();
        expect(t.q('end-best-note')).toBeNull();
        expect(device.getItem(STORAGE_KEYS.best)).toBeNull();
      });

      it('omits the confetti under reduced motion (AC19)', async () => {
        const t = await setup(BEFORE, 0.9, [
          { provide: ReducedMotion, useValue: { reduced: signal(true) } },
        ]);
        await finish(t);
        expect(t.q('end-dialog-root-single')).not.toBeNull();
        expect(t.q('end-confetti-root')).toBeNull();
      });

      it('Restart deals a fresh game with the same options and no popup (AC14)', async () => {
        const t = await setup(BEFORE);
        await finish(t);
        await t.click(t.q('end-action-button-restart'));
        expect(t.q('end-dialog-root-single')).toBeNull();
        expect(t.q('options-dialog-root')).toBeNull();
        expect(t.q('confirm-dialog-root')).toBeNull();
        expect(t.cards()).toHaveLength(4);
        expect(t.cards().every((card) => card.getAttribute('data-state') === 'down')).toBe(true);
        expect(t.q('header-player-block-kira-attempts')?.textContent).toBe('0');
        expect(t.q('header-timer-value')?.textContent).toBe('0:00');
      });

      it('New Game opens the popup over it and Close returns to the same end screen (AC14)', async () => {
        const t = await setup(BEFORE);
        await finish(t);
        const newGame = t.q<HTMLButtonElement>('end-action-button-new-game')!;
        newGame.focus();
        await t.click(newGame);
        expect(t.q('options-dialog-root')).not.toBeNull();
        expect(t.q('end-dialog-root-single')?.hasAttribute('hidden')).toBe(true);
        expect(t.q<HTMLInputElement>('options-theme-checkbox-dance')?.checked).toBe(true);
        expect(t.q<HTMLInputElement>('options-theme-checkbox-snowboard')?.checked).toBe(false);

        await t.click(t.q('options-dialog-close'));
        await t.settle();
        expect(t.q('options-dialog-root')).toBeNull();
        expect(t.q('end-dialog-root-single')?.hasAttribute('hidden')).toBe(false);
        expect(t.q('end-dialog-root-single')?.hasAttribute('inert')).toBe(false);
        expect(document.activeElement).toBe(newGame);
      });
    });

    describe('Start over? (R25)', () => {
      it('Restart asks once a card is flipped; Keep playing and Escape change nothing (AC15)', async () => {
        const t = await setup(BEFORE);
        await startTwoPairs(t);
        const restart = t.q<HTMLButtonElement>('header-action-button-restart')!;
        restart.focus();
        await t.click(restart);
        expect(t.q('confirm-dialog-root')).toBeNull();

        await t.tap(0);
        restart.focus();
        await t.click(restart);
        const confirm = t.q('confirm-dialog-root');
        expect(confirm?.getAttribute('role')).toBe('alertdialog');
        expect(confirm?.querySelector('h2')?.textContent).toBe('Start over?');
        expect(t.q('confirm-action-button-cancel')?.textContent?.trim()).toBe('Keep playing');
        expect(document.activeElement).toBe(t.q('confirm-action-button-cancel'));

        await t.press(confirm, { key: 'Escape' });
        await t.settle();
        expect(t.q('confirm-dialog-root')).toBeNull();
        expect(t.card(0)?.getAttribute('data-state')).toBe('up');
        expect(document.activeElement).toBe(restart);
      });

      it('confirming Restart deals a fresh game with the same options (AC15)', async () => {
        const t = await setup(BEFORE);
        await startTwoPairs(t);
        await t.tap(0);
        await t.click(t.q('header-action-button-restart'));
        await t.click(t.q('confirm-action-button-confirm'));
        expect(t.q('confirm-dialog-root')).toBeNull();
        expect(t.cards()).toHaveLength(4);
        expect(t.cards().every((card) => card.getAttribute('data-state') === 'down')).toBe(true);
      });

      it('Go over a game in progress asks; Back to options keeps the draft and game (AC16)', async () => {
        const t = await setup(BEFORE);
        await startTwoPairs(t);
        await t.tap(0);
        const newGame = t.q<HTMLButtonElement>('header-action-button-new-game')!;
        newGame.focus();
        await t.click(newGame);
        await t.click(t.q('options-toggle-checkbox-variants'));
        expect(t.q('confirm-dialog-root')).toBeNull();

        const go = t.q<HTMLButtonElement>('options-action-button-go')!;
        go.focus();
        await t.click(go);
        expect(t.q('confirm-action-button-cancel')?.textContent?.trim()).toBe('Back to options');
        expect(t.q('options-dialog-root')?.hasAttribute('inert')).toBe(true);

        await t.click(t.q('confirm-action-button-cancel'));
        await t.settle();
        expect(t.q('confirm-dialog-root')).toBeNull();
        expect(t.q('options-dialog-root')?.hasAttribute('inert')).toBe(false);
        expect(t.q<HTMLInputElement>('options-toggle-checkbox-variants')?.checked).toBe(true);
        expect(t.card(0)?.getAttribute('data-state')).toBe('up');
        expect(document.activeElement).toBe(go);
      });

      it('confirming Go deals the draft options (AC16)', async () => {
        const t = await setup(BEFORE);
        await startTwoPairs(t);
        await t.tap(0);
        await t.click(t.q('header-action-button-new-game'));
        await t.click(t.q('options-toggle-checkbox-variants'));
        await t.click(t.q('options-action-button-go'));
        await t.click(t.q('confirm-action-button-confirm'));
        expect(t.q('options-dialog-root')).toBeNull();
        expect(t.q('confirm-dialog-root')).toBeNull();
        expect(t.cards()).toHaveLength(8);
      });

      it('New Game never asks, and Close returns to the same face-up card (AC17)', async () => {
        const t = await setup(BEFORE);
        await startTwoPairs(t);
        await t.tap(0);
        const newGame = t.q<HTMLButtonElement>('header-action-button-new-game')!;
        newGame.focus();
        await t.click(newGame);
        expect(t.q('confirm-dialog-root')).toBeNull();
        expect(t.q('options-dialog-root')).not.toBeNull();
        expect(t.card(0)?.getAttribute('data-state')).toBe('up');

        await t.click(t.q('options-dialog-close'));
        await t.settle();
        expect(t.card(0)?.getAttribute('data-state')).toBe('up');
        expect(document.activeElement).toBe(newGame);
      });
    });
  });

  describe('header (R19, R20, R4)', () => {
    it('shows the default Kira alone with a timer, whatever the random roll or date', async () => {
      for (const now of [BEFORE, AFTER]) {
        const t = await setup(now, 0.99);
        await t.skipSplash();
        await t.click(t.q('options-action-button-go'));
        expect(t.q('header-player-block-kira')).not.toBeNull();
        expect(t.q('header-player-block-calvin')).toBeNull();
        expect(t.q('header-timer-value')?.textContent).toBe('0:00');
        TestBed.resetTestingModule();
      }
    });

    it('shows Calvin alone when only Calvin is checked', async () => {
      const t = await setup(BEFORE, 0);
      await t.skipSplash();
      await t.click(t.q('options-player-checkbox-kira'));
      await t.click(t.q('options-player-checkbox-calvin'));
      await t.click(t.q('options-action-button-go'));
      expect(t.q('header-player-block-calvin')).not.toBeNull();
      expect(t.q('header-player-block-kira')).toBeNull();
    });

    it('lists Kira then Calvin in two-player with the rolled first player active, no timer', async () => {
      const t = await setup(BEFORE, 0);
      await t.skipSplash();
      await t.click(t.q('options-player-checkbox-calvin'));
      await t.click(t.q('options-action-button-go'));
      const blocks = Array.from(t.root.querySelectorAll('.player')).map((el) =>
        el.getAttribute('data-child'),
      );
      expect(blocks).toEqual(['kira', 'calvin']);
      expect(t.q('header-player-block-kira')?.getAttribute('data-state')).toBe('active');
      expect(t.q('header-player-block-kira')?.getAttribute('aria-current')).toBe('true');
      expect(t.q('header-player-block-calvin')?.getAttribute('data-state')).toBe('idle');
      expect(t.q('header-player-block-calvin')?.hasAttribute('aria-current')).toBe(false);
      expect(t.q('header-timer-value')).toBeNull();
    });

    it('disables Show All and Restart until a game exists and toggles Sound', async () => {
      const t = await setup(BEFORE);
      expect(t.q<HTMLButtonElement>('header-action-button-show-all')?.disabled).toBe(true);
      expect(t.q<HTMLButtonElement>('header-action-button-restart')?.disabled).toBe(true);
      const sound = t.q('header-action-button-sound');
      expect(sound?.getAttribute('aria-pressed')).toBe('true');
      expect(sound?.getAttribute('data-state')).toBe('on');
      await t.click(sound);
      expect(t.q('header-action-button-sound')).toBe(sound);
      expect(sound?.getAttribute('aria-pressed')).toBe('false');
      expect(sound?.getAttribute('data-state')).toBe('off');
      expect(sound?.textContent?.trim()).toBe('Sound off');
    });

    it('keeps Sound off for the next visit (R31, AC13)', async () => {
      const device = new MemoryStorage();
      const first = await setup(BEFORE, 0.9, [onDevice(device)]);
      await first.click(first.q('header-action-button-sound'));
      expect(device.getItem(STORAGE_KEYS.sound)).toBe('false');
      first.fixture.destroy();
      TestBed.resetTestingModule();

      const next = await setup(BEFORE, 0.9, [onDevice(device)]);
      const sound = next.q('header-action-button-sound');
      expect(sound?.getAttribute('aria-pressed')).toBe('false');
      expect(sound?.getAttribute('data-state')).toBe('off');
      await next.click(sound);
      expect(sound?.getAttribute('aria-pressed')).toBe('true');
      expect(device.getItem(STORAGE_KEYS.sound)).toBe('true');
    });
  });
});
