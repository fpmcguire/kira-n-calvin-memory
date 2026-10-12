import { selectGamePresentation } from './presentation';
import { EligibleSlotTreatment } from './types';

/** Plays back fixed values in order, then repeats. */
function sequence(values: readonly number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

const entry = (slotId: string, value = '#000000'): EligibleSlotTreatment => ({
  slotId,
  treatmentId: `${slotId}-alt`,
  properties: { [`--${slotId}`]: value },
});

const THREE = [entry('a'), entry('b'), entry('c')];
const allowList = () => THREE;

describe('selectGamePresentation (R28, DS-009 3.9, AC4)', () => {
  it('maps every distinct theme once, in order, and no others', () => {
    const selection = selectGamePresentation(['t1', 't2', 't1'], allowList, () => 0);
    expect(Object.keys(selection)).toEqual(['t1', 't2']);
  });

  it('stores the complete treatment with the diamond-medallion cue', () => {
    const selection = selectGamePresentation(
      ['t1'],
      () => [entry('outfit', '#087f8c')],
      () => 0,
    );
    expect(selection['t1']).toEqual({
      slotId: 'outfit',
      treatmentId: 'outfit-alt',
      properties: { '--outfit': '#087f8c' },
      cueId: 'diamond-medallion',
    });
  });

  it('picks the entry at floor(random * n): exact uniform bucket boundaries', () => {
    const pick = (roll: number) => selectGamePresentation(['t'], allowList, () => roll)['t'].slotId;
    expect(pick(0)).toBe('a');
    expect(pick(1 / 3 - 1e-9)).toBe('a');
    expect(pick(1 / 3)).toBe('b');
    expect(pick(2 / 3 - 1e-9)).toBe('b');
    expect(pick(2 / 3)).toBe('c');
    expect(pick(0.999999)).toBe('c');
    // A source that returns exactly 1 must stay inside the list.
    expect(pick(1)).toBe('c');
  });

  it('is uniform: equally spaced rolls reach every entry the same number of times', () => {
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 300; i++) {
      counts[selectGamePresentation(['t'], allowList, () => (i + 0.5) / 300)['t'].slotId]++;
    }
    expect(counts).toEqual({ a: 100, b: 100, c: 100 });
  });

  it('weights no entry: a two-entry list splits at one half', () => {
    const two = () => [entry('x'), entry('y')];
    const pick = (roll: number) => selectGamePresentation(['t'], two, () => roll)['t'].slotId;
    expect(pick(0.4999)).toBe('x');
    expect(pick(0.5)).toBe('y');
  });

  it('draws one roll per theme, in the given theme order', () => {
    const selection = selectGamePresentation(
      ['t1', 't2', 't3'],
      allowList,
      sequence([0, 0.5, 0.9]),
    );
    expect(selection['t1'].slotId).toBe('a');
    expect(selection['t2'].slotId).toBe('b');
    expect(selection['t3'].slotId).toBe('c');
  });

  it('reads each theme from its own allow-list', () => {
    const lists: Record<string, EligibleSlotTreatment[]> = {
      t1: [entry('one'), entry('two')],
      t2: [entry('red'), entry('blue')],
    };
    const selection = selectGamePresentation(
      ['t1', 't2'],
      (id) => lists[id],
      () => 0.99,
    );
    expect(selection['t1'].slotId).toBe('two');
    expect(selection['t2'].slotId).toBe('blue');
  });

  it('rerolls to a different selection when the random source changes', () => {
    const themes = ['t1', 't2', 't3'];
    const first = selectGamePresentation(themes, allowList, sequence([0, 0.4, 0.8]));
    const second = selectGamePresentation(themes, allowList, sequence([0.8, 0.4, 0]));
    expect(second).not.toEqual(first);
  });

  it('returns an immutable selection', () => {
    const selection = selectGamePresentation(['t'], allowList, () => 0);
    expect(Object.isFrozen(selection)).toBe(true);
    expect(Object.isFrozen(selection['t'])).toBe(true);
  });

  it('creates nothing for no themes', () => {
    expect(selectGamePresentation([], allowList, () => 0)).toEqual({});
  });

  it('refuses a theme with nothing eligible', () => {
    expect(() =>
      selectGamePresentation(
        ['t'],
        () => [],
        () => 0,
      ),
    ).toThrow(RangeError);
  });
});
