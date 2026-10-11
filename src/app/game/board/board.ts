import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CardBack } from '../card-back/card-back';
import { FacePresentation } from '../card-face/face-presentation';
import { CardFace } from '../card-face/card-face';
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
  readonly selected = output<number>();

  private readonly table = viewChild.required<ElementRef<HTMLElement>>('table');
  private readonly size = signal({ width: 0, height: 0 });

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
}
