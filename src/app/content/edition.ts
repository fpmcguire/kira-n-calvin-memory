import { InjectionToken } from '@angular/core';
import { ChildId, CssVariableName, Cutoff, EligibleSlotTreatment, ThemeId } from '../domain/types';

export interface ChildContent {
  readonly id: ChildId;
  readonly name: string;
}

/**
 * One structural slot of an activity SVG: the runtime recolors a slot by setting its
 * `defaults` variables. `groups` are the package's top-level group IDs, used for package
 * validation only and never as runtime selectors (R28, R35).
 */
export interface ArtSlot {
  readonly id: string;
  readonly groups: readonly string[];
  /** Every CSS variable the slot declares, with its manifest default color. */
  readonly defaults: Readonly<Record<CssVariableName, string>>;
}

/** An activity's structured SVG and everything the engine may vary in it (R27, R28, R35). */
export interface ActivityArtContent {
  /** Relative, same-origin path of the structured SVG, resolved against the document base (R34). */
  readonly assetPath: string;
  /** The declared square `viewBox` the SVG must carry. */
  readonly viewBox: string;
  readonly slots: readonly ArtSlot[];
  /** The confirmed allow-list: at least two slots, each with exactly one approved treatment. */
  readonly eligibleSlotTreatments: readonly EligibleSlotTreatment[];
}

export interface ThemeContent {
  readonly id: ThemeId;
  readonly name: string;
  readonly child: ChildId;
  /** OKLCH hue of the face background (DS 1.1). */
  readonly hue: number;
  readonly art: ActivityArtContent;
}

/**
 * Everything edition-specific, validated and immutable; the engine and components read it
 * through `EDITION` (R35). It is produced only by `parseEdition` from `edition.json`.
 */
export interface EditionContent {
  readonly schemaVersion: 1;
  readonly cutoff: Cutoff;
  readonly children: readonly ChildContent[];
  readonly themes: readonly ThemeContent[];
  readonly brand: {
    readonly mark: string;
    readonly gameTitle: string;
    /** Relative URL of the K-n-C logo: the shared card back and the generic splash mark (R30). */
    readonly logo: string;
  };
  readonly copy: { readonly birthdayHeadline: string };
}

/**
 * The loaded edition. Provided at startup after `edition.json` has been fetched and
 * validated (see `EditionSource`), so consumers always inject a complete, valid edition.
 */
export const EDITION = new InjectionToken<EditionContent>('EDITION');
