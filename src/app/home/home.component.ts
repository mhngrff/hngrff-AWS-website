import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
// import { ImageService, Image } from '../services/image.service';
import { ImageService } from '../services/image.service';
import { Image } from '../models/image.interface';
import { Option } from '../models/option.interface';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [CommonModule],
  styleUrls: ['../../less/home.less']
})
export class HomeComponent implements OnInit, AfterViewInit {
//   @ViewChild('footer', { static: false }) footer!: ElementRef;
//   @ViewChild('parallax', { static: false }) parallax!: ElementRef;

  images: Image[] = [];
  imageLoaded: boolean = false;

  constructor(
    private imageService: ImageService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.imageService.getImages().subscribe(data => {
      this.images = data;
    });

    this.route.queryParams.subscribe(params => {
      const scrollTo = params['scrollTo']; // Get the 'scrollTo' value from query params
      if (scrollTo) {
        console.log('scrollTo = TRUE');
        setTimeout(() => {
          const element = document.getElementById(scrollTo); // Find the target element
          if (element) {
            console.log('element = TRUE');
            element.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to the element
          } else {
            console.log('element = FALSE');
          }
        }, 150); // Delay to ensure DOM is rendered
      }
    });
  }

  ngAfterViewInit(): void {
//     this.setupParallaxFooterBehavior();
  }

//   setupParallaxFooterBehavior(): void {
//     const footer = this.footer.nativeElement;
//     const parallax = this.parallax.nativeElement;
//
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             // Calculate exact top position for absolute positioning
//             const parallaxBottom = parallax.getBoundingClientRect().top + window.scrollY + parallax.offsetHeight;
//             const footerTop = footer.getBoundingClientRect().top + window.scrollY;
//
//             // Dynamic adjustment: 5% of the parallax height
//             const adjustment = parallax.offsetHeight * 0.1;
//             parallax.style.position = 'absolute';
//             parallax.style.top = `${footerTop - parallax.offsetHeight - adjustment}px`; // Dynamic adjustment
//           } else {
//             // Restore parallax when footer is out of view
//             parallax.style.position = 'fixed';
//             parallax.style.top = '0';
//           }
//         });
//       },
//       {
//         root: null,
//         threshold: 0.1, // Trigger when 10% of the footer is visible
//       }
//     );
//
//     observer.observe(footer);
//   }


  onImageLoad(): void{
    this.imageLoaded = true;
  }

  goToDetails(imageId: string): void {
    this.navigationService.goToDetails(imageId);
  }
}
