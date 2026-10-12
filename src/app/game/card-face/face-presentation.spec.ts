import { EDITION_CONTENT, presentationFor, themeOf } from '../../../testing/edition-fixtures';
import { presentFace } from './face-presentation';

const theme = themeOf('drones');
const base = { themeId: 'drones', variantId: 'base' } as const;
const alternate = { themeId: 'drones', variantId: 'alternate' } as const;
const calvin = EDITION_CONTENT.children.find((child) => child.id === 'calvin')!;
const selection = presentationFor(['drones'], 0);

describe('presentFace (R27, R28, R29)', () => {
  it('names a face "{Child}: {Activity}" and carries its theme and validated art', () => {
    const face = presentFace(base, {}, false, theme, calvin.name);
    expect(face).toMatchObject({
      child: 'calvin',
      childName: 'Calvin',
      themeId: 'drones',
      themeName: 'Drones',
      variant: 'base',
      hue: 200,
      label: 'Calvin: Drones',
    });
    expect(face.art).toBe(theme.art);
  });

  it('uses manifest defaults and no cue for a base face, with variants on or off', () => {
    for (const variantsOn of [true, false]) {
      const face = presentFace(base, selection, variantsOn, theme, calvin.name);
      expect(face.treatment).toBeNull();
      expect(face.cuePresent).toBe(false);
    }
  });

  it('applies the theme selection to an alternate face with the cue present', () => {
    const face = presentFace(alternate, selection, true, theme, calvin.name);
    expect(face.treatment).toEqual({
      slotId: 'drone',
      treatmentId: 'drone-gold-berry',
      properties: { '--drone': '#e1a21a', '--drone-2': '#a33f73' },
    });
    expect(face.cuePresent).toBe(true);
  });

  it('shows the same art and the same treatment for every copy of an alternate face', () => {
    const a = presentFace(alternate, selection, true, theme, calvin.name);
    const b = presentFace(alternate, selection, true, theme, calvin.name);
    expect(a).toEqual(b);
    expect(a.art).toBe(presentFace(base, {}, false, theme, calvin.name).art);
  });

  it('shows no treatment or cue when variants are off', () => {
    const face = presentFace(alternate, {}, false, theme, calvin.name);
    expect(face.treatment).toBeNull();
    expect(face.cuePresent).toBe(false);
  });

  it('does not change the hue between base and alternate faces', () => {
    expect(presentFace(alternate, selection, true, theme, calvin.name).hue).toBe(
      presentFace(base, selection, true, theme, calvin.name).hue,
    );
  });

  it('refuses an alternate face whose theme has no selection', () => {
    expect(() => presentFace(alternate, {}, true, theme, calvin.name)).toThrow(/No presentation/);
  });
});
