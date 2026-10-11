import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FacePresentation } from '../card-face/face-presentation';
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

const FACE: FacePresentation = {
  child: 'kira',
  childName: 'Kira',
  themeId: 'dance',
  themeName: 'Dance',
  variant: 'base',
  difference: null,
  hue: 350,
  art: 'content/kira-calvin/art/dance.svg',
  pattern: 'none',
  mirrored: false,
  badge: 'none',
  label: 'Kira: Dance',
};

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
  template: `<app-board [cards]="cards()" (selected)="picked.push($event)" />`,
})
class Host {
  readonly cards = signal<readonly BoardCard[]>([]);
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

  it('hides a face-down face from assistive tech and shows it once the card is up (AC1)', async () => {
    const t = await render(cards(3, { 0: 'up', 2: 'gone' }));
    const fronts = () => Array.from(t.root.querySelectorAll<HTMLElement>('.front'));
    expect(fronts().map((front) => front.getAttribute('aria-hidden'))).toEqual([
      null,
      'true',
      'true',
    ]);
    expect(fronts().map((front) => getComputedStyle(front).visibility)).toEqual([
      'visible',
      'hidden',
      'hidden',
    ]);
    expect(fronts()[0].textContent).toContain('Kira');
    expect(fronts()[0].textContent).toContain('Dance');

    t.fixture.componentInstance.cards.set(cards(3, { 1: 'up', 2: 'peeked' }));
    await t.settle();
    expect(fronts().map((front) => front.getAttribute('aria-hidden'))).toEqual([
      'true',
      null,
      null,
    ]);
    expect(fronts().map((front) => getComputedStyle(front).visibility)).toEqual([
      'hidden',
      'visible',
      'visible',
    ]);
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
