import type { EditionContent } from './edition';

export const kiraCalvinEdition: EditionContent = {
  cutoff: { localDateTime: '2026-10-11T00:00', timeZone: 'America/Denver', player: 'kira' },
  children: [
    { id: 'kira', name: 'Kira' },
    { id: 'calvin', name: 'Calvin' },
  ],
  themes: [
    { id: 'dance', name: 'Dance', child: 'kira' },
    { id: 'snowboard', name: 'Snowboard', child: 'kira' },
    { id: 'red-pandas', name: 'Red Pandas', child: 'kira' },
    { id: 'squishies', name: 'Squishies', child: 'kira' },
    { id: 'art', name: 'Art', child: 'kira' },
    { id: 'video-games', name: 'Video games', child: 'calvin' },
    { id: 'archery', name: 'Archery', child: 'calvin' },
    { id: 'rock-climbing', name: 'Rock climbing', child: 'calvin' },
    { id: 'drones', name: 'Drones', child: 'calvin' },
    { id: 'gymnastics', name: 'Gymnastics', child: 'calvin' },
  ],
  brand: { mark: 'K-n-C', gameTitle: 'Kira-n-Calvin Memory Game' },
  copy: { birthdayHeadline: 'Happy Birthday Kira!' },
};
