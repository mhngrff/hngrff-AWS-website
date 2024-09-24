import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Test1Component } from './test1/test1.component' //THIS IS NEEDED

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Test1Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hngrff-angular-app';
}
