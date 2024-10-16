import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import for animations
// console.log(BrowserAnimationsModule);
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { CommonModule } from '@angular/common';

// console.log('Starting application...')

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: BrowserAnimationsModule, useValue: BrowserAnimationsModule }
  ]
}).then(() => {
 }).catch(err => {
   console.error('Error during bootstrap:', err);
 });


