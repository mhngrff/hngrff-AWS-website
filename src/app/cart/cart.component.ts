import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Subscribe to cartItems$ to get the list of items
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity > 0) {
      this.cartService.updateItemQuantity(item.imageId, item.optionSubtitle, newQuantity);
    }
  }

  removeItem(item: CartItem): void {
    const updatedItems = this.cartItems.filter(cartItem => cartItem !== item);
    this.cartService.cartItemsSubject.next(updatedItems);
  }
}
