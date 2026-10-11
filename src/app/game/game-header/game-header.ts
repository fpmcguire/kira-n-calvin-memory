import { Component, computed, inject, input, output, signal } from '@angular/core';
import { EDITION } from '../../content/edition';
import { PlayerBlock } from '../game-state';

/**
 * Game header (DS-002 to DS-006). Rendered as a `<header>` so its content sits in the
 * banner landmark (STEP-02 D2). Values come from the live game; actions are emitted.
 */
@Component({
  selector: 'header[app-game-header]',
  host: { 'data-testid': 'header-bar-root' },
  styleUrl: './game-header.scss',
  templateUrl: './game-header.html',
})
export class GameHeader {
  protected readonly edition = inject(EDITION);

  readonly players = input.required<readonly PlayerBlock[]>();
  /** `m:ss` single-player time (R20). */
  readonly timerText = input('0:00');
  readonly timerState = input<'running' | 'paused' | 'ended'>('running');
  readonly showAllDisabled = input(true);
  readonly restartDisabled = input(true);
  readonly newGameDisabled = input(false);
  readonly showAll = output();
  readonly restart = output();
  readonly newGame = output();

  protected readonly showTimer = computed(() => this.players().length === 1);
  protected readonly soundOn = signal(true);
}
