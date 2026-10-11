import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { FacePresentation } from './face-presentation';

/**
 * One card face, scaled by container units so the same composition renders in the grid
 * and in the large reveal (OBS-004, DS-008, DS-009). The activity art is the same file for
 * both variants; the badge is the only visible variant cue. Presentation only; the parent
 * supplies the accessible name.
 */
@Component({
  selector: 'app-card-face',
  imports: [NgOptimizedImage],
  host: {
    '[attr.data-child]': 'face().child',
    '[attr.data-pattern]': 'face().pattern',
    '[attr.data-badge]': 'face().badge',
    '[attr.data-mirrored]': 'face().mirrored',
    '[style.--hue]': 'face().hue',
  },
  styleUrl: './card-face.scss',
  templateUrl: './card-face.html',
})
export class CardFace {
  readonly face = input.required<FacePresentation>();
}
