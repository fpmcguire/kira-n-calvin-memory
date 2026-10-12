import { DOCUMENT } from '@angular/common';
import { ErrorHandler, inject, Service } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ASSET_FETCH, resolveEditionAssetUrl } from '../content/asset-url';
import { sanitizeActivitySvg } from '../content/activity-svg-sanitizer';
import { ActivityArtContent } from '../content/edition';
import { isValidatedActivityArt } from '../content/edition-parser';

/**
 * The only place structured activity SVG markup is fetched, sanitized and trusted (R27,
 * R28, AC8). It accepts a validated edition art record, never markup: it fetches the
 * record's same-origin path, runs the strict SVG allow-list sanitizer, and only after that
 * succeeds passes the result to Angular's explicit trust call. Sanitized markup is cached
 * by asset path and concurrent requests share one load.
 *
 * Components render the returned `SafeHtml` and never call a trust-bypass API themselves.
 */
@Service()
export class ActivitySvgRepository {
  private readonly document = inject(DOCUMENT);
  private readonly fetchAsset = inject(ASSET_FETCH);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly errors = inject(ErrorHandler);

  private readonly pending = new Map<string, Promise<SafeHtml>>();
  private readonly cache = new Map<string, SafeHtml>();

  /** Sanitized, trusted markup for `art`, loading it once per asset path. Rejects on any failure. */
  load(art: ActivityArtContent): Promise<SafeHtml> {
    if (!isValidatedActivityArt(art)) {
      return Promise.reject(new Error('Activity art must come from validated edition content'));
    }
    const cached = this.cache.get(art.assetPath);
    if (cached) {
      return Promise.resolve(cached);
    }
    let pending = this.pending.get(art.assetPath);
    if (!pending) {
      pending = this.fetchAndSanitize(art).then(
        (markup) => {
          this.cache.set(art.assetPath, markup);
          this.pending.delete(art.assetPath);
          return markup;
        },
        (error: unknown) => {
          this.pending.delete(art.assetPath);
          this.errors.handleError(error);
          throw error;
        },
      );
      this.pending.set(art.assetPath, pending);
    }
    return pending;
  }

  /** Synchronous read of an already loaded entry, so a cached face paints without a frame of delay. */
  cached(art: ActivityArtContent): SafeHtml | null {
    return this.cache.get(art.assetPath) ?? null;
  }

  /** Starts loading in the background; failures are reported once and never interrupt play. */
  preload(arts: readonly ActivityArtContent[]): void {
    for (const art of arts) {
      this.load(art).catch(() => undefined);
    }
  }

  private async fetchAndSanitize(art: ActivityArtContent): Promise<SafeHtml> {
    const url = resolveEditionAssetUrl(art.assetPath, this.document.baseURI);
    const response = await this.fetchAsset(url.href, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Activity art could not be loaded (${response.status}): ${art.assetPath}`);
    }
    const markup = sanitizeActivitySvg(await response.text(), art);
    // The single explicit-trust call in the app: it receives only sanitizer output.
    return this.domSanitizer.bypassSecurityTrustHtml(markup);
  }
}
