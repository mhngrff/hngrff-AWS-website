import { Component } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent} from './navbar/navbar.component'
import { FooterComponent } from './footer/footer.component'
import { DetailsComponent } from './details/details.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, NavbarComponent, FooterComponent, DetailsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hngrff-angular-app';
    constructor(private router: Router) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
//           console.log('Navigated to:', event.url);
        }
      });
    }
}
