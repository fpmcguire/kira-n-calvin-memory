import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-greeting',
  styleUrl: './greeting.scss',
  template: `
    <main>
      <h1>Happy Birthday, Kira!</h1>
      <p>We made something special for you.</p>
      <a class="game-link" routerLink="/game">Play the memory game</a>
    </main>
  `,
})
export class Greeting {}
