import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
//   styleUrl: './details.component.css'
  animations: [
      trigger('slideIn', [
        transition(':enter', [
          style({ transform: 'translateX(-100%)', opacity: 0 }),
          animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
        ])
      ])
    ]
})

export class DetailsComponent implements OnInit{
  @ViewChild('mainViewport') mainViewport!: ElementRef;
  imageId!: string;
  imageUrl!: string;
  isZoomed = false;
  selectedImage!: string;

  images: { default: string, framed: string, zoomed: string } = {
    default: '',
    framed: '',
    zoomed: ''
    };

  // Mapping imageIds to image file paths
  imageMap: { [key: string]: string } = {
    redfish: 'assets/images/redfish-1.jpg',
    trout: 'assets/images/trout-1.jpg',
    flounder: 'assets/images/flounder-1.jpg'
  };

  constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
      this.route.params.subscribe((params) => {
        this.imageId = params['imageId'];
        this.selectedImage = 'default'; //Default selection on page load
        this.imageUrl = this.imageMap[this.imageId]; //Maybe can remove this

        if (this.imageId === 'redfish') {
          this.images = {
            default: 'assets/images/redfish-1.jpg',
            framed: 'assets/images/redfish-framed.jpg',
            zoomed: 'assets/images/redfish-high-def.jpg'
            }
          }
        else if (this.imageId === 'trout') {
          this.images = {
            default: 'assets/images/trout-1.jpg',
            framed: 'assets/images/trout-framed.jpg',
            zoomed: 'assets/images/trout-high-def.jpg'
            }
          }
        else if (this.imageId === 'flounder') {
          this.images = {
            default: 'assets/images/flounder-1.jpg',
            framed: 'assets/images/flounder-framed.jpg',
            zoomed: 'assets/images/flounder-high-def.jpg'
            }
          }
        this.imageUrl = this.images.default;
     });
  }

  switchImage(type: 'default' | 'framed' | 'zoomed'): void {
    this.imageUrl = this.images[type];
    this.isZoomed = (type === 'zoomed');
    this.selectedImage = type;

    // Set the scroll position for zoomed images
    if (this.isZoomed && this.mainViewport) {
      const viewport = this.mainViewport.nativeElement;
      const image = viewport.querySelector('img');

      // Wait for the image to load before setting scroll position
      if (image) {
        image.onload = () => {
          const imageWidth = image.naturalWidth;
          const imageHeight = image.naturalHeight;

          // Adjust the scroll values as needed
          const centerX = (imageWidth / 2) - (viewport.clientWidth / 2);
          const centerY = (imageHeight / 2) - (viewport.clientHeight / 2);

          viewport.scrollTo({
            top: centerY,
             //left: centerX,
            behavior: 'smooth' // Optional: smooth scrolling
          });
        };
      }
    }
  }
  isSelected(imageType: 'default' | 'framed' | 'zoomed'): boolean {
    return this.selectedImage === imageType;
  }
}
