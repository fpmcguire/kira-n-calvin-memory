import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { facePresentation } from '../../../testing/edition-fixtures';
import { FacePresentation } from '../card-face/face-presentation';
import { ReducedMotion } from '../reduced-motion';
import { FACE_EXIT_MS } from '../timings';
import { Board, BoardCard } from './board';
import { fitBoard } from './fit-board';

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  disconnected = false;
  constructor(readonly callback: () => void) {
    FakeResizeObserver.instances.push(this);
  }
  observe(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
}

const FACE: FacePresentation = facePresentation('dance');

function cards(count: number, states: Partial<Record<number, BoardCard['state']>> = {}) {
  return Array.from({ length: count }, (_, i): BoardCard => ({
    id: `card-${i}`,
    state: states[i] ?? 'down',
    label: `Card ${i + 1}, face down`,
    face: FACE,
  }));
}

@Component({
  imports: [Board],
  template: `<app-board [cards]="cards()" [deal]="deal()" (selected)="picked.push($event)" />`,
})
class Host {
  readonly cards = signal<readonly BoardCard[]>([]);
  readonly deal = signal(0);
  readonly picked: number[] = [];
}

describe('Board', () => {
  const size = { width: 0, height: 0 };

  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => size.width,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => size.height,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
    Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
  });

  async function render(initial: readonly BoardCard[]) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.cards.set(initial);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const grid = () => root.querySelector<HTMLElement>('.grid')!;
    const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('button.card'));
    return { fixture, root, settle, grid, buttons };
  }

  it('renders one button per card in source order with its state and name', async () => {
    const t = await render(cards(4, { 1: 'up', 2: 'gone' }));
    expect(t.buttons().map((b) => b.getAttribute('data-card-id'))).toEqual([
      'card-0',
      'card-1',
      'card-2',
      'card-3',
    ]);
    expect(t.buttons().map((b) => b.getAttribute('data-state'))).toEqual([
      'down',
      'up',
      'gone',
      'down',
    ]);
    expect(t.buttons().map((b) => b.disabled)).toEqual([false, false, true, false]);
    expect(t.buttons()[0].getAttribute('aria-label')).toBe('Card 1, face down');
    expect(t.root.querySelector('app-board')?.getAttribute('aria-label')).toBe(
      'Table: 3 of 4 cards left',
    );
  });

  it('draws the same K-n-C logo as the back of every card, with no face text (R30)', async () => {
    const t = await render(cards(2));
    for (const back of Array.from(t.root.querySelectorAll('.back'))) {
      expect(back.textContent?.trim()).toBe('');
      expect(back.querySelector('img')?.getAttribute('src')).toMatch(
        /content\/kira-calvin\/brand\/logo\.svg$/,
      );
    }
  });

  describe('front subtree (AC6, AC7)', () => {
    const fronts = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('.front'));
    const alternates = (list: BoardCard[]) =>
      list.map((card) => ({ ...card, face: facePresentation('dance', 'alternate') }));

    it('instantiates a front only for a shown card; down and gone cards have none', async () => {
      const t = await render(cards(4, { 0: 'up', 2: 'gone', 3: 'peeked' }));
      const owners = t.buttons().map((button) => button.querySelector('.front') !== null);
      expect(owners).toEqual([true, false, false, true]);
      expect(fronts(t.root)).toHaveLength(2);
      expect(fronts(t.root)[0].getAttribute('aria-hidden')).toBeNull();
      expect(fronts(t.root)[0].textContent).toContain('Kira');
      expect(fronts(t.root)[0].textContent).toContain('Dance');
    });

    it('leaves no SVG, medallion, slot, treatment or cue hook on down and gone cards', async () => {
      const t = await render(alternates(cards(4, { 1: 'up', 2: 'gone' })));
      for (const index of [0, 2, 3]) {
        const button = t.buttons()[index];
        expect(button.querySelector('app-card-face'), `card ${index}`).toBeNull();
        expect(button.querySelector('svg'), `card ${index}`).toBeNull();
        expect(button.querySelector('.medallion'), `card ${index}`).toBeNull();
        expect(
          button.querySelector('[data-variant-slot], [data-treatment-id], [data-cue-present]'),
        ).toBeNull();
        expect(button.querySelector('.front')).toBeNull();
        expect(button.textContent).not.toContain('Dance');
      }
      const shown = t.buttons()[1].querySelector('app-card-face')!;
      expect(shown.getAttribute('data-variant-slot')).toBe('outfit');
      expect(shown.getAttribute('data-treatment-id')).toBe('outfit-deep-teal');
      expect(shown.getAttribute('data-cue-present')).toBe('true');
    });

    it('keeps the card button hooks and drops data-difference entirely', async () => {
      const t = await render(alternates(cards(2, { 0: 'up' })));
      const [first, second] = t.buttons();
      expect(first.dataset['testid']).toBe('board-card-button-0');
      expect(first.dataset['state']).toBe('up');
      expect(first.dataset['variant']).toBe('alternate');
      expect(second.dataset['state']).toBe('down');
      for (const button of t.buttons()) {
        expect(button.hasAttribute('data-difference')).toBe(false);
        expect(button.hasAttribute('data-variant-slot')).toBe(false);
      }
    });

    it('names face-down and gone cards without any face information', async () => {
      const t = await render(cards(3, { 2: 'gone' }));
      expect(t.buttons().map((button) => button.getAttribute('aria-label'))).toEqual([
        'Card 1, face down',
        'Card 2, face down',
        'Card 3, face down',
      ]);
      expect(t.root.querySelector('.back')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('gives the shared back no face presentation inputs', async () => {
      const t = await render(alternates(cards(2, { 0: 'up' })));
      const backs = Array.from(t.root.querySelectorAll('app-card-back'));
      expect(backs).toHaveLength(2);
      for (const back of backs) {
        expect(back.outerHTML).not.toMatch(/dance|alternate|outfit|variant|cue|treatment/i);
      }
      expect(backs[0].innerHTML).toBe(backs[1].innerHTML);
    });

    it('keeps the front through the flip-down, then removes it (approved transition)', async () => {
      vi.useFakeTimers();
      try {
        const t = await render(cards(2, { 0: 'up' }));
        t.fixture.componentInstance.cards.set(cards(2));
        await t.settle();
        expect(t.buttons()[0].dataset['state']).toBe('down');
        expect(t.buttons()[0].querySelector('.front')?.getAttribute('aria-hidden')).toBe('true');

        vi.advanceTimersByTime(FACE_EXIT_MS - 1);
        await t.settle();
        expect(t.buttons()[0].querySelector('.front')).not.toBeNull();

        vi.advanceTimersByTime(1);
        await t.settle();
        expect(t.buttons()[0].querySelector('.front')).toBeNull();
        expect(t.buttons()[0].querySelector('app-card-face')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps a matched card through its fade, then removes the front', async () => {
      vi.useFakeTimers();
      try {
        const t = await render(cards(2, { 0: 'up', 1: 'up' }));
        t.fixture.componentInstance.cards.set(cards(2, { 0: 'gone', 1: 'gone' }));
        await t.settle();
        expect(t.root.querySelectorAll('.front')).toHaveLength(2);
        vi.advanceTimersByTime(FACE_EXIT_MS);
        await t.settle();
        expect(t.root.querySelectorAll('.front')).toHaveLength(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not retain a card that turns up again before the transition ends', async () => {
      vi.useFakeTimers();
      try {
        const t = await render(cards(1, { 0: 'up' }));
        t.fixture.componentInstance.cards.set(cards(1));
        await t.settle();
        t.fixture.componentInstance.cards.set(cards(1, { 0: 'up' }));
        await t.settle();
        vi.advanceTimersByTime(FACE_EXIT_MS * 2);
        await t.settle();
        expect(t.buttons()[0].querySelector('.front')).not.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('drops retained fronts when a new game is dealt', async () => {
      vi.useFakeTimers();
      try {
        const t = await render(cards(2, { 0: 'up' }));
        t.fixture.componentInstance.cards.set(cards(2));
        t.fixture.componentInstance.deal.set(1);
        await t.settle();
        expect(t.root.querySelectorAll('.front')).toHaveLength(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('removes the front immediately under reduced motion', async () => {
      TestBed.configureTestingModule({
        providers: [{ provide: ReducedMotion, useValue: { reduced: signal(true) } }],
      });
      const t = await render(cards(2, { 0: 'up' }));
      expect(t.root.querySelectorAll('.front')).toHaveLength(1);
      t.fixture.componentInstance.cards.set(cards(2));
      await t.settle();
      expect(t.root.querySelectorAll('.front')).toHaveLength(0);
    });
  });

  it('fits to the measured table and re-wraps on resize without reordering (AC2, AC3)', async () => {
    size.width = 358;
    size.height = 520;
    const t = await render(cards(20, { 3: 'up', 5: 'gone' }));
    const phone = fitBoard(20, 358, 520);
    expect(t.grid().style.gridTemplateColumns).toBe(
      `repeat(${phone.columns}, ${phone.cardWidth}px)`,
    );
    const before = t.buttons().map((b) => [b.dataset['cardId'], b.dataset['state']]);

    size.width = 992;
    size.height = 560;
    FakeResizeObserver.instances[0].callback();
    await t.settle();
    const tablet = fitBoard(20, 992, 560);
    expect(t.grid().style.gridTemplateColumns).toBe(
      `repeat(${tablet.columns}, ${tablet.cardWidth}px)`,
    );
    expect(tablet.columns).not.toBe(phone.columns);
    expect(t.buttons().map((b) => [b.dataset['cardId'], b.dataset['state']])).toEqual(before);
  });

  it('emits the grid index of a tapped card, including while states change', async () => {
    const t = await render(cards(4));
    t.buttons()[2].click();
    t.buttons()[0].click();
    expect(t.fixture.componentInstance.picked).toEqual([2, 0]);
  });

  it('stops observing the table when destroyed', async () => {
    const t = await render(cards(4));
    expect(FakeResizeObserver.instances).toHaveLength(1);
    t.fixture.destroy();
    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
  });
});
