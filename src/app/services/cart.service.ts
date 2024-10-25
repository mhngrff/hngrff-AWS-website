import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Using BehaviorSubject to manage cart items
  public cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  addItem(item: CartItem): void {
    // Get the current cart items
    const currentItems = this.cartItemsSubject.value;

    // Check if the item already exists in the cart
    const existingItemIndex = currentItems.findIndex(
      cartItem => cartItem.imageId === item.imageId && cartItem.optionSubtitle === item.optionSubtitle
    );

    if (existingItemIndex !== -1) {
      // If the item exists, update its quantity
      const updatedItem = {
        ...currentItems[existingItemIndex],
        quantity: currentItems[existingItemIndex].quantity + item.quantity
      };
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = updatedItem;

      // Update the BehaviorSubject with the modified items
      this.cartItemsSubject.next(updatedItems);
    } else {
      // If the item doesn't exist, add it to the cart
      this.cartItemsSubject.next([...currentItems, item]);
    }
  }

  updateItemQuantity(imageId: string, optionSubtitle: string, quantity: number): void {
    // Get the current cart items
    const currentItems = this.cartItemsSubject.value;

    // Find the index of the item to update
    const itemIndex = currentItems.findIndex(
      cartItem => cartItem.imageId === imageId && cartItem.optionSubtitle === optionSubtitle
    );

    if (itemIndex !== -1) {
      // Update the quantity of the item
      const updatedItem = {
        ...currentItems[itemIndex],
        quantity: quantity
      };
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = updatedItem;

      // Update the BehaviorSubject with the modified items
      this.cartItemsSubject.next(updatedItems);
    }
  }

  getCartItems(): Observable<CartItem[]> {
    // Return the cart items as an observable
    return this.cartItems$;
  }
}
