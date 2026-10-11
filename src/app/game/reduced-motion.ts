import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Service, signal } from '@angular/core';

/**
 * Tracks `prefers-reduced-motion` so motion-only content (confetti) is not rendered at
 * all when the device asks for less motion (R32, DS-017). CSS durations are shortened
 * separately in `styles.scss`; state changes and play timing are unaffected.
 */
@Service()
export class ReducedMotion {
  readonly reduced = signal(false);

  constructor() {
    const query = inject(DOCUMENT).defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) {
      return;
    }
    this.reduced.set(query.matches);
    const onChange = (event: MediaQueryListEvent) => this.reduced.set(event.matches);
    query.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
  }
}
