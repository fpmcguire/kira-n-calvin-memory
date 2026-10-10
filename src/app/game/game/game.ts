import { Component, computed, inject } from '@angular/core';
import { GameHeader } from '../game-header/game-header';
import { GameState } from '../game-state';
import { OptionsPopup } from '../options-popup/options-popup';
import { PreviewBoard } from '../preview-board/preview-board';
import { Splash } from '../splash/splash';

/** Game route shell: header, table and the splash/options overlays. Separate from the greeting route. */
@Component({
  selector: 'app-game',
  imports: [GameHeader, OptionsPopup, PreviewBoard, Splash],
  providers: [GameState],
  styleUrl: './game.scss',
  templateUrl: './game.html',
})
export class Game {
  protected readonly state = inject(GameState);

  protected readonly overlayOpen = computed(
    () => this.state.splashVisible() || this.state.popupOpen(),
  );
}
