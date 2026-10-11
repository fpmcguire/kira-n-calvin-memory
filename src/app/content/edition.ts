import { InjectionToken } from '@angular/core';
import { ChildId, Cutoff, DifferenceType, ThemeId } from '../domain/types';
import { kiraCalvinEdition } from './kira-calvin';

export interface ChildContent {
  readonly id: ChildId;
  readonly name: string;
}

export interface ThemeContent {
  readonly id: ThemeId;
  readonly name: string;
  readonly child: ChildId;
  /** OKLCH hue of the face background (DS §1.1). The color difference shifts it by 55 degrees (DS-009). */
  readonly hue: number;
  /** Static URL of the activity SVG, relative to the document base (R34, R35). Shared by both variants. */
  readonly art: string;
}

/** Everything edition-specific; the engine and components read it through `EDITION` (R35). */
export interface EditionContent {
  readonly cutoff: Cutoff;
  readonly children: readonly ChildContent[];
  readonly themes: readonly ThemeContent[];
  /** Difference types the edition's art supports; the engine picks one per theme per game (R28). */
  readonly differenceTypes: readonly DifferenceType[];
  readonly brand: {
    readonly mark: string;
    readonly gameTitle: string;
    /** Static URL of the K-n-C logo: the shared card back and the generic splash mark (R30). */
    readonly logo: string;
  };
  readonly copy: { readonly birthdayHeadline: string };
}

export const EDITION = new InjectionToken<EditionContent>('EDITION', {
  providedIn: 'root',
  factory: () => kiraCalvinEdition,
});
