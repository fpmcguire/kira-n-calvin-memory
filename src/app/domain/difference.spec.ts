import { assignDifferences, cueFor, faceCue } from './difference';
import { DifferenceType } from './types';

const ALL: readonly DifferenceType[] = ['color', 'pattern', 'accessory', 'orientation'];

/** Plays back fixed values in order, then repeats. */
function sequence(values: readonly number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe('assignDifferences (R28, DS-009, AC13)', () => {
  it('assigns one type to each selected theme and no others', () => {
    const assignment = assignDifferences(['a', 'b', 'c'], ALL, sequence([0, 0.3, 0.6]));
    expect(Object.keys(assignment)).toEqual(['a', 'b', 'c']);
  });

  it('reaches every allowed type through the random source', () => {
    const assignment = assignDifferences(['a', 'b', 'c', 'd'], ALL, sequence([0, 0.25, 0.5, 0.75]));
    expect(assignment).toEqual({
      a: 'color',
      b: 'pattern',
      c: 'accessory',
      d: 'orientation',
    });
  });

  it('re-rolls to different types when the random source changes', () => {
    const themes = ['a', 'b', 'c', 'd'];
    const first = assignDifferences(themes, ALL, sequence([0, 0.25, 0.5, 0.75]));
    const second = assignDifferences(themes, ALL, sequence([0.75, 0.5, 0.25, 0]));
    expect(second).not.toEqual(first);
  });

  it('draws only from the allowed types, even for a roll of exactly 1', () => {
    const assignment = assignDifferences(['a', 'b'], ['pattern', 'accessory'], sequence([1, 0]));
    expect(assignment).toEqual({ a: 'accessory', b: 'pattern' });
  });

  it('can assign a different type to each theme in the same game', () => {
    const assignment = assignDifferences(['a', 'b'], ALL, sequence([0, 0.5]));
    expect(assignment['a']).not.toBe(assignment['b']);
  });

  it('refuses an empty allowed list', () => {
    expect(() => assignDifferences(['a'], [], () => 0)).toThrow(RangeError);
  });
});

describe('cues (DS-009, R29)', () => {
  it('always carries the dot-pattern secondary cue for color differences', () => {
    expect(cueFor('color')).toEqual({ difference: 'color', secondaryCue: 'dot-pattern' });
  });

  it('needs no secondary cue for pattern, accessory or orientation', () => {
    for (const difference of ['pattern', 'accessory', 'orientation'] as const) {
      expect(cueFor(difference)).toEqual({ difference, secondaryCue: null });
    }
  });

  it('gives both variants of a color theme the secondary cue when variants are on', () => {
    const differences = { a: 'color', b: 'pattern' } as const;
    expect(faceCue({ themeId: 'a', variantId: 'base' }, differences, true).secondaryCue).toBe(
      'dot-pattern',
    );
    expect(faceCue({ themeId: 'a', variantId: 'alternate' }, differences, true).secondaryCue).toBe(
      'dot-pattern',
    );
    expect(faceCue({ themeId: 'b', variantId: 'alternate' }, differences, true)).toEqual({
      difference: 'pattern',
      secondaryCue: null,
    });
  });

  it('shows no cue at all when variants are off', () => {
    expect(faceCue({ themeId: 'a', variantId: 'base' }, { a: 'color' }, false)).toEqual({
      difference: null,
      secondaryCue: null,
    });
  });

  it('shows no cue for a theme that was not assigned a difference', () => {
    expect(
      faceCue({ themeId: 'z', variantId: 'base' }, { a: 'color' }, true).difference,
    ).toBeNull();
  });
});
