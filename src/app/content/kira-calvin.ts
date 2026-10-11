import type { EditionContent } from './edition';

export const kiraCalvinEdition: EditionContent = {
  cutoff: { localDateTime: '2026-10-11T00:00', timeZone: 'America/Denver' },
  children: [
    { id: 'kira', name: 'Kira' },
    { id: 'calvin', name: 'Calvin' },
  ],
  themes: [
    { id: 'dance', name: 'Dance', child: 'kira', hue: 350 },
    { id: 'snowboard', name: 'Snowboard', child: 'kira', hue: 235 },
    { id: 'red-pandas', name: 'Red Pandas', child: 'kira', hue: 45 },
    { id: 'squishies', name: 'Squishies', child: 'kira', hue: 320 },
    { id: 'art', name: 'Art', child: 'kira', hue: 290 },
    { id: 'video-games', name: 'Video games', child: 'calvin', hue: 265 },
    { id: 'archery', name: 'Archery', child: 'calvin', hue: 140 },
    { id: 'rock-climbing', name: 'Rock climbing', child: 'calvin', hue: 75 },
    { id: 'drones', name: 'Drones', child: 'calvin', hue: 200 },
    { id: 'gymnastics', name: 'Gymnastics', child: 'calvin', hue: 15 },
  ],
  differenceTypes: ['color', 'pattern', 'accessory', 'orientation'],
  brand: { mark: 'K-n-C', gameTitle: 'Kira-n-Calvin Memory Game' },
  copy: { birthdayHeadline: 'Happy Birthday Kira!' },
};
