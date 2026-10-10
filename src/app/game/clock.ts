import { Service } from '@angular/core';

/** Supplies "now" so both sides of the cutoff are testable (architecture: Cutoff and Time). */
@Service()
export class Clock {
  now(): Date {
    return new Date();
  }
}
