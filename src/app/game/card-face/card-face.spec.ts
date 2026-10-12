import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ASSET_FETCH } from '../../content/asset-url';
import { facePresentation, themeOf } from '../../../testing/edition-fixtures';
import { publicFetch } from '../../../testing/public-assets';
import { VariantId } from '../../domain/types';
import { ActivitySvgRepository } from '../activity-svg-repository';
import { CardFace } from './card-face';

const errors: unknown[] = [];

function configure(fetchAsset: typeof fetch): void {
  errors.length = 0;
  TestBed.configureTestingModule({
    providers: [
      { provide: ASSET_FETCH, useValue: fetchAsset },
      { provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } },
    ],
  });
}

beforeEach(() => configure(publicFetch()));

async function render(
  themeId: string,
  variant: VariantId,
  options: { variantsOn?: boolean; index?: number; size?: 'card' | 'reveal' } = {},
): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(CardFace);
  fixture.componentRef.setInput('face', facePresentation(themeId, variant, options));
  if (options.size) {
    fixture.componentRef.setInput('size', options.size);
  }
  fixture.detectChanges();
  // The face loads its art through the repository; wait for that load, then repaint.
  await TestBed.inject(ActivitySvgRepository)
    .load(facePresentation(themeId, variant, options).art)
    .catch(() => undefined);
  fixture.detectChanges();
  return fixture.nativeElement;
}

const artOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.art')!;

describe('CardFace', () => {
  it('draws the theme art inline and decorative, never as an image or base64 (R27, AC9)', async () => {
    const host = await render('dance', 'base');
    const svg = host.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('data-activity')).toBe('Dance');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('img')).toBeNull();
    expect(host.innerHTML).not.toContain('base64');
    expect(host.textContent?.trim()).toBe('KiraDance');
  });

  it('renders the same sanitized markup for base and alternate (AC4)', async () => {
    const base = await render('dance', 'base');
    const alternate = await render('dance', 'alternate');
    expect(alternate.querySelector('svg')?.outerHTML).toBe(base.querySelector('svg')?.outerHTML);
  });

  describe('base face', () => {
    it('sets no custom properties, no slot or treatment hook, and no medallion (AC5, AC6, AC7)', async () => {
      const host = await render('dance', 'base');
      expect(artOf(host).getAttribute('style') ?? '').not.toContain('--');
      expect(host.hasAttribute('data-variant-slot')).toBe(false);
      expect(host.hasAttribute('data-treatment-id')).toBe(false);
      expect(host.getAttribute('data-cue-present')).toBe('false');
      expect(host.querySelector('.medallion')).toBeNull();
    });

    it('has no medallion in a variants-off game, which also has no selection (AC6)', async () => {
      const host = await render('dance', 'base', { variantsOn: false });
      expect(host.querySelector('.medallion')).toBeNull();
      expect(host.getAttribute('data-cue-present')).toBe('false');
    });
  });

  describe('alternate face', () => {
    it('sets exactly the selected slot variable on the art wrapper (AC5)', async () => {
      const host = await render('dance', 'alternate', { index: 1 });
      const style = artOf(host).style;
      expect(style.length).toBe(1);
      expect(style.getPropertyValue('--skirt')).toBe('#9b3f70');
      expect(style.getPropertyValue('--outfit')).toBe('');
    });

    it('sets every variable of a multi-variable slot, including Drones drone (AC5, AC15)', async () => {
      const host = await render('drones', 'alternate', { index: 0 });
      const style = artOf(host).style;
      expect(style.length).toBe(2);
      expect(style.getPropertyValue('--drone')).toBe('#e1a21a');
      expect(style.getPropertyValue('--drone-2')).toBe('#a33f73');
      expect(host.getAttribute('data-variant-slot')).toBe('drone');
      expect(host.getAttribute('data-treatment-id')).toBe('drone-gold-berry');
    });

    it('covers both variables of the Snowboard helmet slot', async () => {
      const index = themeOf('snowboard').art.eligibleSlotTreatments.findIndex(
        (entry) => entry.slotId === 'helmet',
      );
      const host = await render('snowboard', 'alternate', { index });
      expect(artOf(host).style.getPropertyValue('--helmet')).toBe('#1f7a75');
      expect(artOf(host).style.getPropertyValue('--helmet-2')).toBe('#ffd166');
    });

    it('exposes the hooks on the face root and shows the decorative medallion (AC6, AC7)', async () => {
      const host = await render('dance', 'alternate');
      expect(host.getAttribute('data-variant-slot')).toBe('outfit');
      expect(host.getAttribute('data-treatment-id')).toBe('outfit-deep-teal');
      expect(host.getAttribute('data-cue-present')).toBe('true');
      const medallion = host.querySelector('.medallion');
      expect(medallion?.getAttribute('aria-hidden')).toBe('true');
      expect(medallion?.querySelector('.diamond')).not.toBeNull();
      expect(medallion?.textContent).toBe('');
    });

    it('keeps the hooks out of the visible text and accessible name (AC7)', async () => {
      const host = await render('dance', 'alternate');
      expect(host.textContent?.trim()).toBe('KiraDance');
      expect(host.querySelector('[aria-label], [role], [alt]')).toBeNull();
    });

    it('uses the same single medallion at reveal size (AC6)', async () => {
      const host = await render('dance', 'alternate', { size: 'reveal' });
      expect(host.classList.contains('reveal')).toBe(true);
      expect(host.querySelectorAll('.medallion')).toHaveLength(1);
    });
  });

  describe('loading failure', () => {
    it('shows a non-identifying fallback, reports the error and keeps the face usable', async () => {
      TestBed.resetTestingModule();
      configure(async () => new Response('missing', { status: 404 }));
      const host = await render('dance', 'alternate');
      expect(host.querySelector('svg')).toBeNull();
      expect(host.querySelector('.art-fallback')?.getAttribute('aria-hidden')).toBe('true');
      expect(host.querySelector('.medallion')).not.toBeNull();
      expect(errors).toHaveLength(1);
    });
  });
});
