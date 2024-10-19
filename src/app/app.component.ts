import { Component, ViewChild } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Renderer2 } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { DetailsComponent } from './details/details.component';
import { CommonModule } from '@angular/common';
import { NavigationService } from './services/navigation.service';
import { ImageStateService } from './services/imageState.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    DetailsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'hngrff-angular-app';
  isHomeVisible = true;
  isDetailsVisible = true;

   @ViewChild(DetailsComponent) detailsComponent!: DetailsComponent;

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private renderer: Renderer2,
    private imageStateService: ImageStateService
  ) {
    this.setupRouteListener();
  }

  setupRouteListener() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url.startsWith('/details/')) {
          const imageId = event.url.split('/').pop();
          this.imageStateService.setImageId(imageId || '');
//           this.animateOut('home');
             this.waitForDetailsReady();
        } else if (event.url === '/') {
          this.animateOut('details');
        }
      }
    });
  }
// setupRouteListener() {
//     this.router.events.subscribe((event) => {
//       if (event instanceof NavigationStart) {
//         if (event.url.startsWith('/details/')) {
//           const imageId = event.url.split('/').pop();
//           this.imageStateService.setImageId(imageId || '');
//           this.animateOut('home');
//         } else if (event.url === '/') {
//           this.animateOut('details');
//
//           // Set the reset flag and reset state after animation for details page
//           if (this.detailsComponent) {
//             this.detailsComponent.resetAfterAnimation = true;
//
//             // Attach event listener to run resetState after animation ends
//             const detailsElement = document.querySelector('.details-container');
//             if (detailsElement) {
//               detailsElement.addEventListener(
//                 'animationend',
//                 () => {
//                   this.detailsComponent.resetState();
//                 },
//                 { once: true } // Ensures the listener is removed after it's executed
//               );
//             }
//
//             // Fallback to reset if animationend is missed
//             setTimeout(() => {
//               if (this.detailsComponent.resetAfterAnimation) {
//                 console.warn('Fallback reset triggered due to animation end possibly missed.');
//                 this.detailsComponent.resetState();
//               }
//             }, 200);
//           }
//         }
//       }
//     });
//   }


 // New method to wait for the details component to be ready
  waitForDetailsReady() {
    const detailsElement = document.querySelector('app-details');
    if (detailsElement) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class' &&
            detailsElement.classList.contains('details-slide-ready')
          ) {
            // Details are ready, trigger the animation
            this.animateOut('home');
            observer.disconnect(); // Stop observing once the element is ready
          }
        });
      });

      // Observe changes to the attributes of the details element
      observer.observe(detailsElement, { attributes: true });
    }
  }

  animateOut(currentComponent: string) {
    const componentElement = document.querySelector(`.${currentComponent}-container`);
    if (componentElement) {
      if (currentComponent === 'home') {
        this.renderer.addClass(componentElement, 'home-slide-out');
        this.renderer.removeClass(componentElement, 'visible');
      } else {
        this.renderer.addClass(componentElement, 'details-slide-out');
        this.renderer.removeClass(componentElement, 'visible');

        // Remove 'details-slide-ready' to ensure we start fresh on next navigation
        const detailsElement = document.querySelector('app-details');
        if (detailsElement) {
          this.renderer.removeClass(detailsElement, 'details-slide-ready');
        }
      }
        this.switchComponents(currentComponent);
    }
  }

  animateIn(nextComponent: string) {
    const nextComponentElement = document.querySelector(`.${nextComponent}-container`);
    if (nextComponentElement) {
      setTimeout(() => {
        if (nextComponent === 'home') {
          this.renderer.addClass(nextComponentElement, 'home-slide-in');
          this.renderer.addClass(nextComponentElement, 'visible');
        } else {
          this.renderer.addClass(nextComponentElement, 'details-slide-in');
          this.renderer.addClass(nextComponentElement, 'visible');
        }
      }, 0);
    }
  }

  switchComponents(currentComponent: string) {
    if (currentComponent === 'home') {
      this.animateIn('details');
    } else {
      this.animateIn('home');
    }
  }
}

