import { fitBoard } from './fit-board';

/** Representative table content boxes (viewport minus header and 16 px padding). */
const PHONE_PORTRAIT = { width: 358, height: 520 };
const PHONE_LANDSCAPE = { width: 780, height: 220 };
const TABLET_PORTRAIT = { width: 736, height: 840 };
const TABLET_LANDSCAPE = { width: 992, height: 560 };
const SIZES = { PHONE_PORTRAIT, PHONE_LANDSCAPE, TABLET_PORTRAIT, TABLET_LANDSCAPE };

describe('fitBoard', () => {
  for (const [name, size] of Object.entries(SIZES)) {
    for (const count of [4, 20, 40]) {
      it(`${count} cards on ${name} fit with whole rows, a minimum size and the 220 px cap`, () => {
        const { columns, cardWidth, gap } = fitBoard(count, size.width, size.height);
        const min = size.width < 520 ? 52 : 64;
        expect(cardWidth).toBeGreaterThanOrEqual(min);
        expect(cardWidth).toBeLessThanOrEqual(220);
        expect(columns).toBeGreaterThanOrEqual(1);
        expect(columns).toBeLessThanOrEqual(count);
        const gridWidth = columns * cardWidth + (columns - 1) * gap;
        expect(gridWidth).toBeLessThanOrEqual(size.width);
      });
    }
  }

  it('uses the whole table when it is roomy: 4 cards in a tablet get the cap', () => {
    expect(fitBoard(4, 992, 560).cardWidth).toBeLessThanOrEqual(220);
    expect(fitBoard(4, 992, 560).cardWidth).toBeGreaterThan(150);
  });

  it('stays inside the table height when the minimum size allows it', () => {
    const { columns, cardWidth, gap } = fitBoard(20, 992, 560);
    const rows = Math.ceil(20 / columns);
    const gridHeight = rows * cardWidth * (4 / 3) + (rows - 1) * gap;
    expect(gridHeight).toBeLessThanOrEqual(560 + 1);
  });

  it('falls back to the minimum card and lets the table scroll when 40 cards cannot fit', () => {
    const { columns, cardWidth, gap } = fitBoard(40, 328, 300);
    expect(cardWidth).toBe(52);
    expect(gap).toBe(6);
    expect(columns).toBe(Math.floor((328 + 6) / (52 + 6)));
    const rows = Math.ceil(40 / columns);
    expect(rows * cardWidth * (4 / 3) + (rows - 1) * gap).toBeGreaterThan(300);
  });

  it('uses the larger gap and minimum from 520 px wide tables', () => {
    expect(fitBoard(20, 519, 400).gap).toBe(6);
    expect(fitBoard(20, 520, 400).gap).toBe(10);
  });

  it('never returns more columns than cards', () => {
    expect(fitBoard(2, 2000, 2000).columns).toBeLessThanOrEqual(2);
    expect(fitBoard(1, 100, 100).columns).toBe(1);
  });

  it('returns a single usable layout before measurement or with no cards', () => {
    expect(fitBoard(20, 0, 0)).toEqual({ columns: 20, cardWidth: 80, gap: 6 });
    expect(fitBoard(0, 500, 500).columns).toBe(1);
  });
});
