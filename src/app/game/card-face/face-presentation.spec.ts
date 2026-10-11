import { ThemeContent } from '../../content/edition';
import { cueFor } from '../../domain/difference';
import { DifferenceType, FaceCue, FaceId } from '../../domain/types';
import { presentFace } from './face-presentation';

const THEME: ThemeContent = { id: 'snowboard', name: 'Snowboard', child: 'kira', hue: 235 };
const base: FaceId = { themeId: 'snowboard', variantId: 'base' };
const alternate: FaceId = { themeId: 'snowboard', variantId: 'alternate' };
const OFF: FaceCue = { difference: null, secondaryCue: null };

const present = (face: FaceId, cue: FaceCue) => presentFace(face, cue, THEME, 'Kira');

describe('presentFace', () => {
  it('names a face "{Child}: {Activity}" for assistive tech (design-spec 2.1)', () => {
    expect(present(base, OFF)).toMatchObject({
      label: 'Kira: Snowboard',
      child: 'kira',
      themeName: 'Snowboard',
      themeId: 'snowboard',
    });
  });

  it('shows one plain variant with no cue when variants are off (DS-009)', () => {
    for (const face of [base, alternate]) {
      expect(present(face, OFF)).toMatchObject({
        hue: 235,
        pattern: 'none',
        badge: 'none',
        mirrored: false,
        difference: null,
      });
    }
  });

  it('shifts the hue 55 degrees with an always-on dot cue for the color difference (R29)', () => {
    const cue = cueFor('color');
    expect(present(base, cue)).toMatchObject({ hue: 235, pattern: 'none' });
    expect(present(alternate, cue)).toMatchObject({ hue: 290, pattern: 'dots' });
  });

  it('wraps the shifted hue around the colour wheel', () => {
    const wrapped = presentFace(alternate, cueFor('color'), { ...THEME, hue: 350 }, 'Kira');
    expect(wrapped.hue).toBe(45);
  });

  it('uses stripes then dots for the pattern difference', () => {
    const cue = cueFor('pattern');
    expect(present(base, cue).pattern).toBe('stripes');
    expect(present(alternate, cue).pattern).toBe('dots');
    expect(present(alternate, cue).hue).toBe(235);
  });

  it('uses a circle then a star badge for the accessory difference', () => {
    const cue = cueFor('accessory');
    expect(present(base, cue).badge).toBe('circle');
    expect(present(alternate, cue).badge).toBe('star');
    expect(present(alternate, cue).pattern).toBe('none');
  });

  it('mirrors only the alternate variant for the orientation difference', () => {
    const cue = cueFor('orientation');
    expect(present(base, cue).mirrored).toBe(false);
    expect(present(alternate, cue).mirrored).toBe(true);
  });

  it('gives the two variants of every difference type a visible distinction', () => {
    const types: DifferenceType[] = ['color', 'pattern', 'accessory', 'orientation'];
    for (const type of types) {
      const a = present(base, cueFor(type));
      const b = present(alternate, cueFor(type));
      const { label: _a, variant: _av, ...left } = a;
      const { label: _b, variant: _bv, ...right } = b;
      expect(left).not.toEqual(right);
    }
  });
});
