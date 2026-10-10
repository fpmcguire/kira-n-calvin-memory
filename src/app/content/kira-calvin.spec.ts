import { EditionContent } from './edition';
import { kiraCalvinEdition } from './kira-calvin';

/** The typed contract is what the engine and components rely on (R35, AC2). */
const edition: EditionContent = kiraCalvinEdition;

describe('Kira/Calvin edition content', () => {
  it('has the two children in header order, Kira then Calvin (DS-020)', () => {
    expect(edition.children.map((child) => child.id)).toEqual(['kira', 'calvin']);
  });

  it('has the ten approved themes, five per child, with unique IDs (R6)', () => {
    expect(edition.themes).toHaveLength(10);
    expect(new Set(edition.themes.map((theme) => theme.id)).size).toBe(10);
    expect(edition.themes.filter((theme) => theme.child === 'kira')).toHaveLength(5);
    expect(edition.themes.filter((theme) => theme.child === 'calvin')).toHaveLength(5);
  });

  it('holds the cutoff as data: 2026-10-11T00:00 America/Denver, Kira (R3)', () => {
    expect(edition.cutoff).toEqual({
      localDateTime: '2026-10-11T00:00',
      timeZone: 'America/Denver',
      player: 'kira',
    });
  });

  it('allows all four difference types, each once (R28, DS-009)', () => {
    expect([...edition.differenceTypes].sort()).toEqual([
      'accessory',
      'color',
      'orientation',
      'pattern',
    ]);
  });
});
