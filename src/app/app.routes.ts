import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { DetailsComponent } from './details/details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent},
  { path: 'details/:imageId', component: DetailsComponent },
//   { path: 'details/redfish', component: DetailsComponent, data: {imageId: '1'} },
//   { path: 'details/trout', component: DetailsComponent, data: {imageId: '2'} },
//   { path: 'details/flounder', component: DetailsComponent, data: {imageId: '3'} },
  ];


