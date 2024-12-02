import { Component, ElementRef, OnInit, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from '../services/navigation.service';
import Payment from 'payment';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
import { CartItem } from '../models/cart-item.interface';
import { Observable, debounceTime, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressAutocompleteService } from '../services/address-autocomplete.service';
import { ShippingService } from '../services/shipping.service';
import { StripeService } from '../services/stripe.service';
import { FormsModule } from '@angular/forms';

const countryNameMapping: { [key: string]: string } = {
  'USA': 'United States',
  // Add other country mappings if needed
};

const stateAbbreviationMapping: { [key: string]: string } = {
  "ALABAMA": "AL",
  "ALASKA": "AK",
  "ARIZONA": "AZ",
  "ARKANSAS": "AR",
  "CALIFORNIA": "CA",
  "COLORADO": "CO",
  "CONNECTICUT": "CT",
  "DELAWARE": "DE",
  "FLORIDA": "FL",
  "GEORGIA": "GA",
  "HAWAII": "HI",
  "IDAHO": "ID",
  "ILLINOIS": "IL",
  "INDIANA": "IN",
  "IOWA": "IA",
  "KANSAS": "KS",
  "KENTUCKY": "KY",
  "LOUISIANA": "LA",
  "MAINE": "ME",
  "MARYLAND": "MD",
  "MASSACHUSETTS": "MA",
  "MICHIGAN": "MI",
  "MINNESOTA": "MN",
  "MISSISSIPPI": "MS",
  "MISSOURI": "MO",
  "MONTANA": "MT",
  "NEBRASKA": "NE",
  "NEVADA": "NV",
  "NEW HAMPSHIRE": "NH",
  "NEW JERSEY": "NJ",
  "NEW MEXICO": "NM",
  "NEW YORK": "NY",
  "NORTH CAROLINA": "NC",
  "NORTH DAKOTA": "ND",
  "OHIO": "OH",
  "OKLAHOMA": "OK",
  "OREGON": "OR",
  "PENNSYLVANIA": "PA",
  "RHODE ISLAND": "RI",
  "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD",
  "TENNESSEE": "TN",
  "TEXAS": "TX",
  "UTAH": "UT",
  "VERMONT": "VT",
  "VIRGINIA": "VA",
  "WASHINGTON": "WA",
  "WEST VIRGINIA": "WV",
  "WISCONSIN": "WI",
  "WYOMING": "WY",
  "DISTRICT OF COLUMBIA": "DC"
};

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  @ViewChild('addressInput') addressInput!: ElementRef; // Reference to the address input field
  @ViewChild('predictionList') predictionList!: ElementRef; // Reference to the prediction list
  @ViewChild('billingAddressInput') billingAddressInput!: ElementRef; // Reference to the billing address input field
  @ViewChild('billingPredictionList') billingPredictionList!: ElementRef; // Reference to the billing prediction list

  isBuyNowFlow$: Observable<boolean>;
  cartItems: CartItem[] = []; // Store cart items or the single item
  paymentForm: FormGroup;
  subtotal: number = 0;
  shippingCost: number | null = null;
  total: number = 0;

  addressPredictions: google.maps.places.AutocompletePrediction[] = [];
  isPredictionsVisible: boolean = false;

  billingAddressPredictions: google.maps.places.AutocompletePrediction[] = [];
  isBillingPredictionsVisible: boolean = false;

  totalWeight: number = 0;
  previousShippingCost: number = 0;
  isValid: boolean = false;
  useShippingAsBilling: boolean = true;

  formErrorMessage: string = '';
  isStripeInvalid: boolean = false;

  errorMessages: { id: number, message: string }[] = [];
  errorIdCounter: number = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private navigationService: NavigationService,
    private cartService: CartService,
    private router: Router,
    private addressAutocompleteService: AddressAutocompleteService,
    private renderer: Renderer2,
    private shippingService: ShippingService,
    private cd: ChangeDetectorRef,
    private stripeService: StripeService
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

  async ngOnInit() {
    const isBuyNowFlow = this.cartService.getBuyNowFlow();
    const selectedItem = this.cartService.getSelectedItem();

    this.cartService.setBuyNowFlow(isBuyNowFlow);

    if (selectedItem && isBuyNowFlow) {
      // Buy Now path: Use selected item
      this.cartItems = [selectedItem];
      this.subtotal = selectedItem.price * selectedItem.quantity;
      this.total = selectedItem.price * selectedItem.quantity + (this.shippingCost ?? 0);
      this.totalWeight = selectedItem.weight * selectedItem.quantity;
    } else {
      // Cart Checkout path: Use cart items and total
      combineLatest([
        this.cartService.getTotal$(),
        this.cartService.getCartItems(),
        this.cartService.getTotalWeight$()
      ]).subscribe(([subtotal, items, totalWeight]) => {
        this.subtotal = subtotal;
        this.total = subtotal + (this.shippingCost ?? 0);
        this.cartItems = items;
        this.totalWeight = parseFloat(totalWeight.toFixed(2));

        if (items.length === 0) {
          this.router.navigate(['/']);
        }
      });

    }

   this.paymentForm.valueChanges
     .pipe(debounceTime(300)) // Add debounce to limit frequency of calls
     .subscribe((formValues) => {
       if (
         formValues.addressLine1 !== undefined &&
         formValues.city !== undefined &&
         formValues.state !== undefined &&
         formValues.zip !== undefined &&
         formValues.country !== undefined
       ) {
         if (this.isAddressValid(formValues)) {
           this.validateAddress(formValues);
         } else {
           this.isValid = false;
         }
       }
     });

    // Initialize Stripe via the service
    console.log('ngOnInit called. Initializing Stripe.');

    await this.stripeService.initializeStripe();

    console.log('Mounting Stripe card elements.');
    this.stripeService.mountCardElements(
      '#card-number-element',
      '#card-expiry-element',
      '#card-cvc-element',
      (cardType: string | null) => {
        console.log('Card type detected:', cardType);
        this.onCardNumberInput(cardType); // Callback for handling card type changes
      },
      (isInvalid: boolean) => {
        console.log('Stripe element validity change detected:', isInvalid);
        this.isStripeInvalid = isInvalid; // Update the state based on validity
        console.log('Updated isStripeInvalid to:', this.isStripeInvalid);
        this.updateStripeFieldHighlight(); // Update the UI accordingly //this aint it
      },
        () => {
          // New callback to reapply the highlight if any field becomes empty or invalid
          this.highlightUntouchedStripeFields();
          console.log('this.highlightUntouchedStripeFields reached in ngOnInit');
        }
    );

    console.log('Stripe card elements mounted.');

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

  isAddressValid(formValues: any): boolean {
    return (
      formValues.addressLine1 &&
      formValues.city &&
      formValues.state &&
      formValues.zip &&
      formValues.country
    );
  }

  normalizeStateInput(state: string): string {
    const normalizedState = state.trim().toUpperCase();
    return stateAbbreviationMapping[normalizedState] || state;
  }

  async handlePayment() {
    console.log("Handle Payment called");

//      // Clear previous error messages
//      this.errorMessages = [];
//
//        let hasEmptyFields = false;
//        let hasInvalidFields = false;
//
//   // Iterate over each control in the form to determine if fields are empty or invalid
//   Object.keys(this.paymentForm.controls).forEach(field => {
//         if (field === 'addressLine2') {
//           return;
//         }
//
//     const control = this.paymentForm.get(field);
//
//     if (control) {
//       if (control.pristine || control.value === '' || control.value === null) {
//         hasEmptyFields = true; // If the control is pristine or its value is empty, it's considered empty
//       } else if (control.invalid && control.touched) {
//         // If the control is filled and touched but still invalid, mark it as invalid
//         hasInvalidFields = true;
//       }
//     }
//   });
//
//   // If there are empty fields, add the general error message
//   if (hasEmptyFields) {
//     this.addErrorMessage('Please fill out all required fields.');
//     this.markMissingFields();
//     this.highlightUntouchedStripeFields(); // Highlight untouched card fields to indicate missing information
// //     this.isStripeInvalid = true; // Prevent payment submission
// //     this.updateStripeFieldHighlight();
//   }
//
//   // If there are specific invalid fields, add their respective messages
//   if (this.paymentForm.get('email')?.invalid && this.paymentForm.get('email')?.touched && this.paymentForm.get('email')?.value !== '') {
//     this.addErrorMessage('Please enter a valid email address.');
//     hasInvalidFields = true;
//   }
//
//   if (!this.isValid && this.paymentForm.get('addressLine1')?.touched && this.paymentForm.get('addressLine1')?.value !== '') {
//     this.addErrorMessage('Please enter a valid shipping address.');
//     hasInvalidFields = true;
//   }
//
//   if (this.isStripeInvalid) {
//     this.addErrorMessage('Please provide valid card details.');
//     this.updateStripeFieldHighlight(); // Ensure Stripe fields are highlighted if invalid
//   }
//
//   // If there are any empty or invalid fields, we prevent submission
//   if (hasEmptyFields || hasInvalidFields) {
//     return;
//   }
//
//     if (this.isStripeInvalid || this.paymentForm.invalid || !this.isValid) {
//       return; // Do not proceed if there are validation issues
//     }

    // Clear previous error messages
      this.errorMessages = [];

    // Use the helper method to validate form fields
    const { hasEmptyFields, hasInvalidFields } = this.validateFormFields();

    if (hasEmptyFields) {
      this.addErrorMessage('Please fill out all required fields.');
      this.markMissingFields();
      this.highlightUntouchedStripeFields(); // Highlight untouched card fields to indicate missing information
    }

    if (this.paymentForm.get('email')?.invalid && this.paymentForm.get('email')?.touched && this.paymentForm.get('email')?.value !== '') {
      this.addErrorMessage('Please enter a valid email address.');
    }

    if (!this.isValid && this.paymentForm.get('addressLine1')?.touched && this.paymentForm.get('addressLine1')?.value !== '') {
      this.addErrorMessage('Please enter a valid shipping address.');
    }

    if (this.isStripeInvalid) {
      this.addErrorMessage('Please provide valid card details.');
      this.updateStripeFieldHighlight(); // Ensure Stripe fields are highlighted if invalid
    }

    // If there are any empty or invalid fields, we prevent submission
    if (hasEmptyFields || hasInvalidFields) {
      return;
    }

    if (this.isStripeInvalid || this.paymentForm.invalid || !this.isValid) {
      return; // Do not proceed if there are validation issues
    }

    const formData = this.paymentForm.value;

    const clientSecret = await this.stripeService.createPaymentIntent(5000); // Set the amount

    if (!clientSecret) {
      console.error("Failed to retrieve client secret from backend");
      return;
    }

    console.log("Client secret retrieved:", clientSecret);

    // Confirm the payment using billing details
    const { paymentIntent, error } = await this.stripeService.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.stripeService.getCardElement(),
        // billing_details: billingDetails,
      },
      receipt_email: formData.email,
    });

    if (error) {
      console.error('Payment failed:', error.message);
    } else if (paymentIntent) {
      console.log('Payment successful:', paymentIntent);
      this.cartService.setBuyNowFlow(false);
      this.cartService.setSelectedItem(null);
    }
  }

  editCart() {
    this.cartService.toggleCartVisibility();
  }

  onCardNumberInput(cardType: string | null): void {
    if (cardType) {
      this.updateCardIcons(cardType);
    } else {
      this.resetCardIcons();
    }
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
      (icon as HTMLElement).style.opacity = '1';
    });
  }

  onAddressInputChange(type: 'shipping' | 'billing', input: string) {
    // console.log(`Address input type: ${type}, input value: ${input}`);
    if (input.length > 2) { // Start autocomplete after a few characters are entered
      this.addressAutocompleteService.getPlacePredictions(input)
        .then(predictions => {
          if (type === 'shipping') {
            this.addressPredictions = [...predictions]; // Store predictions
            this.isPredictionsVisible = predictions.length > 0;
          } else if (type === 'billing') {
            this.billingAddressPredictions = [...predictions];
            this.isBillingPredictionsVisible = predictions.length > 0;
          }
        })
        .catch(error => {
          console.error('Address Autocomplete Error:', error);
          if (type === 'shipping') {
            this.isPredictionsVisible = false;
          } else if (type === 'billing') {
            this.isBillingPredictionsVisible = false;
          }
        });
    } else {
      if (type === 'shipping') {
        this.isPredictionsVisible = false;
      } else if (type === 'billing') {
        this.isBillingPredictionsVisible = false;
      }
    }
  }

  selectPrediction(type: 'shipping' | 'billing', prediction: google.maps.places.AutocompletePrediction) {
    if (prediction.place_id) {
      this.onAddressSelected(type, prediction.place_id);
      if (type === 'shipping') {
        this.isPredictionsVisible = false;
      } else if (type === 'billing') {
        this.isBillingPredictionsVisible = false;
      }
    }
  }

  onAddressSelected(type: 'shipping' | 'billing', placeId: string) {
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['address_components'] //
    };
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

      // Clear previous values in the form
      if (type === 'shipping') {
        this.paymentForm.patchValue({
          addressLine1: '',
          city: '',
          state: '',
          zip: '',
          country: ''
        });
      } else {
        this.paymentForm.patchValue({
          billingAddressLine1: '',
          billingCity: '',
          billingState: '',
          billingZip: '',
          billingCountry: ''
        });
      }

      let streetNumber = '';
      let route = '';

      // Loop through the address components and fill in the form controls
      for (const component of place.address_components) {
        const addressType = component.types[0];

        switch (addressType) {
          case 'street_number':
            streetNumber = component.long_name.trim();
            break;
          case 'route':
            route = component.long_name.trim();
            break;
          case 'locality': // City
            if (type === 'shipping') {
              this.paymentForm.patchValue({ city: component.long_name });
            } else {
              this.paymentForm.patchValue({ billingCity: component.long_name });
            }
            break;
          case 'administrative_area_level_1': // State
            if (type === 'shipping') {
              this.paymentForm.patchValue({ state: component.short_name });
            } else {
              this.paymentForm.patchValue({ billingState: component.short_name });
            }
            break;
          case 'postal_code': // ZIP Code
            if (type === 'shipping') {
              this.paymentForm.patchValue({ zip: component.long_name });
            } else {
              this.paymentForm.patchValue({ billingZip: component.long_name });
            }
            break;
          case 'country': // Country
            const country = component.short_name;
            const mappedCountry = countryNameMapping[country] || country; // Use the mapped value or fallback to original
            if (type === 'shipping') {
              this.paymentForm.patchValue({ country: mappedCountry });
            } else {
              this.paymentForm.patchValue({ billingCountry: mappedCountry });
            }
            break;
          default:
            break;
        }
      }

      const cleanedAddressLine1 = `${streetNumber} ${route}`.trim();
      if (type === 'shipping') {
        this.paymentForm.get('addressLine1')?.setValue(cleanedAddressLine1);
      } else {
        this.paymentForm.get('billingAddressLine1')?.setValue(cleanedAddressLine1);
      }

      // Mark fields as dirty and update validity to reflect user action
      this.paymentForm.markAllAsTouched();
      this.paymentForm.updateValueAndValidity();

      // Trigger address validation and shipping rate calculation directly
      if (type === 'shipping') {
        this.validateAddress(this.paymentForm.value);
      }
    });
  }

  calculateShippingRate() {
    const formValues = this.paymentForm.value;
    const addressLine2 = formValues.addressLine2?.trim() ? formValues.addressLine2 : null;
    const weightString = this.totalWeight.toString();

    // Call the shipping service to calculate the rate
    this.shippingService.calculateShippingRate(
      formValues.addressLine1,
      formValues.addressLine2,
      formValues.city,
      formValues.state,
      formValues.zip,
      formValues.country,
      weightString
    ).subscribe(
      (shippingCost: number) => {
        this.total -= this.previousShippingCost;
        this.shippingCost = shippingCost;
        this.previousShippingCost = shippingCost; //THIS MIGHT NOT BE A GOOD SOLUTION
        this.total = Number(this.total) + Number(this.shippingCost);

        console.log("this.shippingCost = ", this.shippingCost);
        console.log('Calculated shipping cost:', this.shippingCost);

        // Trigger change detection to ensure UI reflects the updated cost
        this.cd.detectChanges();
      },
      (error) => {
        console.error('Error calculating shipping rate:', error);
      }
    );
  }

  validateAddress(formValues: any) {
    const addressLine2 = formValues.addressLine2?.trim() ? formValues.addressLine2 : null;
    formValues.state = this.normalizeStateInput(formValues.state);

    const payload = {
      Address: {
        AddressLine: [formValues.addressLine1],
        City: formValues.city,
        StateProvinceCode: formValues.state,
        PostalCode: formValues.zip,
        CountryCode: formValues.country
      }
    };
    this.shippingService.validateAddress(
      formValues.addressLine1,
      addressLine2,
      formValues.city,
      formValues.state,
      formValues.zip,
      formValues.country
    ).subscribe(
      (isValid: boolean) => {
        if (isValid) {
          console.log('Address validation successful:');
          this.isValid = true;
          this.calculateShippingRate();
        } else {
          console.log("Address is not valid.");
          this.isValid = false;
        }
      },
      (error) => {
        console.error("Error validating address:", error);
        this.isValid = false;
      }
    );
  }

  markMissingFields() {
    Object.keys(this.paymentForm.controls).forEach(field => {

      if (field === 'addressLine2') {
        return;
      }
      const control = this.paymentForm.get(field);

      if (control) {
        // Highlight empty fields
        if (control.value === '' || control.value === null) {
          console.log(`Field "${field}" is empty. Highlighting as missing.`);
          control.markAsTouched();

          // Add the red border by adding the class 'error-highlight'
          const element = document.getElementById(field) as HTMLElement;
          if (element) {
            element.classList.add('error-highlight');
          }
        } else if (control.valid) {
          // Remove highlight from fields that are now valid
          const element = document.getElementById(field) as HTMLElement;
          if (element) {
            element.classList.remove('error-highlight');
          }
        }
      } else {
        console.warn(`Field "${field}" was not found in the form controls.`);
      }
    });

    this.cd.detectChanges(); // Ensures that the UI updates with the changes made to the form control states
  }

  isFieldInvalid(field: string): boolean {
    const control = this.paymentForm.get(field);
    // The field is invalid if it has been interacted with (touched or dirty) and its value is not valid
    return !!control && control.invalid && control.touched && control.value !== '';
  }

  // Method to remove highlight on user input
  removeHighlight(field: string) {
    const control = this.paymentForm.get(field);
    if (control) {
      // Get the input element by field id
      const element = document.getElementById(field) as HTMLInputElement;
      if (element && control.valid) {
        console.log(`Removing error highlight from field: ${field}`);
        element.classList.remove('error-highlight');
      }
    }
  }

  highlightUntouchedStripeFields() {
//     const stripeContainer = document.querySelector('.card-information') as HTMLElement;
//     if( !this.stripeService.areAllCardFieldsTouched()) {
//       stripeContainer.classList.add('error-highlight');
//       }
    const stripeContainer = document.querySelector('.card-information') as HTMLElement;
    if (!this.stripeService.areAllCardFieldsTouched()) {
      stripeContainer.classList.add('error-highlight');
    } else {
      stripeContainer.classList.remove('error-highlight'); // Optionally remove the highlight if all fields are touched.
    }
  }

  updateStripeFieldHighlight() {
//     console.log('updateStripeFieldHighlight called, isStripeInvalid:', this.isStripeInvalid);
    const stripeContainer = document.querySelector('.card-information') as HTMLElement;
    if (this.isStripeInvalid) {
//       console.log('Adding error highlight.');
//       stripeContainer.classList.add('error-highlight'); //this aint it
    } else {
//       console.log('Removing error highlight.');
      stripeContainer.classList.remove('error-highlight');
    }
  }

  // Add a new error message
  addErrorMessage(message: string) {
    const newError = { id: this.errorIdCounter++, message };
    this.errorMessages.push(newError);
  }

  // Remove an error message by id
  removeErrorMessage(id: number) {
    this.errorMessages = this.errorMessages.filter(error => error.id !== id);
  }

  private validateFormFields(): { hasEmptyFields: boolean; hasInvalidFields: boolean } {
    let hasEmptyFields = false;
    let hasInvalidFields = false;

    Object.keys(this.paymentForm.controls).forEach(field => {
      if (field === 'addressLine2') {
        return; // Skip optional fields
      }

      const control = this.paymentForm.get(field);

      if (control) {
        if (control.pristine || control.value === '' || control.value === null) {
          hasEmptyFields = true;
        } else if (control.invalid && control.touched) {
          hasInvalidFields = true;
        }
      }
    });

    return { hasEmptyFields, hasInvalidFields };
  }


}
