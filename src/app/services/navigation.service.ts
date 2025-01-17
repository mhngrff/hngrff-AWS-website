import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private orderDetails: any;
  private transactionCompleted = false;

  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToIndividualPrints(): void {
  this.router.navigate(['/'], { queryParams: { scrollTo: 'individualPrints' } });
  }

  goToDetails(imageId: string): void {
    this.router.navigate(['/details', imageId]);
  }

  goToContact(): void {
    this.router.navigate(['/contact']);
  }

  goToAbout(): void {
    this.router.navigate(['/about']);
  }

  goToPayment(): void {
    this.router.navigate(['/payment']);
    }

  goToCart(): void {
    this.router.navigate(['/cart']);
    }

//   goToSuccess(orderId: string): Promise<boolean> {
//     console.log('Navigating to success with order ID:', orderId);
//
//     sessionStorage.setItem('orderId', orderId);
//     console.log('OrderId in sessionStorage:', sessionStorage.getItem('orderId'));
//     console.log('TransactionCompleted in sessionStorage:', sessionStorage.getItem('transactionCompleted'));
//
//     return this.router.navigate(['/success'])
//       .then(() => {
//         console.log("Navigation to success complete.");
//         return true;
//       })
//       .catch((error) => {
//         console.error("Navigation to success failed:", error);
//         this.router.navigate(['/']);
//         return false;
//       });
//   }

  goToSuccess(order: any): Promise<boolean> {
    console.log('Navigating to success with order:', order);

    sessionStorage.setItem('orderDetails', JSON.stringify(order));
    console.log('OrderDetails in sessionStorage:', sessionStorage.getItem('orderDetails'));

    return this.router.navigate(['/success'])
      .then(() => {
        console.log("Navigation to success complete.");
        return true;
      })
      .catch((error) => {
        console.error("Navigation to success failed:", error);
        this.router.navigate(['/']);
        return false;
      });
  }

  getOrderDetails() {
    const storedDetails = sessionStorage.getItem('orderDetails');
      return storedDetails ? JSON.parse(storedDetails) : null;
  }

  setTransactionStatus(status: boolean): void {
    this.transactionCompleted = status;
    console.log("setTransactionStatus accessed, transactionCompleted = ", status);
    sessionStorage.setItem('transactionCompleted', JSON.stringify(status));
  }

  getTransactionStatus(): boolean {
    if (!this.transactionCompleted) {
      this.transactionCompleted = JSON.parse(sessionStorage.getItem('transactionCompleted') || 'false');
        console.log("getTransactionStatus accessed, !transactionCompleted = TRUE (bad path)");
      }
    return this.transactionCompleted;
      console.log("getTransactionStatus accessed, !transactionCompleted = FALSE (good path)");
  }
}
