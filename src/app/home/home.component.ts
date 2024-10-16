import { Component, Renderer2, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, NavigationEnd, Router, NavigationStart } from '@angular/router'
import { Subscription } from 'rxjs';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
              private renderer: Renderer2,
              private el: ElementRef,
              private navigationService: NavigationService
              ) {}

  ngOnInit(): void {}

//    goToDetails(imageId: string) {
//      const currentPage = this.el.nativeElement.querySelector('.home-slide-animation');
//      if(currentPage) {
//        this.renderer.addClass(currentPage, '.slide-out');
//      }
//
//     setTimeout(() => {
//       this.router.navigate(['/details', imageId]);
//     }, 500);
//    }

  /* THIS PARTIALLY WORKS, BUT WE ARE MOVING NAV METHODS TO APP.COMPONENT.TS
    goToDetails(imageId: string) {

      const currentPage = document.querySelector('.home-slide-animation');
      if (currentPage) {
      this.renderer.addClass(currentPage, 'slide-out');
      }

      setTimeout(() => {
        console.log('home.component.ts - navigation triggered' );
      this.router.navigate(['/details', imageId]);
      }, 500);

    }
  */

  goToDetails(imageId: string){
//     console.log('home.component.ts - HIT goToDetails()', imageId);

    this.navigationService.goToDetails(imageId);

  }

}
