import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiBaseUrl = 'https://ix8f5ywobj.execute-api.us-east-1.amazonaws.com/orders';

  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<any> {
    const url = `${this.apiBaseUrl}/create`;
    console.log("creating Order: ", orderData);
    return this.http.post(url, orderData);
  }

  getOrder(orderId: string): Observable<any> {
    const url = `${this.apiBaseUrl}/${orderId}`; // Append orderId to base URL for dynamic path
    console.log('Fetching order with ID:', orderId);
    return this.http.get(url);
  }
}
