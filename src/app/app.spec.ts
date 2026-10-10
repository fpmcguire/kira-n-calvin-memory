import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the greeting for Kira at the root with one h1', async () => {
    const harness = await RouterTestingHarness.create('/');
    const el = harness.routeNativeElement as HTMLElement;
    const headings = el.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toContain('Kira');
  });

  it('links to the game route', async () => {
    const harness = await RouterTestingHarness.create('/');
    const link = (harness.routeNativeElement as HTMLElement).querySelector('a.game-link');
    expect(link?.getAttribute('href')).toBe('/game');
  });

  it('navigates to the placeholder via the link without a reload', async () => {
    const harness = await RouterTestingHarness.create('/');
    const link = (harness.routeNativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a.game-link',
    );
    link?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Location).path()).toBe('/game');
    expect((harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Memory Game',
    );
  });
});
