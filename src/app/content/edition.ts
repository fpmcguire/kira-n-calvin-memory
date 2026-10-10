import { InjectionToken } from '@angular/core';
import { ChildId, Cutoff, ThemeId } from '../domain/types';
import { kiraCalvinEdition } from './kira-calvin';

export interface ChildContent {
  readonly id: ChildId;
  readonly name: string;
}

export interface ThemeContent {
  readonly id: ThemeId;
  readonly name: string;
  readonly child: ChildId;
}

/** Everything edition-specific; the engine and components read it through `EDITION` (R35). */
export interface EditionContent {
  readonly cutoff: Cutoff;
  readonly children: readonly ChildContent[];
  readonly themes: readonly ThemeContent[];
  readonly brand: { readonly mark: string; readonly gameTitle: string };
  readonly copy: { readonly birthdayHeadline: string };
}

export const EDITION = new InjectionToken<EditionContent>('EDITION', {
  providedIn: 'root',
  factory: () => kiraCalvinEdition,
});
