import { Provider } from '@angular/core';
import { DEVICE_STORAGE } from './app/game/game-storage';
import { MemoryStorage } from './testing/memory-storage';

/**
 * Default providers for every unit test (angular.json `providersFile`). Each TestBed gets
 * fresh, empty device storage, so saved options, best scores and the sound preference
 * never leak from one test into the next. Specs override `DEVICE_STORAGE` when they need data.
 */
const providers: Provider[] = [{ provide: DEVICE_STORAGE, useFactory: () => new MemoryStorage() }];

export default providers;
