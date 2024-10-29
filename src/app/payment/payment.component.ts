import { Component, OnInit } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from '../services/navigation.service';
import Payment from 'payment';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { CartItem } from '../models/cart-item.interface';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'; // Import Router



@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardNumberElement: StripeCardNumberElement | null = null;
  cardExpiryElement: StripeCardExpiryElement | null = null;
  cardCvcElement: StripeCardCvcElement | null = null;
  clientSecret: string | null = null;
  currentCardType: string | null = null; // Tracks detected card type
  isBuyNowFlow$: Observable<boolean>;

  cartItems: CartItem[] = []; // Store cart items or the single item
  total: number = 0;

//   isBuyNow: boolean = this.cartService.getBuyNowFlow(); // Track if the user used "Buy Now"
  isBuyNow: boolean = false; // Track if the user used "Buy Now"

  constructor(
    private http: HttpClient,
    private navigationService: NavigationService,
    private cartService: CartService,
    private router: Router
    ) {    this.isBuyNowFlow$ = this.cartService.isBuyNowFlow$;
}

//   ngOnInit() {
//
//     const selectedItem = this.cartService.getSelectedItem();
//
//     if (selectedItem) {
//       // Buy Now path: Use selected item and set the flag
//       this.cartItems = [selectedItem];
//       this.total = selectedItem.price * selectedItem.quantity;
//       this.isBuyNow = true; // Mark this as a buy now flow
//       this.cartService.setSelectedItem(null); // Reset the selected item
//       console.log('Buy Now path - Total:', this.total);
//     } else {
//       this.cartService.getTotal$().subscribe((total) => {
//         this.total = total;
//
//         this.cartService.getCartItems().subscribe((items: CartItem[]) => {
//           this.cartItems = items;
//         });
//       });
//     }
//
//     // Load Stripe Elements
//     loadStripe('your-stripe-key').then((stripe) => {
//       if (stripe) {
//         this.stripe = stripe;
//         console.log('Stripe loaded successfully');
//         this.setupStripeElements();
//       } else {
//         console.error('Stripe failed to load');
//       }
//     });
//   }

  ngOnInit() {
    // Restore Buy Now flag and selected item from local storage
    const isBuyNowFlow = this.cartService.getBuyNowFlow();
    this.cartService.setBuyNowFlow(isBuyNowFlow);

    const selectedItem = this.cartService.getSelectedItem();

    if (selectedItem && isBuyNowFlow) {
      // Buy Now path: Use selected item
      this.cartItems = [selectedItem];
      this.total = selectedItem.price * selectedItem.quantity;
      this.isBuyNow = true;
      console.log('Buy Now path - Total:', this.total);
    } else {
      // Cart Checkout path: Use cart items and total
      this.cartService.getTotal$().subscribe((total) => {
        this.total = total;
        console.log('Cart Checkout path - Total:', this.total);

        this.cartService.getCartItems().subscribe((items: CartItem[]) => {
          this.cartItems = items;

          // If the cart becomes empty while on the payment page, redirect to home
          if (items.length === 0) {
            console.log("Cart is empty, redirecting to home page.");
            this.router.navigate(['/']); // Navigate to the home page
          }
        });
      });
    }

    // Load Stripe Elements
    loadStripe('your-stripe-key').then((stripe) => {
      if (stripe) {
        this.stripe = stripe;
        this.setupStripeElements();
      }
    });
  }



  setupStripeElements() {
    if (this.stripe) {
//       console.log("Setting up Stripe Elements...");

      // Create an instance of Elements
      this.elements = this.stripe.elements();

      if (this.elements) {
//         console.log("Stripe Elements instance created successfully");

        // Create and mount the card number element
        this.cardNumberElement = this.elements.create('cardNumber', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '8vw',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a',
            },
          },
        });

        if (this.cardNumberElement) {
//           console.log("Card number element created successfully");
          this.cardNumberElement.mount('#card-number-element');
//           console.log("Card number element mounted successfully");

          this.cardNumberElement?.on('change', (event: any) => {
//             console.log('Card number input:', event);

            // Check the event's brand field to identify card type
            const cardType = event.brand !== 'unknown' ? event.brand : null;
//             console.log('Detected card type:', cardType);

            if (cardType) {
              this.updateCardIcons(cardType);
            } else {
              this.resetCardIcons();
            }
          });
        } else {
          console.error("Failed to create card number element");
        }

        // Create and mount the card expiry element
        this.cardExpiryElement = this.elements.create('cardExpiry', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '9vw',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a',
            },
          },
        });

        if (this.cardExpiryElement) {
//           console.log("Card expiry element created successfully");
          this.cardExpiryElement.mount('#card-expiry-element');
//           console.log("Card expiry element mounted successfully");
        } else {
          console.error("Failed to create card expiry element");
        }

        // Create and mount the card CVC element
        this.cardCvcElement = this.elements.create('cardCvc', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '9vw',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a',
            },
          },
        });

        if (this.cardCvcElement) {
//           console.log("Card CVC element created successfully");
          this.cardCvcElement.mount('#card-cvc-element');
//           console.log("Card CVC element mounted successfully");
        } else {
          console.error("Failed to create card CVC element");
        }
      } else {
        console.error("Failed to create Stripe Elements instance");
      }
    } else {
      console.error("Stripe instance is not available");
    }
  }

  async createPaymentIntent() {
    const amount = 5000; // Set the amount (e.g., in cents, $50.00 => 5000)

    try {
      const response = await this.http.post<{ clientSecret: string }>(
        'http://localhost:3000/create-payment-intent',
        { amount }
      ).toPromise();
      this.clientSecret = response?.clientSecret || null;
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  }

  async handlePayment(event: Event) {
    event.preventDefault();
    console.log("Handling payment submission...");

    if (!this.stripe || !this.cardNumberElement || !this.cardExpiryElement || !this.cardCvcElement) {
      console.error("Stripe or card elements not properly set up");
      return;
    }

    console.log("Creating payment intent...");

    // Create a PaymentIntent by calling the backend
    await this.createPaymentIntent();

    if (!this.clientSecret) {
      console.error("Failed to retrieve client secret from backend");
      return;
    }

    console.log("Retrieved client secret:", this.clientSecret);

    // Use the client secret to confirm the payment
    const { paymentIntent, error } = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.cardNumberElement!,
      }
    });

    if (error) {
      console.error('Payment failed:', error.message);
    } else if (paymentIntent) {
      console.log('Payment successful:', paymentIntent);
      this.cartService.setBuyNowFlow(false);
      this.cartService.setSelectedItem(null);
    }
  }

  editCart(){
//     this.navigationService.goToCart();
    this.cartService.toggleCartVisibility();
  }

  onCardNumberInput(event: any): void {
    this.cardNumberElement?.on('change', (event: any) => {
      const cardType = event.brand !== 'unknown' ? event.brand : null;
      console.log('Detected card type:', cardType);

      if (cardType) {
        this.updateCardIcons(cardType);
      } else {
        this.resetCardIcons();
      }
    });
  }

  updateCardIcons(cardType: string): void {
    const icons = document.querySelectorAll('.card-icon');
    icons.forEach((icon) => {
      const iconType = icon.getAttribute('data-card-type');
      if (iconType === cardType) {
        (icon as HTMLElement).style.opacity = '1';
      } else {
        (icon as HTMLElement).style.opacity = '0.3';
      }
    });
  }

  resetCardIcons(): void {
    const icons = document.querySelectorAll('.card-icon');
    icons.forEach((icon) => {
      (icon as HTMLElement).style.opacity = '1'; // Reset to full opacity
    });
  }

}
