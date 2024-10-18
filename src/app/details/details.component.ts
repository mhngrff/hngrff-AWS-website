import { Component, OnInit, ViewChild, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageStateService } from '../services/imageState.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
})

export class DetailsComponent implements OnInit, OnDestroy{
  @ViewChild('mainViewport') mainViewport!: ElementRef;
  imageId!: string;
  imageUrl!: string;
  isZoomed = false;
  selectedImage!: string;
  isTallImage = false;
  private routeSub!: Subscription;
  private routerSub!: Subscription;

  images: { default: string, framed: string, zoomed: string, individualFramed: string } = {
    default: '',
    framed: '',
    zoomed: '',
    individualFramed: ''
    };

  imageMap: { [key: string]: string } = {
    redfish: 'assets/images/redfish-1.jpg',
    trout: 'assets/images/trout-1.jpg',
    flounder: 'assets/images/flounder-1.jpg',
    fishSlam: 'assets/images/fish-slam-1.jpg'
  };

  constructor(private route: ActivatedRoute,
              private router: Router,
              private renderer: Renderer2,
              private el: ElementRef,
              private imageStateService: ImageStateService
  ) {}

  ngOnInit() {
    this.routeSub = this.imageStateService.getImageIdObservable().subscribe((newImageId) => {
      if (newImageId) {
        this.updateImageDetails(newImageId);
      }
    });

    // Subscribe to NavigationEnd events to reset state when navigating back to the details page
this.routerSub = this.router.events.subscribe((event) => {
  if (event instanceof NavigationEnd) {
    this.resetState();
  }
});

  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }


  private updateImageDetails(imageId: string): void {
    this.imageId = imageId;
    console.log('details component received imageId: ', this.imageId);

    this.selectedImage = 'default';
    this.setImages(this.imageId);
    this.calculateAspectRatio();

    }

  private resetState(): void {
    this.selectedImage = 'default';
    this.isZoomed = false;

    if (this.mainViewport) {
      const viewport = this.mainViewport.nativeElement;
      viewport.style.height = 'auto';
      viewport.style.overflow = 'hidden';

  this.imageUrl = this.images.default; // Reset to default image
  }
}

  setImages(imageId: string): void {
    if (this.imageMap[imageId]) {
      if(imageId === 'fishSlam') {
        this.images= {
          default: this.imageMap[imageId],
          framed: `assets/images/fish-slam-framed.jpg`,
          zoomed: `fuckOff`,
          individualFramed: `assets/images/fish-slam-individual-framed.jpg`
          };
        } else {
      this.images = {
        default: this.imageMap[imageId],
        framed: `assets/images/${imageId}-framed.jpg`,
        zoomed: `assets/images/${imageId}-high-def.jpg`,
        individualFramed: `fuckOff`
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

switchImage(type: 'default' | 'framed' | 'zoomed' | 'individualFramed'): void {
  if (this.mainViewport) {
    const viewport = this.mainViewport.nativeElement;
    const currentImage = viewport.querySelector('img');

    if (currentImage) {
      // Load the new image to determine its height
      const tempImage = new Image();
      tempImage.src = this.images[type];

      tempImage.onload = () => {

       // Calculate the new image height based on its aspect ratio
       const newImageHeight = tempImage.naturalHeight * (viewport.clientWidth / tempImage.naturalWidth);

       // Determine the height of the current image
       const currentImageHeight = currentImage.clientHeight;

       if (type === 'zoomed') {//ADDED THIS IF STATEMENT
         console.log('trying to access a zoomed image')
          // Set the zoomed image immediately
          this.imageUrl = this.images[type];
          this.selectedImage = type;
          this.isZoomed = true;

          setTimeout(() => {
            viewport.style.height = `${2 * newImageHeight}px`; // Set height to twice the size for zoomed image
            viewport.style.overflow = 'auto';

            const centerY = (tempImage.naturalHeight /2 ) - ( viewport.clientHeight / 2);

            viewport.scrollTo({
              top: centerY,
              behavior: 'auto', // Jump directly to the zoomed-in position
            });
            }, 0);

       } else {

          if(newImageHeight > currentImageHeight) {

            this.imageUrl = this.images[type];
            this.selectedImage = type;

            viewport.style.height = `${newImageHeight}px`;
            this.isZoomed = false;

            } else {

            viewport.style.height = `${newImageHeight}px`;

            setTimeout(() => {
              this.imageUrl = this.images[type];
              this.selectedImage = type;
              this.isZoomed = false;
              viewport.style.overflow = 'hidden'; // Hide overflow after transition out of zoom
              }, 150);
            }
          }

       };
    }
  }
}




  isSelected(imageType: 'default' | 'framed' | 'zoomed' | 'individualFramed'): boolean {
    return this.selectedImage === imageType;
  }
}
