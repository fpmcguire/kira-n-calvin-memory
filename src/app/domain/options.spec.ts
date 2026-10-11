import {
  canGo,
  cardCount,
  defaultOptions,
  resetOptions,
  setFillCount,
  stepFillCount,
  withFill,
  withPlayer,
  withTheme,
} from './options';

const ten = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

describe('options', () => {
  it('defaults to all themes checked, the given single player and every toggle off', () => {
    const options = defaultOptions(ten, ['kira']);
    expect(options).toMatchObject({ players: ['kira'], variants: false, fill: false });
    expect(options.themes).toHaveLength(10);
    expect(cardCount(options)).toBe(20);
  });

  it('counts cards as themes x (1 or 2 pairs) x 2 without fill (R9)', () => {
    const one = withTheme(resetOptions(), 'a', true);
    expect(cardCount(one)).toBe(2);
    expect(cardCount({ ...one, variants: true })).toBe(4);
    expect(cardCount({ ...defaultOptions(ten, ['kira']), variants: true })).toBe(40);
  });

  it('uses the fill count exactly when fill is on (R8)', () => {
    expect(cardCount({ ...defaultOptions(ten, ['kira']), fill: true, fillCount: 12 })).toBe(12);
  });

  it('reset unchecks every player and theme and disables Go (R7)', () => {
    const reset = resetOptions();
    expect(reset.players).toEqual([]);
    expect(reset.themes).toEqual([]);
    expect(canGo(reset)).toBe(false);
    expect(cardCount(reset)).toBe(0);
  });

  it('needs at least one player and one theme for Go (R7, R4)', () => {
    const options = defaultOptions(ten, ['kira']);
    expect(canGo(options)).toBe(true);
    expect(canGo(withPlayer(options, 'kira', false))).toBe(false);
    expect(canGo({ ...options, themes: [] })).toBe(false);
  });

  it('counts cards from the themes alone, so the preview does not depend on players', () => {
    expect(cardCount(defaultOptions(ten, []))).toBe(20);
  });

  it('toggles a player without changing the other', () => {
    const both = withPlayer(defaultOptions(ten, ['kira']), 'calvin', true);
    expect([...both.players].sort()).toEqual(['calvin', 'kira']);
    expect(withPlayer(both, 'kira', false).players).toEqual(['calvin']);
  });

  it('starts fill at the current count rounded up to a multiple of 4 (DS-011)', () => {
    const three = { ...resetOptions(), themes: ['a', 'b', 'c'] }; // 6 cards
    expect(withFill(three, true).fillCount).toBe(8);
    expect(withFill({ ...three, variants: true }, true).fillCount).toBe(12);
    expect(withFill(defaultOptions(ten, ['kira']), true).fillCount).toBe(20);
    expect(withFill(resetOptions(), true).fillCount).toBe(4);
  });

  it('keeps the fill count in 4-40 steps of 4', () => {
    const options = { ...defaultOptions(ten, ['kira']), fill: true, fillCount: 40 };
    expect(stepFillCount(options, 1).fillCount).toBe(40);
    expect(stepFillCount({ ...options, fillCount: 4 }, -1).fillCount).toBe(4);
    expect(stepFillCount(options, -1).fillCount).toBe(36);
    expect(setFillCount(options, 17).fillCount).toBe(16);
  });

  it('toggles a theme without changing the others', () => {
    const options = defaultOptions(ten, ['kira']);
    const without = withTheme(options, 'c', false);
    expect(without.themes).toHaveLength(9);
    expect(without.themes).not.toContain('c');
    expect(withTheme(without, 'c', true).themes).toContain('c');
  });
});
