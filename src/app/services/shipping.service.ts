import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Add this import to use map operator


@Injectable({
  providedIn: 'root'
})
export class ShippingService {
//   private shippingApiUrl = 'http://localhost:3000/shipping/calculate-shipping'; // Update this URL accordingly
  private shippingApiUrl = 'https://ix8f5ywobj.execute-api.us-east-1.amazonaws.com/shipping/calculate-shipping'; // Update this URL accordingly
  private validationApiUrl = 'https://ix8f5ywobj.execute-api.us-east-1.amazonaws.com/validation/validate-address';

  constructor(private http: HttpClient) {}

  validateAddress(
    addressLine1: string,
    addressLine2: string | null,
    city: string,
    state: string,
    zip: string,
    country: string
  ): Observable<boolean> {
    const addressLines = [addressLine1];
    if (addressLine2?.trim()) {
      addressLines.push(addressLine2);
    }
    const payload = {
      Address: {
        AddressLine: addressLines,
        City: city,
        StateProvinceCode: state,
        PostalCode: zip,
        CountryCode: country
      }
    };

    console.log("Shipping Service - Payload to be sent:", JSON.stringify(payload, null, 2));

    return this.http.post<{ isValid: boolean }>(this.validationApiUrl, payload)
      .pipe(
        map(response => response.isValid)
      );
  }


  calculateShippingRate(
    shippingName: string,
    addressLine1: string,
    addressLine2: string | null,
    city: string,
    state: string,
    zip: string,
    country: string,
    weightString: string
  ): Observable<number> {
    const addressLines = [addressLine1];
     if (addressLine2?.trim()) {
       addressLines.push(addressLine2);
     }
    const payload = {
      Name: shippingName,
      Address: {
        AddressLine: addressLines,
//         line1: addressLine1,
//         line2: addressLine2,
        City: city,
        StateProvinceCode: state,
        PostalCode: zip,
        CountryCode: country
      },
      Weight: weightString
    };

    return this.http.post<{ rate: number}>(this.shippingApiUrl, payload)
      .pipe(
        map((response: { rate: number }) => response.rate)
      );
  }
}
