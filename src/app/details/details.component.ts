import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageStateService } from '../services/imageState.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
})

export class DetailsComponent implements OnInit{
  @ViewChild('mainViewport') mainViewport!: ElementRef;
  imageId!: string;
  imageUrl!: string;
  isZoomed = false;
  selectedImage!: string;
  private routeSub!: Subscription;

  images: { default: string, framed: string, zoomed: string } = {
    default: '',
    framed: '',
    zoomed: ''
    };

  imageMap: { [key: string]: string } = {
    redfish: 'assets/images/redfish-1.jpg',
    trout: 'assets/images/trout-1.jpg',
    flounder: 'assets/images/flounder-1.jpg'
  };

  constructor(private route: ActivatedRoute,
              private renderer: Renderer2,
              private el: ElementRef,
              private imageStateService: ImageStateService
  ) {}

  ngOnInit() {

    this.imageStateService.getImageIdObservable().subscribe((newImageId) => {
      if (newImageId) {
        this.updateImageDetails(newImageId);
        }
      });
  }

  private updateImageDetails(imageId: string): void {
    this.imageId = imageId;
    console.log('details component received imageId: ', this.imageId);

    this.selectedImage = 'default';
    this.setImages(this.imageId);

    }

  setImages(imageId: string): void {
    if (this.imageMap[imageId]) {
      this.images = {
        default: this.imageMap[imageId],
        framed: `assets/images/${imageId}-framed.jpg`,
        zoomed: `assets/images/${imageId}-high-def.jpg`
        };
      this.imageUrl = this.images.default;
    } else {
      console.warn('Unknown image ID: ', imageId);
    }
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
