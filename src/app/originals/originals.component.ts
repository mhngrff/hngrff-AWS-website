import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Image } from '../models/image.interface';
import { Option } from '../models/option.interface';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { OriginalsService } from '../services/originals.service';

@Component({
  selector: 'app-originals',
  standalone: true,
  templateUrl: './originals.component.html',
  imports: [CommonModule],
  styleUrls: ['../../less/originals.less']
})
export class OriginalsComponent implements OnInit, AfterViewInit {
//   @ViewChild('footer', { static: false }) footer!: ElementRef;
//   @ViewChild('parallax', { static: false }) parallax!: ElementRef;

  images: Image[] = [];
  imageLoaded: Record<string, boolean> = {};


  constructor(
    private imageService: ImageService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router,
    private originalsService: OriginalsService
  ) {}

  ngOnInit(): void {
      this.originalsService.getMergedOriginals().subscribe(merged => {
      this.images = merged;
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
  }

  onImageLoad(id: string): void {
    this.imageLoaded[id] = true;
    console.log("this.imageLoaded[id] = " + this.imageLoaded[id]);
  }

  goToDetails(imageId: string): void {
    this.navigationService.goToDetails(imageId);
  }

}
