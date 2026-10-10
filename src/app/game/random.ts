import { Service } from '@angular/core';

/** Supplies randomness so player selection is testable. */
@Service()
export class Random {
  next(): number {
    return Math.random();
  }
}
