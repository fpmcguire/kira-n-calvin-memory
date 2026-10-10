import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Overlay focus management (DS-026): focus moves in on open, Tab is contained
 * while open, and focus returns to the opener on close. If the opener is gone
 * or disabled, focus goes to the `fallback` element instead.
 */
@Directive({
  selector: '[appOverlayFocus]',
  host: { '(keydown)': 'trapTab($event)' },
})
export class OverlayFocus {
  /** CSS selector used when the opener can no longer take focus. */
  readonly fallback = input('[data-focus-fallback]');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly opener = this.document.activeElement;

  constructor() {
    // The overlay renders in the same pass; wait for the DOM before moving focus.
    queueMicrotask(() => this.focusables()[0]?.focus());
    inject(DestroyRef).onDestroy(() => queueMicrotask(() => this.restore()));
  }

  protected trapTab(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const items = this.focusables();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.document.activeElement;
    const outside = !this.host.contains(active);
    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusables(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE));
  }

  private restore(): void {
    const opener = this.opener;
    if (
      opener instanceof HTMLElement &&
      opener !== this.document.body &&
      this.document.contains(opener) &&
      !(opener as HTMLButtonElement).disabled &&
      !opener.closest('[inert]')
    ) {
      opener.focus();
      return;
    }
    this.document.querySelector<HTMLElement>(this.fallback())?.focus();
  }
}
