import { TestBed } from '@angular/core/testing';
import { Clock } from '../clock';
import { Random } from '../random';
import { SPLASH_MS } from '../splash/splash';
import { Game } from './game';

const BEFORE = new Date('2026-10-10T18:00:00Z');
const AFTER = new Date('2026-10-11T06:00:00Z');

async function setup(now: Date, random = 0.9) {
  TestBed.configureTestingModule({
    providers: [
      { provide: Clock, useValue: { now: () => now } },
      { provide: Random, useValue: { next: () => random } },
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
  return { fixture, root, q, click, press, settle, skipSplash };
}

describe('Game shell', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the birthday splash before the cutoff and the generic splash after (R2, R3)', async () => {
    const before = await setup(BEFORE);
    expect(before.q('splash-screen-root-birthday')?.textContent).toContain('Happy Birthday Kira!');
    TestBed.resetTestingModule();
    const after = await setup(AFTER);
    expect(after.q('splash-screen-root-generic')?.textContent).toContain(
      'Kira-n-Calvin Memory Game',
    );
    expect(after.q('splash-screen-root-birthday')).toBeNull();
  });

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
    expect(document.activeElement).toBe(t.q('options-toggle-checkbox-two-players'));
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

    it('Reset clears every option and disables Go (R7, DS-010)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-variants'));
      await t.click(t.q('options-toggle-checkbox-fill'));
      await t.click(t.q('options-action-button-reset'));
      expect(t.q<HTMLInputElement>('options-toggle-checkbox-variants')?.checked).toBe(false);
      expect(t.q<HTMLInputElement>('options-toggle-checkbox-fill')?.checked).toBe(false);
      expect(t.q('options-fill-stepper-value')).toBeNull();
      expect(t.q<HTMLButtonElement>('options-action-button-go')?.disabled).toBe(true);
      expect(t.q('options-summary-text')?.textContent).toBe('Pick at least one theme');
      expect(t.q('board-grid-root-preview')?.children.length).toBe(0);
      expect(t.q('options-dialog-root')).not.toBeNull();
    });

    it('enables Go once a theme is checked, and the preview follows the draft (R7, DS-007)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-action-button-reset'));
      await t.click(t.q('options-theme-checkbox-dance'));
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
      const first = t.q('options-toggle-checkbox-two-players') as HTMLElement;
      const go = t.q('options-action-button-go') as HTMLElement;
      go.focus();
      await t.press(go, { key: 'Tab' });
      expect(document.activeElement).toBe(first);
      await t.press(first, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(go);
    });
  });

  describe('after Go', () => {
    it('applies the draft, closes the popup and shows the applied preview (DS-010)', async () => {
      const t = await setup(BEFORE);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-variants'));
      await t.click(t.q('options-action-button-go'));
      expect(t.q('options-dialog-root')).toBeNull();
      expect(t.q('board-grid-root-preview')?.children.length).toBe(40);
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
      expect(t.q('board-grid-root-preview')?.children.length).toBe(40);

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

  describe('header (R19, R20, R4)', () => {
    it('shows Kira alone with a timer before the cutoff, whatever the random roll', async () => {
      const t = await setup(BEFORE, 0.99);
      await t.skipSplash();
      await t.click(t.q('options-action-button-go'));
      expect(t.q('header-player-block-kira')).not.toBeNull();
      expect(t.q('header-player-block-calvin')).toBeNull();
      expect(t.q('header-timer-value')?.textContent).toBe('0:00');
    });

    it('shows a random single player after the cutoff', async () => {
      const t = await setup(AFTER, 0.99);
      await t.skipSplash();
      await t.click(t.q('options-action-button-go'));
      expect(t.q('header-player-block-calvin')).not.toBeNull();
      expect(t.q('header-player-block-kira')).toBeNull();
    });

    it('lists Kira then Calvin in two-player with Kira active before the cutoff, no timer', async () => {
      const t = await setup(BEFORE, 0.99);
      await t.skipSplash();
      await t.click(t.q('options-toggle-checkbox-two-players'));
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
    });
  });
});
