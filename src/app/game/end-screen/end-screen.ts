import { Component, computed, inject, input, output } from '@angular/core';
import { EDITION } from '../../content/edition';
import { BestOutcome } from '../../domain/best-score';
import { GameResult } from '../../domain/play';
import { ChildId } from '../../domain/types';
import { OverlayFocus } from '../overlay-focus';
import { ReducedMotion } from '../reduced-motion';

interface ConfettiPiece {
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly duration: number;
  readonly delay: number;
  readonly round: boolean;
  readonly color: string;
}

const PIECE_COUNT = 60;

/**
 * End screen (DS-016, R21, R22, R36): result, celebration and the two next steps. No
 * birthday message after the splash. Single-player shows the best-score note.
 */
@Component({
  selector: 'app-end-screen',
  hostDirectives: [OverlayFocus],
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'end-title',
    '[attr.data-testid]': '"end-dialog-root-" + view().variant',
  },
  styleUrl: './end-screen.scss',
  templateUrl: './end-screen.html',
})
export class EndScreen {
  private readonly edition = inject(EDITION);
  protected readonly motion = inject(ReducedMotion);

  readonly result = input.required<GameResult>();
  /** Formatted single-player time; ignored in two-player. */
  readonly time = input('0:00');
  /** Single-player best on this board (DS-016); ignored in two-player. */
  readonly best = input<BestOutcome | null>(null);
  readonly restart = output();
  readonly newGame = output();

  /**
   * Looping pieces (DS-017), laid out from the index so the effect is cheap,
   * bounded and identical in tests (OBS-002).
   */
  protected readonly pieces: readonly ConfettiPiece[] = Array.from(
    { length: PIECE_COUNT },
    (_, i) => ({
      left: (i * 37 + 11) % 100,
      width: 8 + ((i * 7) % 9),
      height: 12 + ((i * 5) % 11),
      duration: 2.6 + ((i * 13) % 25) / 10,
      delay: ((i * 17) % 20) / 10,
      round: i % 3 === 0,
      color: `oklch(0.75 0.15 ${this.edition.themes[i % this.edition.themes.length].hue})`,
    }),
  );

  protected readonly view = computed(() => {
    const result = this.result();
    const name = (id: ChildId) =>
      this.edition.children.find((child) => child.id === id)?.name ?? id;

    switch (result.kind) {
      case 'single':
        return {
          variant: 'single',
          child: result.player,
          title: `Well done, ${name(result.player)}!`,
          stats: [
            { value: String(result.attempts), label: 'attempts' },
            { value: this.time(), label: 'time' },
          ],
          note: '',
          best: this.bestNote(name(result.player)),
        };
      case 'winner':
        return {
          variant: 'winner',
          child: result.winner,
          title: `${name(result.winner)} wins!`,
          stats: this.pairStats(result.scores),
          note: result.decidedByTurns
            ? `Same pairs — ${name(result.winner)} took fewer turns (${result.scores[result.winner].attempts}).`
            : '',
          best: '',
        };
      case 'tie':
        return {
          variant: 'tie',
          child: null,
          title: "It's a tie!",
          stats: this.pairStats(result.scores),
          note: '',
          best: '',
        };
    }
  });

  private bestNote(player: string): string {
    const best = this.best();
    if (!best) {
      return '';
    }
    return best.kind === 'new'
      ? `New best for ${player} on this board!`
      : `${player}'s best on this board: ${best.best.attempts} attempts`;
  }

  private pairStats(scores: Readonly<Record<ChildId, { readonly pairs: number }>>) {
    return this.edition.children.map((child) => ({
      value: String(scores[child.id].pairs),
      label: `${child.name}'s pairs`,
    }));
  }
}
