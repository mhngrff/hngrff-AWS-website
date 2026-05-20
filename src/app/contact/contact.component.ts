import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  isPrintsVisible = false;
  isShippingVisible = false;
  isTrackingVisible = false;
  isCommissionVisible = false;
  isOriginalVisible = false;

  togglePrints(): void {
    this.isPrintsVisible = !this.isPrintsVisible;
  }

  toggleShipping(): void {
    this.isShippingVisible = !this.isShippingVisible;
  }

  toggleTracking(): void {
    this.isTrackingVisible = !this.isTrackingVisible;
  }

  toggleCommission(): void {
    this.isCommissionVisible = !this.isCommissionVisible;
  }

  toggleOriginal(): void {
    this.isOriginalVisible = !this.isOriginalVisible;
  }

}
