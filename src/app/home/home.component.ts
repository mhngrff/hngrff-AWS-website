import { Component } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
//   styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {}
  goToDetails(imageId: number) {
    this.router.navigate(['/details', imageId]);
}
}
