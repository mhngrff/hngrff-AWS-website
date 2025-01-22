import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { OrdersService } from '../services/orders.service';
import { jsPDF } from 'jspdf';

interface Product {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnailUrl: string;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  products: Product[];
  subtotal: number;
  total: number;
  shippingCost: number;
  shippingAddress: {
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  orderDate: string;
}

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})

export class SuccessComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;
  spinnerText = 'Fetching your order';

  private spinnerInterval: any;


  orderDetails: OrderDetails = {
    orderId: '',
    customerName: '',
    customerEmail: '',
    products: [],
    subtotal: 0,
    total: 0,
    shippingCost: 0,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    orderDate: '',
  };



  constructor(
    private ordersService: OrdersService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router,
    ) {}

    ngOnInit() {
      this.startSpinner();

      const storedOrderDetails = sessionStorage.getItem('orderDetails')!;

        const parsedOrderDetails = JSON.parse(storedOrderDetails);

        this.orderDetails = parsedOrderDetails.order || {};
        console.log("this.orderDetails = ", this.orderDetails);

        this.isLoading = false;
        this.stopSpinner();

      // Prevent back navigation to the payment page
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart && event.navigationTrigger === 'popstate') {
          if (event.url === '/payment') {
            this.router.navigate(['/']); // Redirect to home or another page
          }
        }
      });
    }


    startSpinner(): void {
      let dotCount = 0;
      this.spinnerInterval = setInterval(() => {
        dotCount = (dotCount + 1 ) % 4;
        const dots = '.'.repeat(dotCount);
        this.spinnerText = `Fetching your order${dots}`;
      }, 150); //150ms
    }

    stopSpinner(): void {
      if (this.spinnerInterval) {
        clearInterval(this.spinnerInterval);
        this.spinnerInterval = null;
      }
    }

    ngOnDestroy() {
      this.stopSpinner();
    }

  }
