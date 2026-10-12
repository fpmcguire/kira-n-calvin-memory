import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app/app';

bootstrapApplication(App, appConfig).catch((err) => {
  console.error(err);
  // A bad or missing edition stops startup; say so plainly instead of leaving a blank page.
  const root = document.querySelector('app-root');
  if (root && root.childElementCount === 0) {
    root.textContent = 'Sorry, the game could not be loaded. Please try again later.';
  }
});
