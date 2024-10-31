import { Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from '../services/navigation.service';
import Payment from 'payment';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { CartItem } from '../models/cart-item.interface';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressAutocompleteService } from '../services/address-autocomplete.service';

const countryNameMapping: { [key: string]: string } = {
  'USA': 'United States',
  // Add other country mappings if needed
};

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  @ViewChild('addressInput') addressInput!: ElementRef; // Reference to the address input field
  @ViewChild('predictionList') predictionList!: ElementRef; // Reference to the prediction list
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardNumberElement: StripeCardNumberElement | null = null;
  cardExpiryElement: StripeCardExpiryElement | null = null;
  cardCvcElement: StripeCardCvcElement | null = null;
  clientSecret: string | null = null;
  currentCardType: string | null = null; // Tracks detected card type
  isBuyNowFlow$: Observable<boolean>;

  cartItems: CartItem[] = []; // Store cart items or the single item

  paymentForm: FormGroup;

  subtotal: number = 0;
  shippingCost: number = 10.69;
  total: number = 0;

  addressPredictions: google.maps.places.AutocompletePrediction[] = [];

  isPredictionsVisible: boolean = false;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private navigationService: NavigationService,
    private cartService: CartService,
    private router: Router,
    private addressAutocompleteService: AddressAutocompleteService,
    private renderer: Renderer2
    ) {
      this.isBuyNowFlow$ = this.cartService.isBuyNowFlow$;
      this.paymentForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        shippingName: ['', Validators.required],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required],
        country: ['', Validators.required],
        cardholderName: ['', Validators.required],
      });
    }

  ngOnInit() {
    const isBuyNowFlow = this.cartService.getBuyNowFlow();
    console.log('isBuyNowFlow$ = ', this.cartService.getBuyNowFlow());
    this.cartService.setBuyNowFlow(isBuyNowFlow);
    const selectedItem = this.cartService.getSelectedItem();
    if (selectedItem && isBuyNowFlow) {
      // Buy Now path: Use selected item
      this.cartItems = [selectedItem];
      this.subtotal = selectedItem.price * selectedItem.quantity;
      this.total = selectedItem.price * selectedItem.quantity + this.shippingCost;
      console.log('Buy Now path - Total:', this.total);
    } else {
      // Cart Checkout path: Use cart items and total
      this.cartService.getTotal$().subscribe((subtotal) => {
        this.subtotal = subtotal;
        this.total = subtotal + this.shippingCost;
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
    console.log('Stripe Public Key:', environment.stripePublicKey);
    loadStripe(environment.stripePublicKey).then((stripe) => {
      if (stripe) {
        this.stripe = stripe;
        this.setupStripeElements();
      }
    });

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      // Check if the click is outside of the address input and prediction list
      if (
        this.isPredictionsVisible &&
        !this.addressInput.nativeElement.contains(event.target) &&
        !this.predictionList.nativeElement.contains(event.target)
      ) {
        this.isPredictionsVisible = false; // Hide the prediction list
      }
    });
  }

//   async handlePayment(event: Event) {
//     event.preventDefault();
//     console.log("Handling payment submission...");
//     if (!this.stripe || !this.cardNumberElement || !this.cardExpiryElement || !this.cardCvcElement) {
//       console.error("Stripe or card elements not properly set up");
//       return;
//     }
//     console.log("Creating payment intent...");
//     // Create a PaymentIntent by calling the backend
//     await this.createPaymentIntent();
//     if (!this.clientSecret) {
//       console.error("Failed to retrieve client secret from backend");
//       return;
//     }
//     console.log("Retrieved client secret:", this.clientSecret);
//     // Use the client secret to confirm the payment
//     const { paymentIntent, error } = await this.stripe.confirmCardPayment(this.clientSecret, {
//       payment_method: {
//         card: this.cardNumberElement!,
//       }
//     });
//     if (error) {
//       console.error('Payment failed:', error.message);
//     } else if (paymentIntent) {
//       console.log('Payment successful:', paymentIntent);
//       this.cartService.setBuyNowFlow(false);
//       this.cartService.setSelectedItem(null);
//     }
//   }

  async handlePayment() {
    if (this.paymentForm.invalid) {
      console.error('Form is invalid, please fill out the required fields correctly.');
      return;
    }

    const formData = this.paymentForm.value;
    console.log('Form Data:', formData);

    // Proceed with creating a Payment Intent and confirming the payment
    await this.createPaymentIntent();

    if (!this.clientSecret) {
      console.error("Failed to retrieve client secret from backend");
      return;
    }

    const { paymentIntent, error } = await this.stripe!.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.cardNumberElement!,
        billing_details: {
          name: formData.cardholderName,
          email: formData.email,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zip,
            country: formData.country,
          },
        },
      },
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
    this.cartService.toggleCartVisibility();
  }

  setupStripeElements() {
    if (this.stripe) {

      this.elements = this.stripe.elements();

      if (this.elements) {

        // Create and mount the card number element
        this.cardNumberElement = this.elements.create('cardNumber', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '7vw',
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
          this.cardNumberElement.mount('#card-number-element');

          this.cardNumberElement?.on('change', (event: any) => {

            // Check the event's brand field to identify card type
            const cardType = event.brand !== 'unknown' ? event.brand : null;

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
          this.cardExpiryElement.mount('#card-expiry-element');
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
          this.cardCvcElement.mount('#card-cvc-element');
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
        'https://ix8f5ywobj.execute-api.us-east-1.amazonaws.com/create-payment-intent',
        { amount }
      ).toPromise();
      this.clientSecret = response?.clientSecret || null;
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
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

  onAddressInputChange(input: string) {
    if (input.length > 2) { // Start autocomplete after a few characters are entered
      this.addressAutocompleteService.getPlacePredictions(input)
        .then(predictions => {
          console.log('Predictions:', predictions);
          this.addressPredictions = predictions; // Store predictions
          this.isPredictionsVisible = predictions.length > 0;
        })
        .catch(error => {
          console.error('Address Autocomplete Error:', error);
          this.isPredictionsVisible = false;
        });
    } else {
//       this.addressPredictions = []; // Clear predictions if input is too short
      this.isPredictionsVisible = false;
    }
  }

  selectPrediction(prediction: google.maps.places.AutocompletePrediction) {
    if (prediction.place_id) {
      this.onAddressSelected(prediction.place_id);
      this.isPredictionsVisible = false;
    }
  }

  onAddressSelected(placeId: string) {
    // Create a request for place details
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['address_components'] // Specify the fields you need (e.g., address components)
    };

    // Initialize the PlacesService using an HTML div element (can be hidden)
    const service = new google.maps.places.PlacesService(document.createElement('div'));

    // Request place details
    service.getDetails(request, (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
        console.error('Failed to get place details:', status);
        return;
      }

      if (!place.address_components) {
        console.error('No address components found in place details');
        return;
      }

      console.log('Place details:', place);

      // Clear previous values in the form
      this.paymentForm.patchValue({
        addressLine1: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      });

      // Loop through the address components and fill in the form controls
      for (const component of place.address_components) {
        const addressType = component.types[0];

        switch (addressType) {
          case 'street_number':
            this.paymentForm.patchValue({
              addressLine1: `${component.long_name} ${this.paymentForm.get('addressLine1')?.value}`
            });
            break;
          case 'route':
            this.paymentForm.patchValue({
              addressLine1: `${this.paymentForm.get('addressLine1')?.value} ${component.long_name}`
            });
            break;
          case 'locality': // City
            this.paymentForm.patchValue({
              city: component.long_name
            });
            break;
          case 'administrative_area_level_1': // State
            this.paymentForm.patchValue({
              state: component.short_name
            });
            break;
          case 'postal_code': // ZIP Code
            this.paymentForm.patchValue({
              zip: component.long_name
            });
            break;
          case 'country': // Country
            const country = component.short_name;
            const mappedCountry = countryNameMapping[country] || country; // Use the mapped value or fallback to original
            this.paymentForm.patchValue({
              country: mappedCountry
            });
            break;
          default:
            break;
        }
      }
    });
  }



}
