import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { DetailsComponent } from './details/details.component';
import { PaymentComponent } from './payment/payment.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent},
  { path: 'details/:imageId', component: DetailsComponent },
  { path: 'payment', component: PaymentComponent }
  ];


