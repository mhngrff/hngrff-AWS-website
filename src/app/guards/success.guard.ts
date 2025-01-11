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
      console.log("Success guard accessed, GOOD PATH");
      return true; // Allow navigation if the transaction was successful
    } else {
      console.log("Success guard accessed, BAD PATH");
      this.router.navigate(['/']); // Redirect to the homepage or a different page
      return false;
    }
  }
}
