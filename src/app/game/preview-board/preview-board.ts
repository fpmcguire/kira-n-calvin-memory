import { Component, computed, input } from '@angular/core';

/** Face-down preview of the table (DS-007). Not the dealt deck; no interaction. */
@Component({
  selector: 'app-preview-board',
  host: {
    role: 'group',
    'data-testid': 'board-grid-root-preview',
    '[attr.aria-label]': 'label()',
  },
  styleUrl: './preview-board.scss',
  templateUrl: './preview-board.html',
})
export class PreviewBoard {
  readonly count = input.required<number>();

  protected readonly cards = computed(() => Array.from({ length: this.count() }, (_, i) => i));
  protected readonly label = computed(() => {
    const count = this.count();
    return count === 0 ? 'Table: no cards' : `Table preview: ${count} cards face down`;
  });
}
