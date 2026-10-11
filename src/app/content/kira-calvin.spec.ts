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

  it('gives every theme a face hue and the approved hue table (DS section 1.1)', () => {
    expect(Object.fromEntries(edition.themes.map((theme) => [theme.id, theme.hue]))).toEqual({
      dance: 350,
      snowboard: 235,
      'red-pandas': 45,
      squishies: 320,
      art: 290,
      'video-games': 265,
      archery: 140,
      'rock-climbing': 75,
      drones: 200,
      gymnastics: 15,
    });
  });

  it('maps every theme to one of the supplied activity SVGs, unchanged (R27, STEP-06)', () => {
    expect(Object.fromEntries(edition.themes.map((theme) => [theme.id, theme.art]))).toEqual({
      dance: 'content/kira-calvin/art/dance.svg',
      snowboard: 'content/kira-calvin/art/snowboard.svg',
      'red-pandas': 'content/kira-calvin/art/redpandas.svg',
      squishies: 'content/kira-calvin/art/squishies.svg',
      art: 'content/kira-calvin/art/art.svg',
      'video-games': 'content/kira-calvin/art/videogames.svg',
      archery: 'content/kira-calvin/art/archery.svg',
      'rock-climbing': 'content/kira-calvin/art/climbing.svg',
      drones: 'content/kira-calvin/art/drones.svg',
      gymnastics: 'content/kira-calvin/art/gymnastics.svg',
    });
  });

  it('keeps every art reference inside the edition folder with a distinct SVG file', () => {
    const files = edition.themes.map((theme) => theme.art);
    for (const file of files) {
      expect(file).toMatch(/^content\/kira-calvin\/art\/[a-z]+\.svg$/);
    }
    expect(new Set(files).size).toBe(files.length);
  });

  it('points the brand logo at the edition brand folder (R30)', () => {
    expect(edition.brand.logo).toBe('content/kira-calvin/brand/logo.svg');
  });

  it('holds the cutoff as data: 2026-10-11T00:00 America/Denver (R3)', () => {
    expect(edition.cutoff).toEqual({
      localDateTime: '2026-10-11T00:00',
      timeZone: 'America/Denver',
    });
  });

  it('offers only the accessory cue for the first integration (STEP-06, DS-009)', () => {
    expect(edition.differenceTypes).toEqual(['accessory']);
  });
});
