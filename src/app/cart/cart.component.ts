// import { Component, OnInit } from '@angular/core';
// import { CartService } from '../services/cart.service';
// import { CartItem } from '../models/cart-item.interface';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
// import { NavigationService } from '../services/navigation.service';
//
// @Component({
//   selector: 'app-cart',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './cart.component.html',
//   styleUrls: ['./cart.component.css']
// })
// export class CartComponent implements OnInit {
//   total: number = 0;
//   cartItems: CartItem[] = [];
//
//   constructor(
//     private cartService: CartService,
//     private navigationService: NavigationService,
//   ) {}
//
//   ngOnInit(): void {
//
//     this.cartService.getTotal$().subscribe((total) => {
//       this.total = total;
//     });
//
//     // Subscribe to cartItems$ to get the list of items
//     this.cartService.cartItems$.subscribe((items: CartItem[]) => {
//       this.cartItems = items;
//     });
//   }
//
//   updateQuantity(item: CartItem, newQuantity: number): void {
//     if (newQuantity > 0) {
//       this.cartService.updateItemQuantity(item.imageId, item.optionSubtitle, newQuantity);
//     }
//   }
//
//   removeItem(item: CartItem): void {
//     const updatedItems = this.cartItems.filter(cartItem => cartItem !== item);
//     this.cartService.cartItemsSubject.next(updatedItems);
//   }
//
//   goToPayment(): void {
//     this.navigationService.goToPayment();
//     this.cartService.setSelectedItem(null);
//   }
//
//   goToHome(): void {
//     // Assuming you have a navigation service to handle navigation
//     this.navigationService.goToHome();
//   }
//
// }

import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService } from '../services/navigation.service';

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

  constructor(
    private cartService: CartService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.cartService.getTotal$().subscribe((total) => {
      this.total = total;
    });

    // Subscribe to cartItems$ to get the list of items
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
    });
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
    const updatedItems = this.cartItems.filter(
      (cartItem) => cartItem !== item
    );
    this.cartService.cartItemsSubject.next(updatedItems);
  }

  goToPayment(): void {
    this.navigationService.goToPayment();
    this.cartService.setSelectedItem(null);
  }

  goToHome(): void {
    this.navigationService.goToHome();
  }
}
