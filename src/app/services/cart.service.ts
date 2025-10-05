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

      console.log('updateStickerPrices - start: cart items:', updatedItems.map(item => ({
          name: item.optionSubtitle,
          quantity: item.quantity,
          internalQuantity: item.internalQuantity,
          originalPrice: item.originalPrice,
          price: item.price
      })));

      // Check if there's at least one print (non-sticker)
      const hasPrint = updatedItems.some(item => !this.isSticker(item));

      if (!hasPrint) {
          // No prints, reset sticker prices to original line totals
          updatedItems.forEach(item => {
              if (this.isSticker(item)) {
                  const bundleSize = item.optionSubtitle.toLowerCase().includes('stickers') ? 3 : 1;
                  const qty = item.internalQuantity ?? item.quantity * bundleSize;
                  item.price = (item.originalPrice ?? item.price) * (qty / bundleSize);
              }
          });
      } else {
          let remainingFreeStickers = 3; // max free stickers per print

          // Separate bundles and singles so bundles get priority
          const stickerItems = updatedItems.filter(item => this.isSticker(item));
          const bundleItems = stickerItems.filter(item => item.optionSubtitle.toLowerCase().includes('stickers'));
          const singleItems = stickerItems.filter(item => !item.optionSubtitle.toLowerCase().includes('stickers'));
          const orderedItems = [...bundleItems, ...singleItems];

          orderedItems.forEach(item => {
              const bundleSize = item.optionSubtitle.toLowerCase().includes('stickers') ? 3 : 1;
              const qty = item.internalQuantity ?? item.quantity * bundleSize;
              const perStickerPrice = (item.originalPrice ?? item.price) / bundleSize;

              if (remainingFreeStickers >= qty) {
                  // Entire line is free
                  item.price = 0;
                  remainingFreeStickers -= qty;
              } else if (remainingFreeStickers > 0) {
                  // Part free, part paid
                  const paidStickers = qty - remainingFreeStickers;
                  item.price = paidStickers * perStickerPrice;
                  remainingFreeStickers = 0;
              } else {
                  // All paid
                  item.price = qty * perStickerPrice;
              }
          });
      }

      console.log('updateStickerPrices - end: cart items:', updatedItems.map(item => ({
          name: item.optionSubtitle,
          quantity: item.quantity,
          internalQuantity: item.internalQuantity,
          originalPrice: item.originalPrice,
          price: item.price
      })));

      this.cartItemsSubject.next(updatedItems);
      this.saveCartToStorage(updatedItems);
  }

  getTotal$(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => {
        // Defensive copy (not strictly necessary)
        const cart = items ?? [];

        // Are there any non-sticker items? If no prints then no free-sticker logic.
        const hasPrint = cart.some(i => !this.isSticker(i));

        let subtotal = 0;

//         if (!hasPrint) {
//           // No prints: every line contributes its full price.
//           cart.forEach(item => {
//             // Use internalQuantity (UI count) when present, otherwise fall back to quantity
//             const lineQty = (item.internalQuantity ?? item.quantity ?? 1);
//             // For bundles originalPrice already represents the bundle price (e.g. $15)
//             subtotal += (item.originalPrice ?? item.price) * lineQty;
//           });
//           return subtotal;
//         }
        if (!hasPrint) {
          cart.forEach(item => {
            if (!this.isSticker(item)) {
              // Normal items (prints, etc.)
              subtotal += (item.originalPrice ?? item.price) * (item.quantity ?? 1);
            } else {
              // Sticker logic
              const isBundle = item.optionSubtitle.toLowerCase().includes('stickers');
              const bundleSize = isBundle ? 3 : 1;

              const uiQty = item.internalQuantity ?? item.quantity ?? 1;
              const totalStickers = uiQty * bundleSize;

              const perStickerPrice = (item.originalPrice ?? item.price) / bundleSize;

              if(isBundle){
              subtotal += ((totalStickers * perStickerPrice)/3);
//               subtotal += bundleSize * perStickerPrice;
              } else {
                subtotal += totalStickers * perStickerPrice;
                }
            }
          });
          return subtotal;
        }


        // There is at least one print => up to 3 free stickers total (same algorithm as updateStickerPrices)
        let remainingFreeStickers = 3;

        // Iterate in cart order and allocate free stickers to sticker lines first
        cart.forEach(item => {
          if (!this.isSticker(item)) {
            // Non-sticker (print etc.) -> full price times quantity
            const qty = item.quantity ?? 1;
            subtotal += (item.originalPrice ?? item.price) * qty;
          } else {

            // Sticker line (could be bundle or single)
            const isBundle = item.optionSubtitle.toLowerCase().includes('stickers');
            const bundleSize = isBundle ? 3 : 1;

            // internalQuantity already accounts for bundle size
            const totalStickersForLine = item.internalQuantity ?? (item.quantity ?? 1) * bundleSize;

            if (remainingFreeStickers >= totalStickersForLine) {
              // entire line free
              remainingFreeStickers -= totalStickersForLine;
            } else if (remainingFreeStickers > 0) {
              // some free, some paid
              const paidStickers = totalStickersForLine - remainingFreeStickers;
              const perStickerPrice = (item.originalPrice ?? item.price) / bundleSize;
              subtotal += paidStickers * perStickerPrice;
              remainingFreeStickers = 0;
            } else {
              // all paid
              const perStickerPrice = (item.originalPrice ?? item.price) / bundleSize;
              subtotal += totalStickersForLine * perStickerPrice;
            }


          }
        });

        return subtotal;
      })
    );
  }



  addItem(item: CartItem): void {
      const currentItems = this.cartItemsSubject.value;

      // Determine bundle size (3 for sticker bundle, 1 otherwise)
      const bundleSize = item.optionSubtitle.toLowerCase().includes('stickers') ? 3 : 1;

      // Set internalQuantity for pricing, keep quantity for UI
      const adjustedItem: CartItem = {
          ...item,
          quantity: item.quantity,         // UI-facing
          internalQuantity: item.quantity * bundleSize  // used in pricing logic
      };

      const existingItemIndex = currentItems.findIndex(
          cartItem =>
              cartItem.imageId === adjustedItem.imageId &&
              cartItem.optionSubtitle === adjustedItem.optionSubtitle
      );

      if (existingItemIndex !== -1) {
        const updatedItem = {
            ...currentItems[existingItemIndex],
            quantity: currentItems[existingItemIndex].quantity + adjustedItem.quantity,
            internalQuantity: (currentItems[existingItemIndex].internalQuantity ?? currentItems[existingItemIndex].quantity)
                              + (adjustedItem.internalQuantity ?? 0)
        };

          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = updatedItem;
          this.cartItemsSubject.next(updatedItems);
      } else {
          const newItem: CartItem = {
              ...adjustedItem,
              originalPrice: adjustedItem.price
          };
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
          quantity: quantity, // UI-facing
          internalQuantity: (currentItems[itemIndex].internalQuantity ?? quantity) / (currentItems[itemIndex].quantity ?? 1) * quantity
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
//     return this.cartItems$;
    return this.cartItemsSubject.asObservable();
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
