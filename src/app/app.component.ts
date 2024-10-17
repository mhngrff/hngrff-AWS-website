import { Component } from '@angular/core';
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
          this.animateOut('home');
        } else if (event.url === '/') {
          this.animateOut('details');
        }
      }
    });
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
      }
        this.switchComponents(currentComponent);
    }
  }

  animateIn(nextComponent: string) {
    const nextComponentElement = document.querySelector(`.${nextComponent}-container`);
    if (nextComponentElement) {
      if (nextComponent === 'home') {
        this.renderer.addClass(nextComponentElement, 'home-slide-in');
        this.renderer.addClass(nextComponentElement, 'visible');
      } else {
        this.renderer.addClass(nextComponentElement, 'details-slide-in');
        this.renderer.addClass(nextComponentElement, 'visible');

      }
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
