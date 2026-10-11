import { Component, input } from '@angular/core';
import { FacePresentation } from './face-presentation';

/**
 * One placeholder card face, scaled by container units so the same composition renders
 * in the grid and in the large reveal (OBS-004, DS-008, DS-009). Presentation only; the
 * parent supplies the accessible name.
 */
@Component({
  selector: 'app-card-face',
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
