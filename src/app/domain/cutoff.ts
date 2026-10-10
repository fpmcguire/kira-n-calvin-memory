import { ChildId, Cutoff } from './types';

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

/** True while `now` is strictly before the cutoff in the cutoff's own time zone (R3). */
export function isBeforeCutoff(now: Date, cutoff: Cutoff): boolean {
  return wallClock(now, cutoff.timeZone) < cutoff.localDateTime;
}

/**
 * Chooses the single player or the first player (R4, DS-020): the cutoff player
 * before the cutoff, otherwise one of the two children at random.
 */
export function choosePlayer(
  beforeCutoff: boolean,
  cutoff: Cutoff,
  children: readonly ChildId[],
  random: () => number,
): ChildId {
  if (beforeCutoff) {
    return cutoff.player;
  }
  return children[Math.min(children.length - 1, Math.floor(random() * children.length))];
}
