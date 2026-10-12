import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ActivityArtContent } from '../../content/edition';
import { ActivitySvgRepository } from '../activity-svg-repository';
import { FacePresentation } from './face-presentation';

/**
 * One card face, scaled by container units so the same composition renders in the grid
 * and in the large reveal (OBS-004, DS-008, DS-009). The activity art is one structured
 * SVG shared by both variants and rendered inline, so the selected slot's validated custom
 * properties set on the art wrapper recolor exactly that slot. The diamond medallion is the
 * only variant cue and exists only for an alternate face with a treatment.
 *
 * This component is the visible-face root: the test hooks below describe the face it draws,
 * and a down or gone board card does not instantiate it at all. Presentation only; the
 * parent supplies the accessible name. It takes a typed presentation, never markup.
 */
@Component({
  selector: 'app-card-face',
  host: {
    '[attr.data-child]': 'face().child',
    '[attr.data-variant-slot]': 'face().treatment?.slotId ?? null',
    '[attr.data-treatment-id]': 'face().treatment?.treatmentId ?? null',
    '[attr.data-cue-present]': 'face().cuePresent',
    '[class.reveal]': "size() === 'reveal'",
    '[style.--hue]': 'face().hue',
  },
  styleUrl: './card-face.scss',
  templateUrl: './card-face.html',
})
export class CardFace {
  readonly face = input.required<FacePresentation>();
  /** `reveal` uses the fixed 28 px medallion of the large reveal (DS-009 3.9.3). */
  readonly size = input<'card' | 'reveal'>('card');

  private readonly repository = inject(ActivitySvgRepository);
  private readonly loaded = signal<{ art: ActivityArtContent; markup: SafeHtml } | null>(null);

  /** Custom properties of the selected slot only; null for base faces so defaults show. */
  protected readonly artStyle = computed(() => this.face().treatment?.properties ?? null);

  /** Trusted, sanitized markup from the repository, or null while loading or after a failure. */
  protected readonly markup = computed<SafeHtml | null>(() => {
    const art = this.face().art;
    const loaded = this.loaded();
    return this.repository.cached(art) ?? (loaded?.art === art ? loaded.markup : null);
  });

  constructor() {
    effect((onCleanup) => {
      const art = this.face().art;
      if (this.repository.cached(art)) {
        return;
      }
      let current = true;
      onCleanup(() => (current = false));
      this.repository
        .load(art)
        .then((markup) => current && this.loaded.set({ art, markup }))
        // The repository has already reported the failure; the face keeps its fallback.
        .catch(() => undefined);
    });
  }
}
