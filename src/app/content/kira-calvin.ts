import type { EditionContent } from './edition';

/** Static art lives under the edition-content folder so the engine never names a file (R35). */
const ART = 'content/kira-calvin/art';

export const kiraCalvinEdition: EditionContent = {
  cutoff: { localDateTime: '2026-10-11T00:00', timeZone: 'America/Denver' },
  children: [
    { id: 'kira', name: 'Kira' },
    { id: 'calvin', name: 'Calvin' },
  ],
  themes: [
    { id: 'dance', name: 'Dance', child: 'kira', hue: 350, art: `${ART}/dance.svg` },
    { id: 'snowboard', name: 'Snowboard', child: 'kira', hue: 235, art: `${ART}/snowboard.svg` },
    { id: 'red-pandas', name: 'Red Pandas', child: 'kira', hue: 45, art: `${ART}/redpandas.svg` },
    { id: 'squishies', name: 'Squishies', child: 'kira', hue: 320, art: `${ART}/squishies.svg` },
    { id: 'art', name: 'Art', child: 'kira', hue: 290, art: `${ART}/art.svg` },
    {
      id: 'video-games',
      name: 'Video games',
      child: 'calvin',
      hue: 265,
      art: `${ART}/videogames.svg`,
    },
    { id: 'archery', name: 'Archery', child: 'calvin', hue: 140, art: `${ART}/archery.svg` },
    {
      id: 'rock-climbing',
      name: 'Rock climbing',
      child: 'calvin',
      hue: 75,
      art: `${ART}/climbing.svg`,
    },
    { id: 'drones', name: 'Drones', child: 'calvin', hue: 200, art: `${ART}/drones.svg` },
    {
      id: 'gymnastics',
      name: 'Gymnastics',
      child: 'calvin',
      hue: 15,
      art: `${ART}/gymnastics.svg`,
    },
  ],
  // STEP-06 first integration (Moderator-approved): the only difference is the accessory cue,
  // a filled circle for `base` and a filled star for `alternate`. Color, pattern and
  // orientation randomization are not offered yet (R28, DS-009 deferred).
  differenceTypes: ['accessory'],
  brand: {
    mark: 'K-n-C',
    gameTitle: 'Kira-n-Calvin Memory Game',
    logo: 'content/kira-calvin/brand/logo.svg',
  },
  copy: { birthdayHeadline: 'Happy Birthday Kira!' },
};
