import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private orderDetails: any;

  constructor(private router: Router) {}

  setOrderDetails(details: any) {
    this.orderDetails = details;
  }

  getOrderDetails() {
    return this.orderDetails;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToDetails(imageId: string): void {
    this.router.navigate(['/details', imageId]);
  }

  goToContact(): void {
    this.router.navigate(['/contact']);
  }

  goToPayment(): void {
    this.router.navigate(['/payment']);
    }

  goToCart(): void {
    this.router.navigate(['/cart']);
    }

  goToSuccess(orderDetails: any) {
    console.log('Navigating to success with order details:', orderDetails);
    this.router.navigate(['/success'], {
      state: {orderDetails }
      });
    }
}
