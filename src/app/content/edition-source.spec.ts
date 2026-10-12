import { TestBed } from '@angular/core/testing';
import { publicFile } from '../../testing/public-assets';
import { ASSET_FETCH, resolveEditionAssetUrl } from './asset-url';
import { EditionValidationError } from './edition-parser';
import { EditionSource, SELECTED_EDITION_URL } from './edition-source';

function source(fetchAsset: typeof fetch): EditionSource {
  TestBed.configureTestingModule({ providers: [{ provide: ASSET_FETCH, useValue: fetchAsset }] });
  return TestBed.inject(EditionSource);
}

const json = (body: unknown, status = 200) =>
  (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

describe('EditionSource (R35)', () => {
  it('loads the selected edition as unknown, validates it and exposes immutable content', async () => {
    const urls: string[] = [];
    const edition = source(async (input) => {
      urls.push(String(input));
      return new Response(publicFile(SELECTED_EDITION_URL), { status: 200 });
    });
    const loaded = await edition.load();
    expect(new URL(urls[0]).pathname.endsWith(SELECTED_EDITION_URL)).toBe(true);
    expect(loaded.themes).toHaveLength(10);
    expect(edition.content).toBe(loaded);
    expect(Object.isFrozen(loaded)).toBe(true);
  });

  it('refuses to hand out content before it has loaded', () => {
    const edition = source(json({}));
    expect(() => edition.content).toThrow(/not been loaded/);
  });

  it('fails the load with a controlled validation error for invalid content', async () => {
    const edition = source(json({ schemaVersion: 1 }));
    await expect(edition.load()).rejects.toBeInstanceOf(EditionValidationError);
    expect(() => edition.content).toThrow(/not been loaded/);
  });

  it('never partly uses an edition that breaks the contract', async () => {
    const broken = JSON.parse(publicFile(SELECTED_EDITION_URL));
    broken.themes[0].art.eligibleSlotTreatments.pop();
    const edition = source(json(broken));
    await expect(edition.load()).rejects.toThrow(/at least 2/);
    expect(() => edition.content).toThrow();
  });

  it('fails on an HTTP error', async () => {
    const edition = source(json({}, 404));
    await expect(edition.load()).rejects.toThrow(/404/);
  });

  it('refuses a path that is not relative and same-origin', async () => {
    const edition = source(json({}));
    for (const path of ['/edition.json', 'https://evil.example/edition.json', '../edition.json']) {
      await expect(edition.load(path), path).rejects.toThrow(/relative same-origin/);
    }
  });
});

describe('resolveEditionAssetUrl', () => {
  it('resolves under the document base, including a subfolder', () => {
    expect(
      resolveEditionAssetUrl(
        'content/kira-calvin/edition.json',
        'https://x.test/kira-n-calvin-memory/game',
      ).href,
    ).toBe('https://x.test/kira-n-calvin-memory/content/kira-calvin/edition.json');
    expect(resolveEditionAssetUrl('a/b.svg', 'https://x.test/').href).toBe(
      'https://x.test/a/b.svg',
    );
  });

  it('refuses anything that is not a plain relative path', () => {
    for (const path of ['//evil.test/a.svg', 'http://evil.test/a.svg', '/a.svg', '../a.svg']) {
      expect(() => resolveEditionAssetUrl(path, 'https://x.test/'), path).toThrow();
    }
  });
});
