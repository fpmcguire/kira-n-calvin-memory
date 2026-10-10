import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-greeting',
  styleUrl: './greeting.scss',
  templateUrl: './greeting.html',
})
export class Greeting {}
