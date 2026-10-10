import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { EDITION } from '../../content/edition';
import { OverlayFocus } from '../overlay-focus';

export const SPLASH_MS = 3000;

@Component({
  selector: 'app-splash',
  hostDirectives: [OverlayFocus],
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'Welcome',
    '[attr.data-testid]': '"splash-screen-root-" + variant()',
  },
  styleUrl: './splash.scss',
  templateUrl: './splash.html',
})
export class Splash {
  protected readonly edition = inject(EDITION);

  readonly variant = input.required<'birthday' | 'generic'>();
  readonly dismissed = output();

  constructor() {
    const timer = setTimeout(() => this.dismissed.emit(), SPLASH_MS);
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  }
}
