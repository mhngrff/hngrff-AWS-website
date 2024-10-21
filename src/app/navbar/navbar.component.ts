import { Component } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router'
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.css'
})
export class NavbarComponent {

 constructor(private router: Router,
             private navigationService: NavigationService) {

    // Listen to router events and close the menu on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
      }
    });
  }

  closeMenu() {
    const checkbox = document.getElementById('menu-toggle') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;  // Uncheck the checkbox to close the menu
    }
  }

  navigateToHome() {
    this.navigationService.goToHome();
    this.closeMenu();  // Close the menu when navigating to home
  }

  navigateToContact(): void {
    this.navigationService.goToContact();
  }
}
