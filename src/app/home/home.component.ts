import { Component, OnInit } from '@angular/core';
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
export class HomeComponent implements OnInit {
  images: Image[] = [];

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

  goToDetails(imageId: string): void {
    this.navigationService.goToDetails(imageId);
  }
}
