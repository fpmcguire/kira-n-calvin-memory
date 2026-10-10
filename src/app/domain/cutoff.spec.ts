import { choosePlayer, isBeforeCutoff } from './cutoff';
import { Cutoff } from './types';

const cutoff: Cutoff = {
  localDateTime: '2026-10-11T00:00',
  timeZone: 'America/Denver',
  player: 'kira',
};
const children = ['kira', 'calvin'] as const;

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
      player: 'calvin',
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

describe('choosePlayer', () => {
  it('always returns the cutoff player before the cutoff', () => {
    expect(choosePlayer(true, cutoff, children, () => 0.99)).toBe('kira');
    expect(choosePlayer(true, cutoff, children, () => 0)).toBe('kira');
  });

  it('picks randomly between both children after the cutoff', () => {
    expect(choosePlayer(false, cutoff, children, () => 0)).toBe('kira');
    expect(choosePlayer(false, cutoff, children, () => 0.99)).toBe('calvin');
    expect(choosePlayer(false, cutoff, children, () => 1)).toBe('calvin');
  });
});
