import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

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
}
