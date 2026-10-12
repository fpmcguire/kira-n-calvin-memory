import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { EDITION } from './content/edition';
import { EditionSource } from './content/edition-source';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // The edition is fetched and validated before the app renders, so every consumer injects
    // a complete `EditionContent`; invalid content fails startup with a controlled error (R35).
    provideAppInitializer(async () => {
      await inject(EditionSource).load();
    }),
    { provide: EDITION, useFactory: () => inject(EditionSource).content },
  ],
};
