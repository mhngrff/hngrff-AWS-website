import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withDebugTracing, NavigationEnd, Router } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { ViewportScroller } from '@angular/common';
import { inject } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
    ]
  }).then(appRef => {
    // Scroll to top on every navigation end -- FIX SCROLL POSITION PRESERVATION ISSUE 9/11/2025
    const router = appRef.injector.get(Router);
    const viewportScroller = appRef.injector.get(ViewportScroller);

    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        viewportScroller.scrollToPosition([0, 0]);
      }
    });
}).catch(err => console.error(err));

