import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.interface';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  // styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  lastScrollTop: number = 0;
  isHidden: boolean = false;
  shouldHideNavbar: boolean = false;
  currentOffset: number = 0;
  private navbarHeight: number = 0; //calculated dynamically for differing viewport sizes

  private subscriptions: Subscription = new Subscription();

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

//   ngOnInit(): void {
//     this.cartService.cartItems$.subscribe((items: CartItem[]) => {
//       this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
//
//       this.cdr.detectChanges();
//       // Trigger the flash effect after the update is complete
//       setTimeout(() => {
//         this.triggerFlashEffect();
//       }, 0); // Adding a small delay to allow DOM updates
//     });
//   }
  ngOnInit(): void {
    this.updateNavbarHeight();
    // Subscribe to cartItems$ to update cartItemCount
    const cartSub = this.cartService.cartItems$.subscribe((items) => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
      // Trigger change detection and flash effect
      setTimeout(() => {
        this.triggerFlashEffect();
      }, 0);
    });
    this.subscriptions.add(cartSub);

    // Subscribe to router events to control navbar visibility
    const routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if the current route is the payment route
        this.shouldHideNavbar = event.urlAfterRedirects.includes('/payment');
      });
    this.subscriptions.add(routerSub);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.shouldHideNavbar) {
      return; // Do nothing if the navbar shouldn't be hidden
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop) {
      // User is scrolling down
      this.currentOffset = Math.min(this.currentOffset + (scrollTop - this.lastScrollTop), this.navbarHeight);
    } else {
      // User is scrolling up
      this.currentOffset = Math.max(this.currentOffset - (this.lastScrollTop - scrollTop), 0);
    }

    // Set the top offset of the navbar to gradually hide/show
//     const navbar = document.getElementById('navbar');
    const navbar = document.querySelector('.navbar') as HTMLElement | null;

//     const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.top = `-${this.currentOffset}px`;
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    // Recalculate the navbar height on window resize
    this.updateNavbarHeight();
  }

  triggerFlashEffect(): void {
//     console.log('flash effect entered');
    // Get cart icon and badge elements
    const cartIconContainer = document.querySelector('.cart-icon-container svg path') as HTMLElement;
    const cartIcon = document.querySelector('.cart-icon') as HTMLElement;
    const cartBadge = document.querySelector('.cart-badge') as HTMLElement;

    if (cartIcon && cartBadge) {
      // Add the flash-effect class to both elements
      cartIconContainer.classList.add('flash-effect');
      cartIcon.classList.add('flash-effect');
      cartBadge.classList.add('flash-effect');
//       console.log('classes added')

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
    this.cartService.closeCart();
    this.cartService.setBuyNowFlow(false);
    this.closeMenu(); // Close the menu when navigating to home
  }

  navigateToContact(): void {
    this.navigationService.goToContact();
  }

//   goToCart(): void {
//     this.navigationService.goToCart();
//   }
  goToCart() {
    this.cartService.toggleCartVisibility();
  }

  private updateNavbarHeight(): void {
    // Calculate the navbar height in pixels based on the viewport height
    const vh = window.innerHeight / 100; // 1vh in pixels
    this.navbarHeight = vh * 8; // Assuming the navbar height is 8vh
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
