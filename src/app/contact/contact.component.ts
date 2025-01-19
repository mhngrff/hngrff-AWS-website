import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  isShippingVisible = false;
  isFramingVisible = false;
  isTrackingVisible = false;

  toggleShipping(): void {
    this.isShippingVisible = !this.isShippingVisible;
  }

  toggleTracking(): void {
    this.isTrackingVisible = !this.isTrackingVisible;
  }

  toggleFraming(): void {
    this.isFramingVisible = !this.isFramingVisible;
  }

}
