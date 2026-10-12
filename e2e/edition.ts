import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The slice of `edition.json` the browser specs read; the runtime validates the full contract. */
export interface EditionFile {
  readonly brand: { readonly logo: string };
  readonly themes: readonly {
    readonly id: string;
    readonly name: string;
    readonly art: {
      readonly assetPath: string;
      readonly viewBox: string;
      readonly slots: readonly {
        readonly id: string;
        readonly groups: readonly string[];
        readonly defaults: Readonly<Record<string, string>>;
      }[];
      readonly eligibleSlotTreatments: readonly {
        readonly slotId: string;
        readonly treatmentId: string;
        readonly properties: Readonly<Record<string, string>>;
      }[];
    };
  }[];
}

/** The edition the app serves: the single runtime source of truth for art, slots and treatments. */
export const edition: EditionFile = JSON.parse(
  readFileSync(join(__dirname, '..', 'public', 'content', 'kira-calvin', 'edition.json'), 'utf8'),
);
