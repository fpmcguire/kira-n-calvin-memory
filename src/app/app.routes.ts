import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Happy Birthday, Kira!',
    loadComponent: () => import('./greeting/greeting').then((m) => m.Greeting),
  },
  {
    path: 'game',
    title: 'Memory Game',
    loadComponent: () => import('./game/game/game').then((m) => m.Game),
  },
  { path: '**', redirectTo: '' },
];
