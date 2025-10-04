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

  private shippingSubject = new BehaviorSubject<number>(0);
  shipping$ = this.shippingSubject.asObservable();


  constructor() {
    this.calculateTotal(); // Ensure total is set at startup
    this.updateStickerPrices();
  }

  toggleCartVisibility(): void {
    // Get the current cart visibility state
    const isCurrentlyVisible = this.cartVisibleSubject.value;

    if (this.selectedItem !== null) {
      // User is in "Buy Now" flow
      if (isCurrentlyVisible) {
        // If the cart is currently open, allow it to be closed
        this.cartVisibleSubject.next(false);
        console.log("Closing the cart while in 'Buy Now' flow.");
      } else {
        // If the cart is not currently visible, open it and show the warning
        this.cartVisibleSubject.next(true);
        console.log("You're currently in a 'Buy Now' flow. Please cancel to add items.");
      }
    } else {
      // Normal cart visibility toggle
      this.cartVisibleSubject.next(!isCurrentlyVisible);
    }
  }


  closeCart(): void {
    this.cartVisibleSubject.next(false);
  }

  private loadCartFromStorage(): CartItem[] {
    const storedCart = localStorage.getItem(this.storageKey);
    const items: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    return items.map(item => ({
      ...item,
      originalPrice: item.originalPrice ?? item.price
    }));
  }


  private saveCartToStorage(cart: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  private isSticker(item: CartItem): boolean {
    return (
      item.imageId.toLowerCase().includes('sticker') ||
      item.optionSubtitle.toLowerCase().includes('sticker')
    );
  }

private updateStickerPrices(): void {
  const updatedItems = [...this.cartItemsSubject.value];

  // Check if there's at least one print (non-sticker)
  const hasPrint = updatedItems.some(item => !this.isSticker(item));

  if (!hasPrint) {
    // No prints, reset sticker prices to original
    updatedItems.forEach(item => {
      if (this.isSticker(item)) {
        item.price = item.originalPrice ?? item.price;
      }
    });
  } else {
    // There is at least one print
    let remainingFreeStickers = 3; // max free stickers per print

    updatedItems.forEach(item => {
      if (this.isSticker(item)) {
        const quantity = item.quantity;
        const bundleSize = item.optionSubtitle.toLowerCase().includes('bundle') ? 3 : 1;
        const totalStickersForItem = quantity * bundleSize;

       if (remainingFreeStickers >= totalStickersForItem) {
         // All stickers free
         item.price = 0;
         remainingFreeStickers -= totalStickersForItem;
       } else if (remainingFreeStickers > 0) {
         // Some free, some paid
         const paidStickers = totalStickersForItem - remainingFreeStickers;
         const perStickerPrice = (item.originalPrice ?? item.price) / bundleSize;
         item.price = perStickerPrice * paidStickers; // total price for the line
         remainingFreeStickers = 0;
       } else {
         // All paid
         item.price = item.originalPrice ?? item.price;
       }

      }
    });
  }

  this.cartItemsSubject.next(updatedItems);
  this.saveCartToStorage(updatedItems);
}



  getTotal$(): Observable<number> {
    return this.cartItems$.pipe(
      map((items) => {
        // Check if there is at least one non-sticker item
        const hasNonSticker = items.some(item => !item.optionSubtitle.toLowerCase().includes('sticker'));

        return items.reduce((total, item) => {
          if (item.optionSubtitle.toLowerCase().includes('sticker') && hasNonSticker) {
            // Stickers are free if there's at least one non-sticker
            return total + 0;
          } else {
            // Normal price otherwise
            return total + item.price * item.quantity;
          }
        }, 0);
      })
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
      // Set originalPrice when first adding the item
      const newItem = { ...item, originalPrice: item.price };
      this.cartItemsSubject.next([...currentItems, newItem]);
    }

    this.saveCartToStorage(this.cartItemsSubject.value);
    this.updateStickerPrices();
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
      this.updateStickerPrices();
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
    this.updateStickerPrices();
  }


  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  setBuyNowFlow(isBuyNow: boolean): void {
    this.isBuyNowFlowSubject.next(isBuyNow);
    localStorage.setItem('isBuyNowFlow', JSON.stringify(isBuyNow)); // Persist the Buy Now flag
//     console.log(`Buy Now flow set to: ${isBuyNow}`);
  }

  getBuyNowFlow(): boolean {
    const storedBuyNowFlow = localStorage.getItem('isBuyNowFlow');
    return storedBuyNowFlow ? JSON.parse(storedBuyNowFlow) : false;
  }

  setSelectedItem(item: CartItem | null): void {
    this.selectedItem = item;
    if (item) {
      localStorage.setItem('selectedBuyNowItem', JSON.stringify(item)); // Persist the Buy Now item
    } else {
      localStorage.removeItem('selectedBuyNowItem'); // Clear from local storage if null
    }
  }

  getSelectedItem(): CartItem | null {
    const storedItem = localStorage.getItem('selectedBuyNowItem');
    return storedItem ? JSON.parse(storedItem) : null;
  }

  private calculateTotal(): void {
    this.getTotal$().subscribe();
  }

  getTotalWeight$(): Observable<number> {
    return this.cartItems$.pipe(
      map((items) => {
//         console.log('Current cart items:', items); // Log the current items in the cart
        const totalWeight = items.reduce((total, item) => {
//           console.log(`Adding item: ${item.optionSubtitle}, weight: ${item.weight}, quantity: ${item.quantity}`);
          return total + item.weight * item.quantity;
        }, 0);
//         console.log('Total weight:', totalWeight); // Log the computed total weight
        return totalWeight;
      })
    );
  }

  clearCart(): void {
    this.cartItemsSubject.next([]); // Reset the cart items
    this.saveCartToStorage([]); // Clear the localStorage cart data
  }
}
