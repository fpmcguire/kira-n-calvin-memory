import { Component, computed, input, output } from '@angular/core';
import { CardFace } from '../card-face/card-face';
import { FacePresentation } from '../card-face/face-presentation';
import { OverlayFocus } from '../overlay-focus';

export type RevealOutcome = 'match' | 'mismatch';

/**
 * Large side-by-side reveal of the two flipped cards, every turn (DS-012, R15).
 * A mismatch is dismissed by activating either card; a match closes on its own and the
 * scrim does nothing. Cards are native buttons, so a focused card handles its own Enter
 * and Space. The page-level key path only covers focus that is not on a button and
 * ignores button targets, so one key press can never dismiss twice (OBS-012).
 */
@Component({
  selector: 'app-pair-reveal',
  imports: [CardFace],
  hostDirectives: [OverlayFocus],
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'reveal-title',
    'aria-describedby': 'reveal-hint',
    '[attr.data-testid]': '"reveal-overlay-root-" + outcome()',
    '(mousedown)': 'keepFocus($event)',
    '(document:keydown.enter)': 'onKey($event)',
    '(document:keydown.space)': 'onKey($event)',
  },
  styleUrl: './pair-reveal.scss',
  templateUrl: './pair-reveal.html',
})
export class PairReveal {
  readonly faces = input.required<readonly FacePresentation[]>();
  readonly outcome = input.required<RevealOutcome>();
  readonly dismissed = output();

  protected readonly title = computed(() =>
    this.outcome() === 'match' ? 'Match!' : 'Not a match',
  );
  protected readonly hint = computed(() =>
    this.outcome() === 'mismatch' ? 'Tap a card to continue' : '',
  );

  protected onCard(): void {
    if (this.outcome() === 'mismatch') {
      this.dismissed.emit();
    }
  }

  /** A press on the scrim or title must not pull focus out of the dialog (DS-026). */
  protected keepFocus(event: MouseEvent): void {
    if (!(event.target instanceof Element) || !event.target.closest('button')) {
      event.preventDefault();
    }
  }

  protected onKey(event: Event): void {
    if (this.outcome() !== 'mismatch' || event.target instanceof HTMLButtonElement) {
      return;
    }
    event.preventDefault();
    this.dismissed.emit();
  }
}
