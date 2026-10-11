import { isBeforeCutoff, showsBirthdaySplash } from './cutoff';
import { Cutoff } from './types';

const cutoff: Cutoff = {
  localDateTime: '2026-10-11T00:00',
  timeZone: 'America/Denver',
};

describe('isBeforeCutoff', () => {
  it('is before one second ahead of midnight Colorado time (MDT, 05:59:59Z)', () => {
    expect(isBeforeCutoff(new Date('2026-10-11T05:59:59Z'), cutoff)).toBe(true);
  });

  it('is after at midnight Colorado time (06:00:00Z)', () => {
    expect(isBeforeCutoff(new Date('2026-10-11T06:00:00Z'), cutoff)).toBe(false);
  });

  it('is before at the last millisecond, after exactly at, and after just past the cutoff (AC3)', () => {
    expect(isBeforeCutoff(new Date('2026-10-11T05:59:59.999Z'), cutoff)).toBe(true);
    expect(isBeforeCutoff(new Date('2026-10-11T06:00:00.000Z'), cutoff)).toBe(false);
    expect(isBeforeCutoff(new Date('2026-10-11T06:00:00.001Z'), cutoff)).toBe(false);
  });

  it('is driven by the cutoff record: another zone and time move the boundary', () => {
    const auckland: Cutoff = {
      localDateTime: '2026-12-25T09:30',
      timeZone: 'Pacific/Auckland',
    };
    // NZDT is UTC+13, so 09:30 local is 20:30Z on Dec 24.
    expect(isBeforeCutoff(new Date('2026-12-24T20:29:59.999Z'), auckland)).toBe(true);
    expect(isBeforeCutoff(new Date('2026-12-24T20:30:00.000Z'), auckland)).toBe(false);
  });

  it('uses the cutoff time zone, not UTC: 03:00Z on Oct 11 is still Oct 10 evening in Denver', () => {
    expect(isBeforeCutoff(new Date('2026-10-11T03:00:00Z'), cutoff)).toBe(true);
  });

  it('is before on an ordinary earlier day and after on a later day', () => {
    expect(isBeforeCutoff(new Date('2026-09-01T12:00:00Z'), cutoff)).toBe(true);
    expect(isBeforeCutoff(new Date('2026-12-25T12:00:00Z'), cutoff)).toBe(false);
  });
});

describe('showsBirthdaySplash', () => {
  const after = new Date('2026-10-11T06:00:00Z');
  const before = new Date('2026-10-10T18:00:00Z');

  it('follows the cutoff when the permanent birthday flag is off (R2, R3)', () => {
    expect(showsBirthdaySplash(before, cutoff, false)).toBe(true);
    expect(showsBirthdaySplash(after, cutoff, false)).toBe(false);
  });

  it('shows the birthday splash after the cutoff when the permanent birthday flag is on', () => {
    expect(showsBirthdaySplash(before, cutoff, true)).toBe(true);
    expect(showsBirthdaySplash(after, cutoff, true)).toBe(true);
  });
});
