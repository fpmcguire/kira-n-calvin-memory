import { Component, input, output } from '@angular/core';
import { OverlayFocus } from '../overlay-focus';

/**
 * "Start over?" confirm (DS-018). The secondary action is labelled by where it leads:
 * "Keep playing" returns to the game, "Back to options" returns to the popup with its
 * draft intact. Escape cancels. Focus starts on the secondary action.
 */
@Component({
  selector: 'app-confirm-dialog',
  hostDirectives: [OverlayFocus],
  host: {
    role: 'alertdialog',
    'aria-modal': 'true',
    'aria-labelledby': 'confirm-title',
    'data-testid': 'confirm-dialog-root',
    '(keydown.escape)': 'cancelled.emit()',
  },
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly cancelLabel = input.required<string>();
  readonly cancelled = output();
  readonly confirmed = output();
}
