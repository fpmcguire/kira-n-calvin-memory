import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sanitizeActivitySvg } from './activity-svg-sanitizer';
import { parseEdition } from './edition-parser';
import editionJson from '../../../public/content/kira-calvin/edition.json';

/**
 * Build/test cross-validator (AC3): `edition.json` against every structured SVG it names and
 * against the Designer/Moderator source package. Run alone with `npm run validate:edition`.
 */

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const edition = parseEdition(editionJson);

interface ManifestEntry {
  readonly file: string;
  readonly owner: string;
  readonly activity: string;
  readonly viewBox: string;
  readonly nonVariant: readonly { id: string; part: string }[];
  readonly variant: readonly { slot: string; groups: string[]; vars: [string, string][] }[];
}
const manifest = JSON.parse(read('resources/art/manifest.json')) as ManifestEntry[];
const basename = (path: string) => path.slice(path.lastIndexOf('/') + 1);

/** DS-009 3.9.1 and 3.9.2, transcribed: eligible slot -> approved alternate values. */
const APPROVED: Record<string, Record<string, Record<string, string>>> = {
  dance: { outfit: { '--outfit': '#087f8c' }, skirt: { '--skirt': '#9b3f70' } },
  art: {
    easel: { '--easel': '#1f6f8b' },
    bottoms: { '--bottoms': '#a33f73' },
    top: { '--top': '#e1a21a' },
    palette: { '--palette': '#b44358' },
  },
  snowboard: {
    board: { '--board': '#f2b84b' },
    bottoms: { '--bottoms': '#f0a51a' },
    top: { '--top': '#7a3e9d' },
    helmet: { '--helmet': '#1f7a75', '--helmet-2': '#ffd166' },
  },
  'red-pandas': { bottoms: { '--bottoms': '#a33f73' }, top: { '--top': '#e1a21a' } },
  squishies: {
    top: { '--top': '#e1a21a' },
    bottoms: { '--bottoms': '#a33f73' },
    'squishy-pink': { '--squishy-pink': '#167c80' },
  },
  'video-games': { bottoms: { '--bottoms': '#f2b84b' }, top: { '--top': '#67cdbd' } },
  archery: {
    target: { '--target': '#2468b4' },
    bottoms: { '--bottoms': '#f2b84b' },
    top: { '--top': '#2468b4' },
    cap: { '--cap': '#f2b84b' },
  },
  'rock-climbing': { bottoms: { '--bottoms': '#f2b84b' }, top: { '--top': '#7a3e9d' } },
  drones: {
    drone: { '--drone': '#e1a21a', '--drone-2': '#a33f73' },
    bottoms: { '--bottoms': '#f2b84b' },
    top: { '--top': '#67cdbd' },
  },
  gymnastics: {
    mat: { '--mat': '#f2b84b' },
    bottoms: { '--bottoms': '#f2b84b' },
    top: { '--top': '#67cdbd' },
  },
};

describe('edition.json against the structured SVG package', () => {
  it('names exactly the ten child-prefixed activity files and no flat file remains', () => {
    const served = readdirSync(join(root, 'public/content/kira-calvin/art'), {
      withFileTypes: true,
    })
      .map((entry) => entry.name)
      .sort();
    expect(served).toEqual(edition.themes.map((theme) => basename(theme.art.assetPath)).sort());
    expect(served.every((name) => /^(kira|calvin)-[a-z-]+\.svg$/.test(name))).toBe(true);
  });

  for (const theme of edition.themes) {
    describe(theme.id, () => {
      const file = basename(theme.art.assetPath);
      const source = manifest.find((entry) => entry.file === file);

      it('is served unchanged from the source package', () => {
        expect(read(`public/${theme.art.assetPath}`)).toBe(read(`resources/art/${file}`));
      });

      it('passes the strict sanitizer against its own contract', () => {
        const out = sanitizeActivitySvg(read(`public/${theme.art.assetPath}`), theme.art);
        expect(out.startsWith('<svg')).toBe(true);
        expect(out).not.toMatch(/<script|foreignObject|onload|href=/);
      });

      it('declares exactly the manifest slots, groups, variables and defaults', () => {
        expect(source, `${file} is in manifest.json`).toBeDefined();
        expect(theme.art.viewBox).toBe(source!.viewBox);
        expect(
          theme.art.slots.map((slot) => ({
            slot: slot.id,
            groups: slot.groups,
            vars: Object.entries(slot.defaults),
          })),
        ).toEqual(source!.variant);
      });

      it('has the same non-variant groups as the source package', () => {
        const document = new DOMParser().parseFromString(
          read(`public/${theme.art.assetPath}`),
          'image/svg+xml',
        );
        const groups = Array.from(document.documentElement.children)
          .filter((group) => group.getAttribute('data-group') === 'non-variant')
          .map((group) => ({ id: group.id, part: group.getAttribute('data-part') }));
        expect(groups).toEqual(source!.nonVariant);
        const root = document.documentElement;
        expect(root.getAttribute('data-owner')).toBe(source!.owner);
        expect(root.getAttribute('data-activity')).toBe(source!.activity);
      });

      it('declares exactly the manifest owner, activity and non-variant IDs and parts', () => {
        expect(theme.art.owner).toBe(source!.owner);
        expect(theme.art.activity).toBe(source!.activity);
        expect(theme.art.nonVariantGroups).toEqual(source!.nonVariant);
      });

      it('keeps the confirmed allow-list with the approved treatments (DS-009 3.9.1-3.9.2)', () => {
        const approved = APPROVED[theme.id];
        expect(
          Object.fromEntries(
            theme.art.eligibleSlotTreatments.map((entry) => [entry.slotId, entry.properties]),
          ),
        ).toEqual(approved);
        expect(Object.keys(approved).length).toBeGreaterThanOrEqual(2);
        const eligible = new Set(Object.keys(approved));
        const excluded = theme.art.slots.filter((slot) => !eligible.has(slot.id));
        for (const slot of excluded) {
          expect(
            theme.art.eligibleSlotTreatments.some((entry) => entry.slotId === slot.id),
            slot.id,
          ).toBe(false);
        }
      });
    });
  }

  it('serves the supplied logo unchanged', () => {
    expect(read(`public/${edition.brand.logo}`)).toBe(read('resources/art/logo.svg'));
  });
});

describe('reusable engine and presentation code', () => {
  /** Every source file outside the content package that is not a spec or test support. */
  function sources(directory: string): string[] {
    return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        return sources(path);
      }
      return /\.(ts|html|scss)$/.test(entry.name) && !entry.name.endsWith('.spec.ts') ? [path] : [];
    });
  }
  const files = sources('src/app');

  it('names no activity file, treatment color or manifest default', () => {
    const forbidden = new Set<string>(edition.themes.map((theme) => basename(theme.art.assetPath)));
    for (const theme of edition.themes) {
      for (const slot of theme.art.slots) {
        Object.values(slot.defaults).forEach((color) => forbidden.add(color.toLowerCase()));
      }
      for (const entry of theme.art.eligibleSlotTreatments) {
        Object.values(entry.properties).forEach((color) => forbidden.add(color.toLowerCase()));
      }
    }
    // The medallion's cream and navy are its own approved cue colors (DS-009 3.9.3), and short
    // hex forms such as #fff are ordinary UI colors, not edition palette values.
    forbidden.delete('#17233f');
    forbidden.delete('#fff7e8');
    for (const token of [...forbidden]) {
      if (token.startsWith('#') && token.length < 7) {
        forbidden.delete(token);
      }
    }
    const offenders = files.flatMap((path) => {
      const text = read(path).toLowerCase();
      return [...forbidden]
        .filter((token) => text.includes(token))
        .map((token) => `${path}: ${token}`);
    });
    expect(offenders).toEqual([]);
  });

  it('names no child ID or child name in engine or presentation logic (R35)', () => {
    // Styling tokens such as `[data-child='kira']` in .scss are the edition's visual identity
    // and are outside this check; every .ts and .html file must stay child-agnostic.
    const quoted = edition.children.flatMap((child) => [child.id, child.name]);
    const keyed = edition.children.map((child) => child.id);
    const logic = files.filter((path) => /\.(ts|html)$/.test(path));
    const offenders = logic.flatMap((path) => {
      const text = read(path);
      return [
        ...quoted
          .filter((token) => new RegExp(`(['"\`])${token}\\1`, 'i').test(text))
          .map((token) => `${path}: quoted "${token}"`),
        ...keyed
          .filter((token) => new RegExp(`(?:^|[\\s{,])${token}\\s*:`, 'i').test(text))
          .map((token) => `${path}: key ${token}`),
      ];
    });
    expect(offenders).toEqual([]);
  });

  it('names no slot ID or variable in rendering and domain logic', () => {
    const slotIds = new Set(
      edition.themes.flatMap((theme) => theme.art.slots.map((slot) => slot.id)),
    );
    const variables = new Set(
      edition.themes.flatMap((theme) =>
        theme.art.slots.flatMap((slot) => Object.keys(slot.defaults)),
      ),
    );
    const logic = files.filter((path) => /\.(ts|html)$/.test(path));
    const offenders = logic.flatMap((path) => {
      const text = read(path);
      return [...variables]
        .filter((token) => text.includes(token))
        .concat(
          [...slotIds].filter((slot) => text.includes(`'${slot}'`) || text.includes(`"${slot}"`)),
        )
        .map((token) => `${path}: ${token}`);
    });
    expect(offenders).toEqual([]);
  });

  it('calls a Angular trust-bypass API only inside the SVG repository (AC8)', () => {
    const bypassing = files.filter((path) => /bypassSecurityTrust/.test(read(path)));
    expect(bypassing).toEqual(['src/app/game/activity-svg-repository.ts']);
  });

  it('binds inline markup only in the shared card face', () => {
    const binding = files.filter((path) =>
      /innerHTML|outerHTML|insertAdjacentHTML/.test(read(path)),
    );
    expect(binding).toEqual(['src/app/game/card-face/card-face.html']);
  });

  it('leaves no trace of the retired difference types or hooks', () => {
    const retired =
      /DifferenceType|data-difference|differenceTypes|\bFaceCue\b|data-badge|data-pattern/;
    expect(files.filter((path) => retired.test(read(path)))).toEqual([]);
  });
});
