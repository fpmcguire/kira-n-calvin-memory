import { TestBed } from '@angular/core/testing';
import { CardBack } from './card-back';

function render(): HTMLElement {
  const fixture = TestBed.createComponent(CardBack);
  fixture.detectChanges();
  return fixture.nativeElement;
}

describe('CardBack', () => {
  it('draws the K-n-C logo file, decorative and with no text (R30)', () => {
    const host = render();
    const img = host.querySelector('img');
    expect(img?.getAttribute('src')).toMatch(/content\/kira-calvin\/brand\/logo\.svg$/);
    expect(img?.getAttribute('alt')).toBe('');
    expect(host.textContent?.trim()).toBe('');
  });

  it('is identical for every card, so the back reveals no face identity (R30, AC5)', () => {
    // Compare the markup inside the host: each TestBed root gets its own id attribute.
    expect(render().innerHTML).toBe(render().innerHTML);
  });
});
