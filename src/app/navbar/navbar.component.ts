import { Component } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  onLinkClick(link: string): void {
    console.log(`Link clicked: ${link}`);
  }
 constructor(private router: Router) {
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
//     console.log('navigateToHome triggered');
    this.router.navigate(['/']);
    this.closeMenu();  // Close the menu when navigating to home
  }
}
