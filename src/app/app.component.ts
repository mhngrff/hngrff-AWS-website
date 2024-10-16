import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { Renderer2 } from '@angular/core';
// import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent} from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { DetailsComponent } from './details/details.component';
import { CommonModule } from '@angular/common';
import { NavigationService } from './services/navigation.service'


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    DetailsComponent,
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
//OLD PARTIAL SOLUTION, ANIMATIONS NOT SIMULTANEOUS
//   constructor(private router: Router, private renderer: Renderer2) {
//     let currentPage: Element | null = null;
//
//     this.router.events.subscribe((event) => {
//
// //       if (event instanceof NavigationStart) {
// // //         console.log('NavigationStart - Current route URL:', this.router.url);
// //
// //                 // Print the current page based on the current URL
// // //                 if (this.router.url.includes('/details')) {
// // //                   console.log('Currently on the Details page.');
// // //                 } else if (this.router.url === '/' || this.router.url.includes('/home')) {
// // //                   console.log('Currently on the Home page.');
// // //                 }
// //
// // //         if (this.isInitialLoad) {
// // //           console.log('app.component.ts - isInitialLoad');
// // //           this.isInitialLoad = false; // Reset flag after the first navigation
// // //           return; // Skip animations on initial load
// // //         }
// //         // Delay to ensure DOM is ready
// //         setTimeout(() => {
// //           const currentPage = document.querySelector('.home-slide-animation, .details-slide-animation');
// //           if (currentPage) {
// //
// //                         if (currentPage.classList.contains('home-slide-animation')) {
// //                           console.log('Applying slide-out to HOME page');
// //                         } else if (currentPage.classList.contains('details-slide-animation')) {
// //                           console.log('Applying slide-out to DETAILS page');
// //                         }
// //
// //             this.renderer.addClass(currentPage, 'slide-out');
// //             console.log('app.component.ts - NavigationStart - current-page element FOUND and slide-out applied. ')
// //           } else {
// //             console.error('app.component.ts - NavigationStart - current-page element not found.');
// //           }
// //         }, 300); // Short timeout for slide-out
// //       }
//
//       if (event instanceof NavigationEnd) {
// //                 console.log('NavigationEnd - New route URL:', this.router.url);
// //                 // Print the new page based on the new URL
// //                 if (this.router.url.includes('/details')) {
// //                   console.log('Navigated to the Details page.');
// //                 } else if (this.router.url === '/' || this.router.url.includes('/home')) {
// //                   console.log('Navigated to the Home page.');
// //                 }
//         setTimeout(() => {
//           const newPage = document.querySelector('.home-slide-animation, .details-slide-animation');
//           if (newPage && newPage !== currentPage) {
//
//                         if (newPage.classList.contains('home-slide-animation')) {
//                           console.log('Applying slide-in to HOME page');
//                         } else if (newPage.classList.contains('details-slide-animation')) {
//                           console.log('Applying slide-in to DETAILS page');
//                         }
//
//             this.renderer.addClass(newPage, 'slide-in');
//             console.log('app-component.ts - NavigationEnd - new-page element FOUND and slide-in applied.');
//           } else {
//             console.error('app.component.ts - NavigationEnd - details-page element not found.');
//           }
//         }, 500); // Short timeout for slide-in
//       }
//     });
//   }
//OLD, BROKEN SOLUTION (FOR REFERENCING CODE)
//     constructor(private router: Router, private renderer: Renderer2) {
//       let currentPage: Element | null = null;
//
//       this.router.events.subscribe((event) => {
//
//         if (event instanceof NavigationStart) {
//             const currentPage = document.querySelector('.home-slide-animation, .details-slide-animation');
//             if (currentPage) {
//
//                           if (currentPage.classList.contains('home-slide-animation')) {
//                             console.log('Applying slide-out to HOME page');
//                           } else if (currentPage.classList.contains('details-slide-animation')) {
//                             console.log('Applying slide-out to DETAILS page');
//                           }
//
//               this.renderer.addClass(currentPage, 'slide-out');
//               console.log('app.component.ts - NavigationStart - current-page element FOUND and slide-out applied. ')
//             } else {
//               console.error('app.component.ts - NavigationStart - current-page element not found.');
//             }
//         }
//
//     });
//   }

export class AppComponent {

  title = 'hngrff-angular-app';



  isHomeVisible = true; //changed this from true to false "prevent both components from rendering at the same time"
  isDetailsVisible = true;

  constructor(private router: Router,
              private navigationService: NavigationService,
              private renderer: Renderer2) {

//                 this.router.events.subscribe(event => {
//                   if (event instanceof NavigationStart) {
//
//                     console.log('app.component.ts  - acknowledged router event');
//
//                     if (event.url === '/details/redfish'){
//
//                       console.log('app.component.ts - event.url === /details/redfish');
//
//                       this.animateOut('home');
//
//                     } else if (event.url === '/') {
//
//                       console.log('app.component.ts - event.url === / ');
//
//                       this.animateOut('details')
//                       }
//
//                   }
//                 });
              this.router.events.subscribe(event => {
                if (event instanceof NavigationStart) {
//                   console.log('app.component.ts  - acknowledged router event');

                  if (event.url.startsWith('/details/')) {

                    const imageId = event.url.split('/').pop(); // Extract the imageId from the URL

                    console.log('EVENT.URL === /DETAILS/');

                    this.animateOut('home'); // Animate out the home component

//                     this.animateIn('details');

                  } else if (event.url === '/') {

                    console.log('EVENT.URL === /');

                    this.animateOut('details');

//                     this.animateIn('home');
                  }
                }
              });
  }

  ngOnInit() {
//     const homeElement = document.querySelector('.home-container');
//     const detailsElement = document.querySelector('.details-container');
//
//     // Set classes for the initial load
//     this.renderer.addClass(homeElement, 'home-slide-in');
//     this.renderer.addClass(detailsElement, 'details-slide-in');
//     this.renderer.removeClass(detailsElement, 'visible'); // Ensure it's not visible initially
  }

    // Animation Logic
    animateOut(currentComponent: string) {
      const componentElement = document.querySelector(`.${currentComponent}-container`);

         if (currentComponent === 'home') {
            this.renderer.addClass(componentElement, 'home-slide-out');
            this.renderer.removeClass(componentElement, 'visible');
         } else {
            this.renderer.addClass(componentElement, 'details-slide-out');
            this.renderer.removeClass(componentElement, 'visible');

         }

      this.renderer.removeClass(componentElement, 'hidden'); // Ensure it’s visible
//       this.renderer.addClass(componentElement, 'slide-out');
      console.log('app.comp - animateOut', currentComponent);

      setTimeout(() => {
//         this.switchComponents(currentComponent);
//         this.animateIn(currentComponent === 'home' ? 'home' : 'details');
        if(currentComponent === 'home'){
          this.animateIn('details');
          console.log('animateIn - details ');
          } else {
            this.animateIn('home');
            console.log('animateIn - home ');
            }
//         console.log('animateIn - ', currentComponent);
      }, 50); // Adjust this based on your animation duration
    }

        animateIn(nextComponent: string) {
//           const nextComponentElement = document.querySelector(`.${nextComponent}-container`);
//           this.renderer.removeClass(nextComponentElement, 'hidden'); // Ensure it’s visible
//           this.renderer.addClass(nextComponentElement, 'slide-in');
//           console.log('app.comp - animateIn', nextComponent);
//
//             setTimeout(() => {
//               // Optionally remove 'hidden' class if not needed
//               this.renderer.removeClass(nextComponentElement, 'hidden');
//             }, 500); // Adjust as needed to match your animation duration
        console.log('made it to animateIn method');
           const nextComponentElement = document.querySelector(`.${nextComponent}-container`);
//            this.renderer.removeClass(nextComponentElement, 'hidden'); // Ensure it’s visible
//
//            // Apply the appropriate slide-in class based on the next component
           if (nextComponent === 'home') {
              this.renderer.addClass(nextComponentElement, 'home-slide-in');
              this.renderer.addClass(nextComponentElement, 'visible');
           } else {
              console.log('addClass details-slide-in')
              this.renderer.addClass(nextComponentElement, 'details-slide-in');
              this.renderer.addClass(nextComponentElement, 'visible');

           }
              this.renderer.removeClass(nextComponentElement, 'hidden'); // Ensure it’s visible

//              setTimeout(() => {
//                 this.renderer.removeClass(nextComponentElement, 'home-slide-in');
//                 this.renderer.removeClass(nextComponentElement, 'details-slide-in');
//                 this.renderer.addClass(nextComponentElement, 'visible');
//              }, 50); // Small timeout allows for the slide-in animation to happen

        }

    // Toggle the visibility of components based on the current view
    switchComponents(currentComponent: string) {
//       if (currentComponent === 'home') {
//         this.isHomeVisible = false; //changed from false
//         this.isDetailsVisible = true;
//       } else {
//         this.isHomeVisible = true;
//         this.isDetailsVisible = false; //changed from false
//       }
    }

//     animateOut(currentComponent: string) {
//       const componentElement = document.querySelector(`.${currentComponent}-container`);
//       this.renderer.addClass(componentElement, 'slide-out');
//
//       // Add a slight delay before switching components to avoid blank page issue
//       setTimeout(() => {
//         this.switchComponents(currentComponent);
//         // Start loading the next component's animations
//         this.animateIn(currentComponent === 'home' ? 'details' : 'home');
//       }, 500); // Match this with the duration of your slide-out animation
//     }
//
//     animateIn(nextComponent: string) {
//       const nextComponentElement = document.querySelector(`.${nextComponent}-container`);
//       this.renderer.removeClass(nextComponentElement, 'hidden'); // Ensure it’s visible
//       this.renderer.addClass(nextComponentElement, 'slide-in');
//     }
//
//      switchComponents(currentComponent: string) {
//           if (currentComponent === 'home') {
//             this.isHomeVisible = false;
//             this.isDetailsVisible = true;
//           } else {
//             this.isHomeVisible = true;
//             this.isDetailsVisible = false;
//           }
//         }

}
