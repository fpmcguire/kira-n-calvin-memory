import { InjectionToken } from '@angular/core';
import { isRelativeEditionPath } from './edition-parser';

/** The platform `fetch`, injectable so loaders and the SVG repository are testable without a network. */
export const ASSET_FETCH = new InjectionToken<typeof fetch>('ASSET_FETCH', {
  providedIn: 'root',
  factory: () => (input, init) => globalThis.fetch(input, init),
});

/**
 * Resolves a validated, relative edition path against the document base and refuses
 * anything that would leave the document's own origin (R34, R35, AC8).
 */
export function resolveEditionAssetUrl(path: string, baseUri: string): URL {
  if (!isRelativeEditionPath(path)) {
    throw new Error(`Edition asset path "${path}" is not a relative same-origin path`);
  }
  const base = new URL(baseUri);
  const url = new URL(path, base);
  if (url.origin !== base.origin) {
    throw new Error(`Edition asset path "${path}" leaves the document origin`);
  }
  return url;
}
