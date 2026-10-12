import { EditionContent } from './edition';
import {
  EditionValidationError,
  isRelativeEditionPath,
  isValidatedActivityArt,
  parseActivityArt,
  parseEdition,
} from './edition-parser';
import editionJson from '../../../public/content/kira-calvin/edition.json';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const fresh = (): Json => structuredClone(editionJson) as unknown as Json;
const art = (): Json => fresh()['themes'][0]['art'];

function invalid(mutate: (edition: Json) => void, message: RegExp): void {
  const edition = fresh();
  mutate(edition);
  expect(() => parseEdition(edition)).toThrow(EditionValidationError);
  expect(() => parseEdition(edition)).toThrow(message);
}

describe('parseEdition (R35, AC3)', () => {
  let edition: EditionContent;
  beforeAll(() => (edition = parseEdition(editionJson)));

  it('accepts the shipped edition', () => {
    expect(edition.themes).toHaveLength(10);
    expect(edition.children.map((child) => child.id)).toEqual(['kira', 'calvin']);
    expect(edition.cutoff).toEqual({
      localDateTime: '2026-10-11T00:00',
      timeZone: 'America/Denver',
    });
    expect(edition.brand.logo).toBe('content/kira-calvin/brand/logo.svg');
  });

  it('has the ten approved themes, five per child, with unique IDs and the approved hues', () => {
    expect(new Set(edition.themes.map((theme) => theme.id)).size).toBe(10);
    expect(edition.themes.filter((theme) => theme.child === 'kira')).toHaveLength(5);
    expect(edition.themes.filter((theme) => theme.child === 'calvin')).toHaveLength(5);
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

  it('keeps at least two eligible slots, one treatment each, for every activity (R28)', () => {
    for (const theme of edition.themes) {
      const eligible = theme.art.eligibleSlotTreatments;
      expect(eligible.length, theme.id).toBeGreaterThanOrEqual(2);
      expect(new Set(eligible.map((entry) => entry.slotId)).size).toBe(eligible.length);
      for (const entry of eligible) {
        const slot = theme.art.slots.find((candidate) => candidate.id === entry.slotId)!;
        expect(Object.keys(entry.properties).sort(), `${theme.id}/${slot.id}`).toEqual(
          Object.keys(slot.defaults).sort(),
        );
      }
    }
  });

  it('returns immutable content and registers its art as validated', () => {
    expect(Object.isFrozen(edition)).toBe(true);
    expect(Object.isFrozen(edition.themes[0].art.eligibleSlotTreatments[0].properties)).toBe(true);
    expect(isValidatedActivityArt(edition.themes[0].art)).toBe(true);
    expect(isValidatedActivityArt({ ...edition.themes[0].art })).toBe(false);
    expect(isValidatedActivityArt(null)).toBe(false);
  });

  it('refuses values that are not objects, and unknown or missing keys', () => {
    expect(() => parseEdition(null)).toThrow(EditionValidationError);
    expect(() => parseEdition([])).toThrow(EditionValidationError);
    invalid((e) => (e['extra'] = 1), /unexpected extra/);
    invalid((e) => delete e['brand'], /missing brand/);
    invalid((e) => (e['schemaVersion'] = 2), /schema version/);
  });

  it('refuses duplicate IDs and asset paths', () => {
    invalid((e) => (e['themes'][1]['id'] = e['themes'][0]['id']), /duplicate theme ID/);
    invalid(
      (e) => (e['themes'][1]['art']['assetPath'] = e['themes'][0]['art']['assetPath']),
      /duplicate asset path/,
    );
    invalid((e) => (e['themes'][0]['art']['slots'][1]['id'] = 'outfit'), /duplicate slot ID/);
    invalid(
      (e) =>
        (e['themes'][0]['art']['eligibleSlotTreatments'][1]['treatmentId'] =
          e['themes'][0]['art']['eligibleSlotTreatments'][0]['treatmentId']),
      /duplicate treatment ID/,
    );
    invalid(
      (e) => (e['themes'][0]['art']['eligibleSlotTreatments'][1]['slotId'] = 'outfit'),
      /duplicate eligible slot|must supply exactly/,
    );
  });

  it('refuses asset paths that are not relative and same-origin', () => {
    for (const path of [
      '/content/x.svg',
      '//evil.example/x.svg',
      'https://evil.example/x.svg',
      'javascript:alert(1).svg',
      '../outside/x.svg',
      'content/../../x.svg',
      'content\\x.svg',
      'content/x.svg?x=1',
      'content/x.svg#frag',
      'data:image/svg+xml;base64,AAAA.svg',
      '',
    ]) {
      invalid((e) => (e['themes'][0]['art']['assetPath'] = path), /relative same-origin|non-empty/);
    }
    invalid((e) => (e['themes'][0]['art']['assetPath'] = 'content/x.png'), /\.svg/);
    invalid((e) => (e['brand']['logo'] = 'https://evil.example/logo.svg'), /relative same-origin/);
  });

  it('refuses a viewBox that is not square or not anchored at the origin', () => {
    invalid((e) => (e['themes'][0]['art']['viewBox'] = '0 0 200 100'), /square/);
    invalid((e) => (e['themes'][0]['art']['viewBox'] = '10 10 200 200'), /square/);
    invalid((e) => (e['themes'][0]['art']['viewBox'] = '0 0 0 0'), /square/);
  });

  it('refuses fewer than two eligible slots (R28, AC16)', () => {
    invalid((e) => e['themes'][0]['art']['eligibleSlotTreatments'].pop(), /at least 2/);
    invalid((e) => (e['themes'][0]['art']['eligibleSlotTreatments'] = []), /at least 2/);
  });

  it('refuses a treatment for an undeclared slot', () => {
    invalid(
      (e) => (e['themes'][0]['art']['eligibleSlotTreatments'][0]['slotId'] = 'nothing'),
      /not declared/,
    );
  });

  it('requires a treatment to cover exactly the slot variables', () => {
    const helmet = (e: Json) => {
      const snowboard = e['themes'].find((theme: Json) => theme['id'] === 'snowboard');
      return snowboard['art']['eligibleSlotTreatments'].find(
        (entry: Json) => entry['slotId'] === 'helmet',
      );
    };
    invalid((e) => delete helmet(e)['properties']['--helmet-2'], /must supply exactly/);
    invalid((e) => (helmet(e)['properties']['--extra'] = '#000000'), /must supply exactly/);
  });

  it('accepts only hex colors and custom-property names', () => {
    for (const value of ['red', 'url(http://evil)', 'var(--x)', '#12', '#gggggg', 'rgb(0,0,0)']) {
      invalid(
        (e) =>
          (e['themes'][0]['art']['eligibleSlotTreatments'][0]['properties']['--outfit'] = value),
        /not a #rgb or #rrggbb/,
      );
    }
    invalid(
      (e) => (e['themes'][0]['art']['slots'][0]['defaults']['not-a-variable'] = '#000000'),
      /custom-property name/,
    );
  });

  it('refuses unknown children, hues out of range and bad cutoffs', () => {
    invalid((e) => (e['children'][0]['id'] = 'sam'), /not a known child/);
    invalid((e) => (e['themes'][0]['child'] = 'sam'), /not a declared child/);
    invalid((e) => (e['themes'][0]['hue'] = 400), /hue|0 to under 360/);
    invalid((e) => (e['cutoff']['timeZone'] = 'Not/AZone'), /not a time zone/);
    invalid((e) => (e['cutoff']['localDateTime'] = 'yesterday'), /YYYY-MM-DDTHH:mm/);
  });
});

describe('parseActivityArt', () => {
  it('validates one activity record on its own', () => {
    expect(isValidatedActivityArt(parseActivityArt(art()))).toBe(true);
  });
});

describe('isRelativeEditionPath', () => {
  it('accepts plain relative paths only', () => {
    expect(isRelativeEditionPath('content/kira-calvin/art/kira-dance.svg')).toBe(true);
    expect(isRelativeEditionPath('edition.json')).toBe(true);
    for (const path of ['/a', '//a', 'a/../b', './a', 'a//b', 'a:b', 'a b', 5, null, undefined]) {
      expect(isRelativeEditionPath(path), String(path)).toBe(false);
    }
  });
});
