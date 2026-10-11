import { Component, computed, inject } from '@angular/core';
import { Board } from '../board/board';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { EndScreen } from '../end-screen/end-screen';
import { GameHeader } from '../game-header/game-header';
import { GameState } from '../game-state';
import { OptionsPopup } from '../options-popup/options-popup';
import { PairReveal } from '../pair-reveal/pair-reveal';
import { PreviewBoard } from '../preview-board/preview-board';
import { Splash } from '../splash/splash';

/** Game route shell: header, table and the splash, reveal, end, options and confirm overlays. */
@Component({
  selector: 'app-game',
  imports: [
    Board,
    ConfirmDialog,
    EndScreen,
    GameHeader,
    OptionsPopup,
    PairReveal,
    PreviewBoard,
    Splash,
  ],
  providers: [GameState],
  styleUrl: './game.scss',
  templateUrl: './game.html',
})
export class Game {
  protected readonly state = inject(GameState);

  /** Anything modal makes the header and table inert (DS-026). */
  protected readonly overlayOpen = computed(
    () =>
      this.state.splashVisible() ||
      this.state.popupOpen() ||
      this.state.reveal() !== null ||
      this.state.ended() ||
      this.state.confirm() !== null,
  );

  protected readonly cancelLabel = computed(() =>
    this.state.confirm() === 'go' ? 'Back to options' : 'Keep playing',
  );
}
