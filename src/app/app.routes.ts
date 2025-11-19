import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { DetailsComponent } from './details/details.component';
import { PaymentComponent } from './payment/payment.component';
import { CartComponent } from './cart/cart.component';
import { CartNotEmptyGuard } from './guards/cart-not-empty.guard';
import { SuccessGuard } from './guards/success.guard';
import { SuccessComponent } from './success/success.component';
import { AboutComponent } from './about/about.component';
import { OriginalsComponent } from './originals/originals.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent},
  { path: 'details/:imageId', component: DetailsComponent },
  { path: 'payment', component: PaymentComponent, canActivate: [CartNotEmptyGuard] },
  { path: 'cart', component: CartComponent },
  { path: 'success', component: SuccessComponent, canActivate: [SuccessGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'originals', component: OriginalsComponent }
  ];


