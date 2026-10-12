import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CardBack } from '../card-back/card-back';
import { FacePresentation } from '../card-face/face-presentation';
import { CardFace } from '../card-face/card-face';
import { ReducedMotion } from '../reduced-motion';
import { FACE_EXIT_MS } from '../timings';
import { fitBoard } from './fit-board';

/** A card as the board draws it. `peeked` is Show All; a gone card keeps its empty slot (R16). */
export interface BoardCard {
  readonly id: string;
  readonly state: 'down' | 'up' | 'peeked' | 'gone';
  /** Accessible name: "Card N, face down" or "{Child}: {Activity}" (design-spec 2.1). */
  readonly label: string;
  readonly face: FacePresentation;
}

/**
 * Live board (DS-007, DS-008): the dealt cards in source order, fitted to the measured
 * table and left-aligned in the last row. Selection is emitted; the game decides
 * whether the tap counts, so locked input needs no visual change.
 */
@Component({
  selector: 'app-board',
  imports: [CardBack, CardFace],
  host: {
    role: 'group',
    'data-testid': 'board-grid-root-live',
    '[attr.aria-label]': 'label()',
  },
  styleUrl: './board.scss',
  templateUrl: './board.html',
})
export class Board {
  readonly cards = input.required<readonly BoardCard[]>();
  /** Changes with every deal, so a retained face from the previous game is never carried over. */
  readonly deal = input(0);
  readonly selected = output<number>();

  private readonly table = viewChild.required<ElementRef<HTMLElement>>('table');
  private readonly size = signal({ width: 0, height: 0 });
  private readonly reducedMotion = inject(ReducedMotion);

  /**
   * Face-down or gone cards whose front subtree is still finishing its approved flip or
   * fade. Every other down or gone card has no front subtree at all (AC6).
   */
  protected readonly retained = signal<ReadonlySet<string>>(new Set());
  private shownBefore: ReadonlySet<string> = new Set();
  private lastDeal = 0;
  private readonly exits = new Map<string, ReturnType<typeof setTimeout>>();

  protected readonly layout = computed(() => {
    const { width, height } = this.size();
    return fitBoard(this.cards().length, width, height);
  });
  protected readonly columns = computed(
    () => `repeat(${this.layout().columns}, ${this.layout().cardWidth}px)`,
  );
  protected readonly label = computed(() => {
    const remaining = this.cards().filter((card) => card.state !== 'gone').length;
    return `Table: ${remaining} of ${this.cards().length} cards left`;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    effect(() => {
      const shown = new Set(
        this.cards()
          .filter((card) => card.state === 'up' || card.state === 'peeked')
          .map((card) => card.id),
      );
      const deal = this.deal();
      untracked(() => this.trackFronts(shown, deal));
    });
    destroyRef.onDestroy(() => this.clearExits());
    // The table is measured, not the viewport, so header wrapping and rotation both re-fit (OBS-003).
    afterNextRender(() => {
      const element = this.table().nativeElement;
      const measure = () =>
        this.size.set({ width: element.clientWidth, height: element.clientHeight });
      measure();
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /**
   * Keeps a card's front subtree only while it is shown or leaving. Leaving ends when the
   * approved flip/fade has run, or at once under reduced motion, which has no transition.
   */
  private trackFronts(shownNow: ReadonlySet<string>, deal: number): void {
    if (deal !== this.lastDeal) {
      this.lastDeal = deal;
      this.shownBefore = new Set();
      this.clearExits();
      this.retained.set(new Set());
    }
    const retained = new Set(this.retained());
    for (const id of this.shownBefore) {
      if (!shownNow.has(id) && !this.reducedMotion.reduced()) {
        retained.add(id);
        clearTimeout(this.exits.get(id));
        this.exits.set(
          id,
          setTimeout(() => {
            this.exits.delete(id);
            this.retained.update((ids) => new Set([...ids].filter((other) => other !== id)));
          }, FACE_EXIT_MS),
        );
      }
    }
    for (const id of shownNow) {
      if (retained.delete(id)) {
        clearTimeout(this.exits.get(id));
        this.exits.delete(id);
      }
    }
    this.shownBefore = shownNow;
    this.retained.set(retained);
  }

  private clearExits(): void {
    for (const handle of this.exits.values()) {
      clearTimeout(handle);
    }
    this.exits.clear();
  }
}
