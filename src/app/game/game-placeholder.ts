import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-game-placeholder',
  styleUrl: '../greeting/greeting.scss',
  template: `
    <main>
      <h1>Memory Game</h1>
      <p>The game is coming soon.</p>
      <a class="game-link" routerLink="/">Back to the greeting</a>
    </main>
  `,
})
export class GamePlaceholder {}
