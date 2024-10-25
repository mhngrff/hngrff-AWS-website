import { Component, OnInit } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardNumberElement: StripeCardNumberElement | null = null;
  cardExpiryElement: StripeCardExpiryElement | null = null;
  cardCvcElement: StripeCardCvcElement | null = null;
  clientSecret: string | null = null;

  constructor(
    private http: HttpClient,
    private navigationService: NavigationService
    ) {}

  ngOnInit() {
    // Load Stripe when the component initializes
    loadStripe('pk_test_51QD4EFCkan3FkVYDXSZLVEO2msoiyEuOi7M6zZqcKS9HKHrGsk2Q2UhlmDU5lhhQjo6NxVyEXhFt2JqMAu2DBlEo00AzCcNRdA').then((stripe) => {
      if (stripe) {
        this.stripe = stripe;
        console.log("Stripe loaded successfully");
        this.setupStripeElements();
      } else {
        console.error("Stripe failed to load");
      }
    });
  }

  setupStripeElements() {
    if (this.stripe) {
      console.log("Setting up Stripe Elements...");

      // Create an instance of Elements
      this.elements = this.stripe.elements();

      if (this.elements) {
        console.log("Stripe Elements instance created successfully");

        // Create and mount the card number element
        this.cardNumberElement = this.elements.create('cardNumber', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '16px',
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
          console.log("Card number element created successfully");
          this.cardNumberElement.mount('#card-number-element');
          console.log("Card number element mounted successfully");
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
              fontSize: '16px',
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
          console.log("Card expiry element created successfully");
          this.cardExpiryElement.mount('#card-expiry-element');
          console.log("Card expiry element mounted successfully");
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
              fontSize: '16px',
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
          console.log("Card CVC element created successfully");
          this.cardCvcElement.mount('#card-cvc-element');
          console.log("Card CVC element mounted successfully");
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
    }
  }

  editCart(){
    this.navigationService.goToCart();
    }

}
