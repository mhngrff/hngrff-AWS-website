import { Component, OnInit } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.interface';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  // styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  cartItemCount: number = 0;

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    // Listen to router events and close the menu on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to cartItems$ to update cartItemCount
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);

      this.cdr.detectChanges();
      // Trigger the flash effect after the update is complete
      setTimeout(() => {
        this.triggerFlashEffect();
      }, 0); // Adding a small delay to allow DOM updates
    });
  }

  triggerFlashEffect(): void {
    console.log('flash effect entered');
    // Get cart icon and badge elements
    const cartIconContainer = document.querySelector('.cart-icon-container svg path') as HTMLElement;
    const cartIcon = document.querySelector('.cart-icon') as HTMLElement;
    const cartBadge = document.querySelector('.cart-badge') as HTMLElement;

    if (cartIcon && cartBadge) {
      // Add the flash-effect class to both elements
      cartIconContainer.classList.add('flash-effect');
      cartIcon.classList.add('flash-effect');
      cartBadge.classList.add('flash-effect');
      console.log('classes added')

      // Remove the flash-effect class after 0.5 seconds to allow re-triggering
      setTimeout(() => {
        cartIconContainer.classList.remove('flash-effect');
        cartIcon.classList.remove('flash-effect');
        cartBadge.classList.remove('flash-effect');
      }, 500);
    }
  }

  closeMenu() {
    const checkbox = document.getElementById('menu-toggle') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false; // Uncheck the checkbox to close the menu
    }
  }

  navigateToHome() {
    this.navigationService.goToHome();
    this.closeMenu(); // Close the menu when navigating to home
  }

  navigateToContact(): void {
    this.navigationService.goToContact();
  }

  goToCart(): void {
    this.navigationService.goToCart();
  }
}
