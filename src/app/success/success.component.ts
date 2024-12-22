import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';


@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  orderDetails: any;

  constructor(
    private navigationService: NavigationService,
    private router: Router
    ) {}

  ngOnInit() {
    this.orderDetails = this.navigationService.getOrderDetails();

    // If not found in the service (e.g., after page refresh), try sessionStorage
    if (!this.orderDetails) {
      const storedDetails = sessionStorage.getItem('orderDetails');
      if (storedDetails) {
        this.orderDetails = JSON.parse(storedDetails);
        console.log('Order Details retrieved from sessionStorage:', this.orderDetails);
      } else {
        console.error('Order details not found in service or sessionStorage.');
      }
    } else {
      console.log('Order Details from service:', this.orderDetails);
    }

    // Prevent back navigation to the payment page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.navigationTrigger === 'popstate') {
        // Redirect to home if back navigation leads to payment
        if (this.router.url === '/payment') {
          this.router.navigate(['/success']); // Redirect to home or another page
        }
      }
    });

  }

//   ngOnDestroy() {
//     sessionStorage.removeItem('orderDetails');
//   }
}
