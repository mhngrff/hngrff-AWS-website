import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private storageKey = 'cartItems'; // Key for localStorage

  public cartItemsSubject = new BehaviorSubject<CartItem[]>(this.loadCartFromStorage());
  cartItems$ = this.cartItemsSubject.asObservable();

  private selectedItem: CartItem | null = null;

  private cartVisibleSubject = new BehaviorSubject<boolean>(false);
  cartVisible$ = this.cartVisibleSubject.asObservable();

  // Buy now flow observable
  private isBuyNowFlowSubject = new BehaviorSubject<boolean>(false);
  isBuyNowFlow$ = this.isBuyNowFlowSubject.asObservable();

  constructor() {
    this.calculateTotal(); // Ensure total is set at startup
  }

  setBuyNowFlow(isBuyNow: boolean): void {
    this.isBuyNowFlowSubject.next(isBuyNow);
  }

  toggleCartVisibility(): void {
    if (this.selectedItem !== null) {
      // User is in "Buy Now" flow, show a message instead of opening the cart
      console.log("You're currently in a 'Buy Now' flow. Please cancel to add items.");
      // Emit visibility as false to ensure cart does not open in this state
      this.cartVisibleSubject.next(false);
    } else {
      // Normal cart visibility toggle
      this.cartVisibleSubject.next(!this.cartVisibleSubject.value);
    }
  }

  closeCart(): void {
    this.cartVisibleSubject.next(false);
//     console.log('closeCart called fom cart service');
  }

  private loadCartFromStorage(): CartItem[] {
    const storedCart = localStorage.getItem(this.storageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  }

  private saveCartToStorage(cart: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  getTotal$(): Observable<number> {
    return this.cartItems$.pipe(
      map((items) =>
        items.reduce((total, item) => total + item.price * item.quantity, 0)
      )
    );
  }

  addItem(item: CartItem): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(
      cartItem => cartItem.imageId === item.imageId && cartItem.optionSubtitle === item.optionSubtitle
    );

    if (existingItemIndex !== -1) {
      const updatedItem = {
        ...currentItems[existingItemIndex],
        quantity: currentItems[existingItemIndex].quantity + item.quantity
      };
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = updatedItem;

      this.cartItemsSubject.next(updatedItems);
    } else {
      this.cartItemsSubject.next([...currentItems, item]);
    }

    this.saveCartToStorage(this.cartItemsSubject.value);
  }

  updateItemQuantity(imageId: string, optionSubtitle: string, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const itemIndex = currentItems.findIndex(
      cartItem => cartItem.imageId === imageId && cartItem.optionSubtitle === optionSubtitle
    );

    if (itemIndex !== -1) {
      const updatedItem = {
        ...currentItems[itemIndex],
        quantity: quantity
      };
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = updatedItem;

      this.cartItemsSubject.next(updatedItems);
      this.saveCartToStorage(updatedItems);
    }
  }

  removeItem(item: CartItem): void {

    const updatedItems = this.cartItemsSubject.value.filter(
      cartItem => cartItem.imageId !== item.imageId || cartItem.optionSubtitle !== item.optionSubtitle
    );

    // Emit the updated cart to subscribers
    this.cartItemsSubject.next(updatedItems);

    // Save the updated cart to localStorage
    this.saveCartToStorage(updatedItems);
  }


  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  setSelectedItem(item: CartItem | null): void {
    this.selectedItem = item;
  }

  getSelectedItem(): CartItem | null {
    return this.selectedItem;
  }

  private calculateTotal(): void {
    this.getTotal$().subscribe();
  }
}
