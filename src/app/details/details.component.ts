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
  isTallImage = false;
  private routeSub!: Subscription;

  images: { default: string, framed: string, zoomed: string } = {
    default: '',
    framed: '',
    zoomed: ''
    };

  imageMap: { [key: string]: string } = {
    redfish: 'assets/images/redfish-1.jpg',
    trout: 'assets/images/trout-1.jpg',
    flounder: 'assets/images/flounder-1.jpg',
    fishSlam: 'assets/images/fish-slam-1.jpg'
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
    this.calculateAspectRatio();

    }

  setImages(imageId: string): void {
    if (this.imageMap[imageId]) {
      if(imageId === 'fishSlam') {
        this.images= {
          default: this.imageMap[imageId],
          framed: `assets/images/fish-slam-framed.jpg`,
          zoomed: `assets/images/fish-slam-individual-framed.jpg`
          };
        } else {
      this.images = {
        default: this.imageMap[imageId],
        framed: `assets/images/${imageId}-framed.jpg`,
        zoomed: `assets/images/${imageId}-high-def.jpg`
        };
      }
      this.imageUrl = this.images.default;
    } else {
      console.warn('Unknown image ID: ', imageId);
    }
  }

private calculateAspectRatio(): void {
  // Create a temporary image to load and determine its dimensions
  const tempImage = new Image();
  tempImage.src = this.imageUrl;

  tempImage.onload = () => {
    const aspectRatio = tempImage.naturalWidth / tempImage.naturalHeight;
    this.isTallImage = aspectRatio < 1; //If width < height, it's a tall image and we set isTallImage
    console.log('Aspect Ration Calculated:', aspectRatio, 'Is Tall Image: ', this.isTallImage);
    };
  }

switchImage(type: 'default' | 'framed' | 'zoomed'): void {
  if (this.mainViewport) {
    const viewport = this.mainViewport.nativeElement;
    const currentImage = viewport.querySelector('img');

    if (currentImage) {
      // Temporarily load the new image to measure its height and dimensions
      const tempImage = new Image();
      tempImage.src = this.images[type];

      tempImage.onload = () => {
        // Calculate the new image height based on its aspect ratio
        const newImageHeight = tempImage.naturalHeight * (viewport.clientWidth / tempImage.naturalWidth);
        const currentImageHeight = currentImage.clientHeight;

        if (type === 'zoomed') {
          // Set the zoomed image immediately and make adjustments to viewport height/scroll
          this.imageUrl = this.images[type];
          this.selectedImage = type;
          this.isZoomed = true;

          setTimeout(() => {
            viewport.style.height = `${2 * newImageHeight}px`;
            viewport.style.overflow = 'auto';

            const centerY = (tempImage.naturalHeight / 2) - (viewport.clientHeight / 2);

            viewport.scrollTo({
              top: (centerY / 1.2),
              behavior: 'auto',
            });
          }, 0);

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
              viewport.style.overflow = 'hidden';
            }, 0);

          } else {
            // Transitioning from larger to smaller image
            // Step 1: Adjust the viewport height down first
            viewport.style.height = `${newImageHeight}px`;

            // Step 2: Change the image after height adjustment
            setTimeout(() => {
              this.imageUrl = this.images[type];
              this.selectedImage = type;
              this.isZoomed = false;

              viewport.style.overflow = 'hidden';
            }, 150);
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
