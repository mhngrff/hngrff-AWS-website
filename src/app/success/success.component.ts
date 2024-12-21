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

    if (this.orderDetails) {
      console.log('Order Details from service:', this.orderDetails);
    } else {
      console.error('Order details not found in service.');
    }
  }
}
