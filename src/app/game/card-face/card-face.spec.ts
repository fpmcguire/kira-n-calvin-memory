import { TestBed } from '@angular/core/testing';
import { ThemeContent } from '../../content/edition';
import { cueFor } from '../../domain/difference';
import { FaceCue, FaceId } from '../../domain/types';
import { CardFace } from './card-face';
import { presentFace } from './face-presentation';

const THEME: ThemeContent = {
  id: 'snowboard',
  name: 'Snowboard',
  child: 'kira',
  hue: 235,
  art: 'content/kira-calvin/art/snowboard.svg',
};
const base: FaceId = { themeId: 'snowboard', variantId: 'base' };
const alternate: FaceId = { themeId: 'snowboard', variantId: 'alternate' };
const OFF: FaceCue = { difference: null, secondaryCue: null };
const ACCESSORY = cueFor('accessory');

/** Returns the rendered `app-card-face` host, which carries the cue attributes. */
function render(face: FaceId, cue: FaceCue): HTMLElement {
  const fixture = TestBed.createComponent(CardFace);
  fixture.componentRef.setInput('face', presentFace(face, cue, THEME, 'Kira'));
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('CardFace', () => {
  it('draws the theme art, decorative and unnamed, with no placeholder text (R27)', () => {
    const host = render(base, OFF);
    const img = host.querySelector('img');
    expect(img?.getAttribute('src')).toBe('content/kira-calvin/art/snowboard.svg');
    expect(img?.getAttribute('alt')).toBe('');
    expect(host.textContent).not.toContain('illustration');
  });

  it('draws the same art file for base and alternate (AC3)', () => {
    const srcOf = (face: FaceId) =>
      render(face, ACCESSORY).querySelector('img')?.getAttribute('src');
    expect(srcOf(alternate)).toBe(srcOf(base));
  });

  it('shows a filled circle for base and a filled star for alternate (AC3)', () => {
    expect(render(base, ACCESSORY).getAttribute('data-badge')).toBe('circle');
    expect(render(alternate, ACCESSORY).getAttribute('data-badge')).toBe('star');
    expect(render(base, ACCESSORY).querySelector('.badge')).not.toBeNull();
    expect(render(alternate, ACCESSORY).querySelector('.badge')).not.toBeNull();
  });

  it('shows no cue when variants are off (AC3)', () => {
    expect(render(base, OFF).querySelector('.badge')).toBeNull();
    expect(render(base, OFF).getAttribute('data-badge')).toBe('none');
  });

  it('keeps the cue out of the accessibility tree; the parent names the card', () => {
    expect(render(alternate, ACCESSORY).querySelector('.badge')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });
});
