import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EDITION } from '../../content/edition';

/**
 * The K-n-C logo that is the back of every card (R30, DS-008). It carries no face
 * information: the same static image is drawn for every card, face-down or face-up.
 */
@Component({
  selector: 'app-card-back',
  imports: [NgOptimizedImage],
  styleUrl: './card-back.scss',
  templateUrl: './card-back.html',
})
export class CardBack {
  protected readonly edition = inject(EDITION);
}
