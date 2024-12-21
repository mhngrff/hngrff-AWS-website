import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  orderDetails: any;

  constructor(private navigationService: NavigationService) {}

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
  }

  ngOnDestroy() {
    sessionStorage.removeItem('orderDetails');
  }
}
