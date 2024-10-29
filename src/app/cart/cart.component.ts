import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../services/navigation.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  total: number = 0;
  cartItems: CartItem[] = [];
  isCartVisible$: Observable<boolean>;
  isBuyNowFlow$: Observable<boolean>;

  constructor(
    private cartService: CartService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    private router: Router
    ) {
    this.isCartVisible$ = this.cartService.cartVisible$;
    this.isBuyNowFlow$ = this.cartService.isBuyNowFlow$;
    }

  ngOnInit(): void {
    console.log('Cart component initialized');

    this.cartService.getTotal$().subscribe((total) => {
      this.total = total;
    });

    this.cartService.cartItems$.subscribe((items) => {
      console.log('Cart items on init:', items);
      this.cartItems = items;
    });

//     // Log to check if the Buy Now flow is active
//     console.log('Is Buy Now Flow:', this.isBuyNowFlow());
//     this.isCartVisible$.subscribe((isVisible) => {
//       console.log('Is Cart Visible:', isVisible);
//     });
  }

  cancelBuyNowFlow(): void {
    this.cartService.setBuyNowFlow(false); // Cancel Buy Now flow
    this.cartService.setSelectedItem(null);
    this.cartService.closeCart(); // Close the cart
    this.router.navigate(['/']); // Navigate back to the homepage
  }

  continueBuyNowFlow(): void {
    this.cartService.closeCart(); // Just close the cart overlay
  }

  incrementQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;
    this.updateQuantity(item, newQuantity);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.updateQuantity(item, newQuantity);
    }
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity > 0) {
      this.cartService.updateItemQuantity(
        item.imageId,
        item.optionSubtitle,
        newQuantity
      );
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item); // Use the CartService's method
  }

  goToPayment(): void {
//     this.navigationService.goToPayment();
//     this.cartService.setSelectedItem(null);
    if (this.router.url === '/payment') {
      // If already on the payment page, just close the cart
      this.cartService.closeCart();
    } else {
          this.navigationService.goToPayment();
          this.cartService.setSelectedItem(null);
    }
  }

  goToHome(): void {
    this.navigationService.goToHome();
  }

  isBuyNowFlow(): boolean {
//     console.log('getSelectedItem: ', this.cartService.getSelectedItem());
//     console.log('isBuyNowFlow accessed');
    return this.cartService.getSelectedItem() !== null;
  }

}
