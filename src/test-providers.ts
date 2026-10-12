import { Provider } from '@angular/core';
import { ASSET_FETCH } from './app/content/asset-url';
import { EDITION } from './app/content/edition';
import { parseEdition } from './app/content/edition-parser';
import { DEVICE_STORAGE } from './app/game/game-storage';
import { MemoryStorage } from './testing/memory-storage';
import { publicFetch } from './testing/public-assets';
import editionJson from '../public/content/kira-calvin/edition.json';

/**
 * Default providers for every unit test (angular.json `providersFile`). Each TestBed gets
 * fresh, empty device storage, so saved options, best scores and the sound preference
 * never leak from one test into the next, and the shipped `edition.json` validated through
 * the same `parseEdition` the app uses. Specs override any token when they need other data.
 */
const providers: Provider[] = [
  { provide: DEVICE_STORAGE, useFactory: () => new MemoryStorage() },
  { provide: EDITION, useFactory: () => parseEdition(editionJson) },
  // Activity art and edition JSON come from `public/` on disk; no test touches the network.
  { provide: ASSET_FETCH, useFactory: () => publicFetch() },
];

export default providers;
