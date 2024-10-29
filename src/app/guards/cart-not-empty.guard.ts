import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartNotEmptyGuard implements CanActivate {
  constructor(private cartService: CartService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.cartService.getCartItems().pipe(
      map((items) => {
        const hasItemsInCart = items.length > 0;
        const isBuyNowFlow = this.cartService.getBuyNowFlow(); // Check if we are in a buy now flow

        if (hasItemsInCart || isBuyNowFlow) {
          return true; // Allow navigation if cart has items or if it's a buy now flow
        } else {
          this.router.navigate(['/']); // Redirect to homepage if neither condition is true
          return false;
        }
      })
    );
  }
}
