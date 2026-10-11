import { formatElapsed } from './format-elapsed';

describe('formatElapsed', () => {
  it('formats m:ss and floors partial seconds', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(999)).toBe('0:00');
    expect(formatElapsed(1000)).toBe('0:01');
    expect(formatElapsed(59_999)).toBe('0:59');
    expect(formatElapsed(60_000)).toBe('1:00');
    expect(formatElapsed(3_725_000)).toBe('62:05');
  });

  it('never goes negative', () => {
    expect(formatElapsed(-5000)).toBe('0:00');
  });
});
