import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class SuccessGuard implements CanActivate {

  constructor(private navigationService: NavigationService, private router: Router) {}

  canActivate(): boolean {
    const hasTransactionCompleted = this.navigationService.getTransactionStatus();

    if (hasTransactionCompleted) {
      return true; // Allow navigation if the transaction was successful
    } else {
      this.router.navigate(['/']); // Redirect to the homepage or a different page
      return false;
    }
  }
}
