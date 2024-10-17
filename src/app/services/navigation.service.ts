import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  goToDetails(imageId: string) {
    console.log('navigation.service.ts - HIT goToDetails()', imageId);

      this.router.navigate(['/details', imageId]);
  }

  goToHome() {
      this.router.navigate(['/']);
  }

}
