import { Component, computed, inject, input, output, signal } from '@angular/core';
import { EDITION } from '../../content/edition';
import { PlayerBlock } from '../game-state';

/** Header skeleton (DS-002 to DS-006). Scores and timer are static until the play loop exists. */
@Component({
  selector: 'app-game-header',
  host: { 'data-testid': 'header-bar-root' },
  styleUrl: './game-header.scss',
  templateUrl: './game-header.html',
})
export class GameHeader {
  protected readonly edition = inject(EDITION);

  readonly players = input.required<readonly PlayerBlock[]>();
  readonly newGameDisabled = input(false);
  readonly newGame = output();

  protected readonly showTimer = computed(() => this.players().length === 1);
  protected readonly soundOn = signal(true);
}
