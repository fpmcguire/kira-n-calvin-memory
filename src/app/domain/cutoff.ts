import { Cutoff } from './types';

/** Wall-clock time of `now` in `timeZone`, formatted `YYYY-MM-DDTHH:mm`. */
function wallClock(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** True while `now` is strictly before the cutoff in the cutoff's own time zone (R3). Splash only (R2). */
export function isBeforeCutoff(now: Date, cutoff: Cutoff): boolean {
  return wallClock(now, cutoff.timeZone) < cutoff.localDateTime;
}

/**
 * True when the birthday splash shows: always in a build with the permanent birthday flag,
 * otherwise only before the cutoff (R2, R3).
 */
export function showsBirthdaySplash(now: Date, cutoff: Cutoff, permanent: boolean): boolean {
  return permanent || isBeforeCutoff(now, cutoff);
}
