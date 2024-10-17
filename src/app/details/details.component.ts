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
  if (this.mainViewport) {
    const viewport = this.mainViewport.nativeElement;
    const currentImage = viewport.querySelector('img');

    if (currentImage) {
      // Temporarily load the new image to measure its height
      const tempImage = new Image();
      tempImage.src = this.images[type];

      tempImage.onload = () => {
        // Calculate the new image height based on its aspect ratio
        const newImageHeight = tempImage.naturalHeight * (viewport.clientWidth / tempImage.naturalWidth);

        // Determine the height of the current image
        const currentImageHeight = currentImage.clientHeight;

        if (type === 'zoomed') {
          // Set the zoomed image immediately
          this.imageUrl = this.images[type];
          this.selectedImage = type;
          this.isZoomed = true;

          // After a short delay, adjust the viewport height smoothly
          setTimeout(() => {
            viewport.style.height = `${2 * newImageHeight}px`; // Set height to twice the size for zoomed image
            viewport.style.overflow = 'auto';

            // Scroll to the center if zoomed
            const centerX = (tempImage.naturalWidth / 2) - (viewport.clientWidth / 2);
            const centerY = (tempImage.naturalHeight / 2) - (viewport.clientHeight / 2);

            viewport.scrollTo({
              top: centerY,
              behavior: 'auto', // Jump directly to the zoomed-in position
            });
          }, 50); // Adjust the timing as needed to make sure the image is visible first

        } else {
          if (newImageHeight > currentImageHeight) {
            // Transitioning from smaller to larger image
            // Step 1: Change the image first
            this.imageUrl = this.images[type];
            this.selectedImage = type;

            // Step 2: Adjust the viewport height smoothly after a short delay
            setTimeout(() => {
              viewport.style.height = `${newImageHeight}px`;
              this.isZoomed = false;
            }, 100); // Adjust timing as needed

          } else {
            // Transitioning from larger to smaller image
            // Step 1: Adjust the viewport height down first
            viewport.style.height = `${newImageHeight}px`;

            // Step 2: Change the image after height adjustment
            setTimeout(() => {
              this.imageUrl = this.images[type];
              this.selectedImage = type;
              this.isZoomed = false;

              viewport.style.overflow = 'hidden'; // Hide overflow after transition out of zoom
            }, 300); // Adjust this timing as needed for smoother transitions
          }
        }
      };
    }
  }



}





  isSelected(imageType: 'default' | 'framed' | 'zoomed'): boolean {
    return this.selectedImage === imageType;
  }
}
