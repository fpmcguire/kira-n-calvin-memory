import { DOCUMENT } from '@angular/common';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ASSET_FETCH } from '../content/asset-url';
import { ActivitySvgError, sanitizeActivitySvg } from '../content/activity-svg-sanitizer';
import { ActivityArtContent } from '../content/edition';
import { themeOf } from '../../testing/edition-fixtures';
import { publicFetch, publicFile } from '../../testing/public-assets';
import { ActivitySvgRepository } from './activity-svg-repository';

const art = themeOf('dance').art;
const other = themeOf('drones').art;

interface Setup {
  readonly repository: ActivitySvgRepository;
  readonly requests: string[];
  readonly errors: unknown[];
  readonly trust: ReturnType<typeof vi.spyOn>;
}

function setup(fetchAsset?: (requests: string[]) => typeof fetch): Setup {
  const requests: string[] = [];
  const errors: unknown[] = [];
  TestBed.configureTestingModule({
    providers: [
      { provide: ASSET_FETCH, useValue: (fetchAsset ?? publicFetch)(requests) },
      { provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } },
    ],
  });
  const trust = vi.spyOn(TestBed.inject(DomSanitizer), 'bypassSecurityTrustHtml');
  return { repository: TestBed.inject(ActivitySvgRepository), requests, errors, trust };
}

describe('ActivitySvgRepository (R27, AC8)', () => {
  it('fetches the validated same-origin path and returns trusted sanitized markup', async () => {
    const { repository, requests, trust } = setup();
    const markup = await repository.load(art);
    expect(requests).toEqual(['/' + art.assetPath]);
    expect(trust).toHaveBeenCalledTimes(1);
    expect(markup).toBe(trust.mock.results[0].value);
  });

  it('trusts exactly the sanitizer output and nothing else', async () => {
    const { repository, trust } = setup();
    await repository.load(art);
    const expected = sanitizeActivitySvg(publicFile(art.assetPath), art);
    expect(trust).toHaveBeenCalledWith(expected);
    expect(expected).not.toContain('<!--');
    expect(expected).not.toContain(' id="');
  });

  it('shares one load between concurrent requests for one asset', async () => {
    const { repository, requests, trust } = setup();
    const [a, b, c] = await Promise.all([
      repository.load(art),
      repository.load(art),
      repository.load(art),
    ]);
    expect(requests).toHaveLength(1);
    expect(trust).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('serves later requests from the sanitized cache without another fetch', async () => {
    const { repository, requests, trust } = setup();
    expect(repository.cached(art)).toBeNull();
    const first = await repository.load(art);
    expect(repository.cached(art)).toBe(first);
    expect(await repository.load(art)).toBe(first);
    expect(requests).toHaveLength(1);
    expect(trust).toHaveBeenCalledTimes(1);
  });

  it('caches per asset path', async () => {
    const { repository, requests } = setup();
    const a = await repository.load(art);
    const b = await repository.load(other);
    expect(requests).toEqual(['/' + art.assetPath, '/' + other.assetPath]);
    expect(a).not.toBe(b);
  });

  it('refuses art that did not come from validated edition content, without fetching', async () => {
    const { repository, requests, trust } = setup();
    const forged: ActivityArtContent = { ...art };
    await expect(repository.load(forged)).rejects.toThrow(/validated edition content/);
    expect(requests).toHaveLength(0);
    expect(trust).not.toHaveBeenCalled();
  });

  it('never trusts a rejected SVG, reports it and does not cache it', async () => {
    const hostile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><script>alert(1)</script></svg>`;
    const { repository, errors, trust } = setup((requests) => async (input) => {
      requests.push(String(input));
      return new Response(hostile, { status: 200 });
    });
    await expect(repository.load(art)).rejects.toBeInstanceOf(ActivitySvgError);
    expect(trust).not.toHaveBeenCalled();
    expect(errors).toHaveLength(1);
    expect(repository.cached(art)).toBeNull();
  });

  it('does not trust an SVG that disagrees with the edition contract', async () => {
    // The Drones file is a valid structured SVG, but not the one the Dance contract describes.
    const { repository, trust } = setup(
      () => async () => new Response(publicFile(other.assetPath), { status: 200 }),
    );
    await expect(repository.load(art)).rejects.toMatchObject({ reason: 'contract-mismatch' });
    expect(trust).not.toHaveBeenCalled();
  });

  it('does not trust fetched markup whose owner, activity or fixed groups disagree', async () => {
    const good = publicFile(art.assetPath);
    const fixedGroup = /<g id="head-back"[\s\S]*?<\/g>\s*<\/g>\s*/;
    expect(good).toMatch(fixedGroup);
    const tampered = [
      good.replace(/data-owner="[^"]*"/, 'data-owner="Mallory"'),
      good.replace(/data-activity="[^"]*"/, 'data-activity="Other"'),
      good.replace(fixedGroup, ''),
      good.replace('data-part="head-back"', 'data-part="head"'),
    ];
    for (const markup of tampered) {
      expect(markup).not.toBe(good);
      TestBed.resetTestingModule();
      const { repository, errors, trust } = setup(
        () => async () => new Response(markup, { status: 200 }),
      );
      await expect(repository.load(art)).rejects.toMatchObject({ reason: 'contract-mismatch' });
      expect(trust).not.toHaveBeenCalled();
      expect(errors).toHaveLength(1);
      expect(repository.cached(art)).toBeNull();
    }
  });

  it('treats an HTTP failure as an error and allows a later retry', async () => {
    let healthy = false;
    const { repository, errors } = setup((requests) => async (input) => {
      requests.push(String(input));
      return healthy
        ? new Response(publicFile(art.assetPath), { status: 200 })
        : new Response('down', { status: 503 });
    });
    await expect(repository.load(art)).rejects.toThrow(/503/);
    expect(errors).toHaveLength(1);
    healthy = true;
    await expect(repository.load(art)).resolves.toBeTruthy();
  });

  it('resolves the path against the document base, same origin only', async () => {
    const seen: string[] = [];
    const { repository } = setup(() => async (input) => {
      seen.push(String(input));
      return new Response(publicFile(art.assetPath), { status: 200 });
    });
    await repository.load(art);
    const resolved = new URL(seen[0]);
    expect(resolved.origin).toBe(new URL(TestBed.inject(DOCUMENT).baseURI).origin);
    expect(resolved.pathname.endsWith(art.assetPath)).toBe(true);
  });

  it('preload starts loads in the background and never throws', async () => {
    const { repository, requests } = setup();
    repository.preload([art, other, art]);
    await repository.load(art);
    await repository.load(other);
    expect(requests).toHaveLength(2);
  });
});
