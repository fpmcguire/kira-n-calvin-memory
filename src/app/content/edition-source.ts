import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';
import { ASSET_FETCH, resolveEditionAssetUrl } from './asset-url';
import { EditionContent } from './edition';
import { parseEdition } from './edition-parser';

/** The selected edition's entry URL, relative to the document base (R34, R35). */
export const SELECTED_EDITION_URL = 'content/kira-calvin/edition.json';

/**
 * Loads `edition.json` as `unknown`, validates it and holds the immutable result. It runs
 * once as an app initializer, so by the time any component injects `EDITION` the edition is
 * complete and valid; a bad edition fails the load with a controlled error instead.
 */
@Service()
export class EditionSource {
  private readonly document = inject(DOCUMENT);
  private readonly fetchAsset = inject(ASSET_FETCH);
  private loaded: EditionContent | null = null;

  async load(path: string = SELECTED_EDITION_URL): Promise<EditionContent> {
    const url = resolveEditionAssetUrl(path, this.document.baseURI);
    const response = await this.fetchAsset(url.href, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Edition content could not be loaded (${response.status}) from ${path}`);
    }
    const raw: unknown = await response.json();
    this.loaded = parseEdition(raw);
    return this.loaded;
  }

  /** The loaded edition; reading it before `load` has completed is a programming error. */
  get content(): EditionContent {
    if (!this.loaded) {
      throw new Error('Edition content has not been loaded');
    }
    return this.loaded;
  }
}
