import { Component, computed, inject, input, model, output } from '@angular/core';
import { EDITION } from '../../content/edition';
import {
  canGo,
  cardCount,
  FILL_MAX,
  FILL_MIN,
  resetOptions,
  setFillCount,
  stepFillCount,
  withFill,
  withTheme,
} from '../../domain/options';
import { GameOptions } from '../../domain/types';
import { OverlayFocus } from '../overlay-focus';

/** Options popup (DS-010, DS-011, DS-019, DS-025). Edits only the draft; Go is applied by the parent. */
@Component({
  selector: 'app-options-popup',
  hostDirectives: [OverlayFocus],
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'options-title',
    'data-testid': 'options-dialog-root',
    '(keydown.escape)': 'onEscape()',
  },
  styleUrl: './options-popup.scss',
  templateUrl: './options-popup.html',
})
export class OptionsPopup {
  protected readonly edition = inject(EDITION);

  readonly draft = model.required<GameOptions>();
  readonly closable = input(false);
  readonly closed = output();
  readonly go = output();

  protected readonly fillMin = FILL_MIN;
  protected readonly fillMax = FILL_MAX;
  protected readonly withFill = withFill;
  protected readonly withTheme = withTheme;
  protected readonly stepFillCount = stepFillCount;
  protected readonly setFillCount = setFillCount;
  protected readonly reset = resetOptions;

  protected readonly goEnabled = computed(() => canGo(this.draft()));
  protected readonly summary = computed(() => {
    if (!this.goEnabled()) {
      return 'Pick at least one theme';
    }
    const cards = cardCount(this.draft());
    const pairs = cards / 2;
    return `${cards} cards · ${pairs} ${pairs === 1 ? 'pair' : 'pairs'}`;
  });

  protected themesOf(child: string) {
    return this.edition.themes.filter((theme) => theme.child === child);
  }

  protected onEscape(): void {
    if (this.closable()) {
      this.closed.emit();
    }
  }
}
