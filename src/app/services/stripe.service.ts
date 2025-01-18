import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardNumberElement: StripeCardNumberElement | null = null;
  private cardExpiryElement: StripeCardExpiryElement | null = null;
  private cardCvcElement: StripeCardCvcElement | null = null;

  private cardNumberTouched: boolean = false;
  private cardExpiryTouched: boolean = false;
  private cardCvcTouched: boolean = false;

  private cardNumberValid: boolean = false;
  private cardExpiryValid: boolean = false;
  private cardCvcValid: boolean = false;

  constructor(private http: HttpClient) {}

  async initializeStripe() {
    if (!this.stripe) {
      this.stripe = await loadStripe(environment.stripePublicKey);
      console.log("stripe pk=", this.stripe);
    }
    if (this.stripe && !this.elements) {
      this.elements = this.stripe.elements();
    }
  }

  mountCardElements(
    cardNumberDiv: string,
    cardExpiryDiv: string,
    cardCvcDiv: string,
    onCardChangeCallback: (cardType: string | null) => void,
    onValidityChangeCallback: (isInvalid: boolean) => void,
    onFieldInvalidCallback: () => void
  ) {
    if (this.elements) {
//           console.log('Checking for existing Stripe elements...');

          // Destroy existing elements before creating new ones
          if (this.cardNumberElement) {
            this.cardNumberElement.destroy();
            this.cardNumberElement = null;
          }
          if (this.cardExpiryElement) {
            this.cardExpiryElement.destroy();
            this.cardExpiryElement = null;
          }
          if (this.cardCvcElement) {
            this.cardCvcElement.destroy();
            this.cardCvcElement = null;
          }

//       console.log('Stripe elements initialized. Creating and mounting elements.');
      // Create and mount the card number element
      this.cardNumberElement = this.elements.create('cardNumber', {
        style: {
          base: {
            color: 'black',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
//             fontSize: '7vw',
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

        // Check if the card number element was created successfully
        if (this.cardNumberElement) {
//           console.log('Card number element created successfully.');
        } else {
          console.error('Failed to create card number element.');
        }


      this.cardNumberElement.mount(cardNumberDiv);
//       console.log(`Card number element mounted on ${cardNumberDiv}`);

      // Add focus event listeners to track user interaction
      this.cardNumberElement?.on('focus', () => {
        this.cardNumberTouched = true;
      });

      // Attach a 'change' event listener to the card number element
      this.cardNumberElement.on('change', (event: any) => {
//         console.log('Card number element change event fired:', event);
        const cardType = event.brand !== 'unknown' ? event.brand : null;
        onCardChangeCallback(cardType);
      });

      // Modify the change event handlers to update these flags
      this.cardNumberElement.on('change', (event: any) => {
        this.cardNumberValid = event.complete && !event.error;
        this.updateOverallValidity(onValidityChangeCallback);

        if (event.empty || !event.complete) {
          console.log('Card number field cleared. Reapplying error highlight.');
//           this.highlightUntouchedStripeFields();
//           onFieldInvalidCallback(); // REMOVED TO PREVENT PREEMPTIVE HIGHLIGHTING
        }

        if (event.complete) {
             this.cardExpiryElement?.focus(); // Focus on Expiry next
        }

      });

      // Create and mount the card expiry element
      this.cardExpiryElement = this.elements.create('cardExpiry', {
        style: {
          base: {
            color: 'black',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
//             fontSize: '9vw',
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

      this.cardExpiryElement.mount(cardExpiryDiv);

      this.cardExpiryElement?.on('focus', () => {
        this.cardExpiryTouched = true;
      });

      this.cardExpiryElement.on('change', (event: any) => {
        this.cardExpiryValid = event.complete && !event.error;
        this.updateOverallValidity(onValidityChangeCallback);

        if (event.empty || !event.complete) {
          console.log('Card number field cleared. Reapplying error highlight.');
//           this.highlightUntouchedStripeFields();
//         onFieldInvalidCallback(); // REMOVED TO PREVENT PREEMPTIVE HIGHLIGHTING
        }
        if (event.complete) {
          console.log('Card Expiry complete. Focusing on CVC.');
          this.cardCvcElement?.focus(); // Focus on CVC
        }
      });

      // Create and mount the card CVC element
      this.cardCvcElement = this.elements.create('cardCvc', {
        style: {
          base: {
            color: 'black',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
//             fontSize: '9vw',
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

      this.cardCvcElement.mount(cardCvcDiv);

      this.cardCvcElement?.on('focus', () => {
        this.cardCvcTouched = true;
      });

      this.cardCvcElement.on('change', (event: any) => {
        this.cardCvcValid = event.complete && !event.error;
        this.updateOverallValidity(onValidityChangeCallback);

        if (event.empty || !event.complete) {
          console.log('Card number field cleared. Reapplying error highlight.');
//         onFieldInvalidCallback(); // REMOVED TO PREVENT PREEMPTIVE HIGHLIGHTING
        }



      });

    } else {
      console.error("Stripe Elements instance is not available.");
    }
  }

  // Method to create a Payment Intent
  async createPaymentIntent(amount: number): Promise<string | null> {
    try {
      console.log("Creating payment intent for amount:", amount);
      const response = await this.http.post<{ clientSecret: string }>(
        'https://ix8f5ywobj.execute-api.us-east-1.amazonaws.com/create-payment-intent',
        { amount: amount }
      ).toPromise();

      console.log("Received payment intent response:", response);
      return response?.clientSecret || null;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return null;
    }
  }

  // Method to confirm the Card Payment

  async confirmCardPayment(clientSecret: string, paymentData: any) {
    if (!this.stripe || !this.cardNumberElement) {
      console.error("Stripe instance or card element is not initialized.");
      return { paymentIntent: null, error: { message: 'Stripe not initialized' } };
    }

    console.log('Confirming card payment with:', clientSecret);

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardNumberElement,
        },
        receipt_email: paymentData.email, // Explicitly pass receipt email
      });

      if (result.error) {
        console.error('Payment failed:', result.error.message);
      } else {
//         console.log('Payment successful:', result.paymentIntent);
      }

      return result;
    } catch (e) {
      console.error('Error during confirmCardPayment:', e);
      return { paymentIntent: null, error: e };
    }
  }


  // New method to get the Card Element
  getCardElement(): StripeCardNumberElement | null {
    return this.cardNumberElement;
  }

  isCardNumberTouched(): boolean {
    return this.cardNumberTouched;
  }

  isCardExpiryTouched(): boolean {
    return this.cardExpiryTouched;
  }

  isCardCvcTouched(): boolean {
    return this.cardCvcTouched;
  }
  areAllCardFieldsTouched(): boolean {
    return this.cardNumberTouched && this.cardExpiryTouched && this.cardCvcTouched;
  }

  // New method to aggregate the validity of all fields
  private updateOverallValidity(onValidityChangeCallback: (isInvalid: boolean) => void) {
    const isAnyFieldInvalid = !this.cardNumberValid || !this.cardExpiryValid || !this.cardCvcValid;
//     console.log('Overall Stripe validity status:', isAnyFieldInvalid);
    onValidityChangeCallback(isAnyFieldInvalid);
  }

  areAllStripeFieldsValid(): boolean {
    return this.cardNumberValid && this.cardExpiryValid && this.cardCvcValid;
  }

}
