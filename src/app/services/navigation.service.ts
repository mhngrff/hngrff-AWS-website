// navigation.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  goToDetails(imageId: string) {
//     console.log('navigation.service.ts - HIT goToDetails()', imageId);

    //Pre navigation logic

    setTimeout(() => {

//       this.router.navigate([`/details/${imageId}`]);
      this.router.navigate(['/details', imageId]);

    }, 20); // Adjust delay to match animation
  }

  goToHome() {
    //Pre navigation logic
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 500); // Adjust delay to match animation
  }
}
