import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { OrdersService } from '../services/orders.service';


@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  orderDetails: any;
  isLoading = true;
  errorMessage: string | null = null;
  spinnerText = 'Fetching your order';

  private spinnerInterval: any;

  constructor(
    private ordersService: OrdersService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit() {
    this.startSpinner();

    const orderId = sessionStorage.getItem('orderId');
    console.log("Reached success component with orderId: ", orderId);

      if (!orderId) {
        console.error('No orderId found in sessionStorage. Redirecting to homepage.');
        this.router.navigate(['/']); // Redirect to homepage if orderId is missing
        return;
      }

        // Fetch the order details dynamically
        this.ordersService.getOrder(orderId).subscribe(
          (orderDetails) => {
            this.orderDetails = orderDetails;
            this.isLoading = false;
            this.stopSpinner();
            console.log('Fetched order details:', this.orderDetails);
          },
          (error) => {
            console.error('Error fetching order details:', error);
            this.isLoading = false;
            this.router.navigate(['/']); // Redirect to homepage if fetching fails
          }
        );

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
