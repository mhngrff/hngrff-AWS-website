import { Component, OnInit, ViewChild, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageStateService } from '../services/imageState.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('mainViewport') mainViewport!: ElementRef;
  imageId!: string;
  imageUrl!: string;
  isZoomed = false;
  selectedImage!: string;
  isTallImage = false; // Determines if the current image is tall (affects layout)
  hasZoomedOption = false; // New boolean to determine if a zoomed image is available

  private routeSub!: Subscription;
  private routerSub!: Subscription;

  public resetAfterAnimation: boolean = false;

  // Updated images object to hold thumbnails and zoomed
  images: { thumbnails: string[], zoomed: string } = {
    thumbnails: [],
    zoomed: ''
  };

  // Map image IDs to default image paths
  imageMap: { [key: string]: string } = {
    redfish: 'assets/images/redfish-1.jpg',
    trout: 'assets/images/trout-1.jpg',
    flounder: 'assets/images/flounder-1.jpg',
    fishSlam: 'assets/images/fish-slam-1.jpg'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private imageStateService: ImageStateService
  ) {}

  ngOnInit() {
    // Subscription to the image ID observable
    this.routeSub = this.imageStateService.getImageIdObservable().subscribe((newImageId) => {
      if (newImageId) {
        this.updateImageDetails(newImageId);
      }
    });

    // Subscribe to NavigationEnd events to reset state when navigating back to the details page
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/') {
          // Set resetAfterAnimation flag to true, so the next time resetState is called, it performs the full reset
          this.resetAfterAnimation = true;

          // Attach an event listener for when the animation ends, and then call resetState()
          const detailsElement = document.querySelector('.details-container');
          if (detailsElement) {
            detailsElement.addEventListener('animationend', () => {
              this.resetState();
            }, { once: true }); // Ensures the listener is removed after it's executed
          }

          // Fallback: Forcefully reset after a timeout if animationend is missed
          setTimeout(() => {
            if (this.resetAfterAnimation) {
              console.warn('Fallback reset triggered due to animation end possibly missed.');
              this.resetState();
            }
          }, 200); // Adjust this timeout to slightly longer than your animation duration
        }
      }
    });
//     this.routerSub = this.router.events.subscribe((event) => {
//       if (event instanceof NavigationStart) {
//         // When navigating away from details page, reset state
//         if (this.router.url.startsWith('/details/')) {
//           // Set resetAfterAnimation flag to true, so the next time resetState is called, it performs the full reset
//           this.resetAfterAnimation = true;
//
//           // Attach an event listener for when the animation ends, and then call resetState()
//           const detailsElement = document.querySelector('.details-container');
//           if (detailsElement) {
//             detailsElement.addEventListener('animationend', () => {
//               this.resetState();
//             }, { once: true }); // Ensures the listener is removed after it's executed
//           }
//
//           // Fallback: Forcefully reset after a timeout if animationend is missed
//           setTimeout(() => {
//             if (this.resetAfterAnimation) {
//               console.warn('Fallback reset triggered due to animation end possibly missed.');
//               this.resetState();
//             }
//           }, 200); // Adjust this timeout to slightly longer than your animation duration
//         }
//       }
//     });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  // Update image details based on selected imageId
//   private updateImageDetails(imageId: string): void {
//     this.imageId = imageId;
//     console.log('details component received imageId: ', this.imageId);
//
//     this.selectedImage = 'thumbnail0';
//     this.setImages(this.imageId);
//
//     const tempImage = new Image();
//     tempImage.src = this.images.thumbnails[0]; // Use the first thumbnail as the default image
//
//     tempImage.onload = () => {
//       const aspectRatio = tempImage.naturalWidth / tempImage.naturalHeight;
//       this.isTallImage = aspectRatio < 1; // Determine if the image is tall
//       console.log('Aspect Ratio Calculated:', aspectRatio, 'Is Tall Image: ', this.isTallImage);
//
//       // Set the imageUrl only after determining if the image is tall
//       this.imageUrl = this.images.thumbnails[0];
//       this.triggerSlideAnimation();
//     };
//   }
private updateImageDetails(imageId: string): void {
  this.imageId = imageId;
  console.log('details component received imageId: ', this.imageId);

  this.selectedImage = 'thumbnail0';
  this.setImages(this.imageId);

  const tempImage = new Image();
  tempImage.src = this.images.thumbnails[0]; // Use the first thumbnail as the default image

  tempImage.onload = () => {
    const aspectRatio = tempImage.naturalWidth / tempImage.naturalHeight;
    this.isTallImage = aspectRatio < 1; // Determine if the image is tall
    console.log('Aspect Ratio Calculated:', aspectRatio, 'Is Tall Image: ', this.isTallImage);

    // Set the imageUrl only after determining if the image is tall
    this.imageUrl = this.images.thumbnails[0];
    this.triggerSlideAnimation();

    // Trigger change detection manually if needed
    this.el.nativeElement.querySelector('img').onload = () => {
      console.log('Image loaded successfully');
    };
  };
}



  // Function to trigger slide animation (can be customized)
  private triggerSlideAnimation(): void {
    this.renderer.addClass(this.el.nativeElement, 'details-slide-ready');
  }

  // Reset the state of the details page (useful for navigation)
//   private resetState(): void {
// //     this.imageId = '';
// //     this.selectedImage = 'thumbnail0';
// //     this.isZoomed = false;
// //
// //     if (this.mainViewport) {
// //       const viewport = this.mainViewport.nativeElement;
// //       viewport.style.height = 'auto';
// //       viewport.style.overflow = 'hidden';
// //
// // //       this.imageUrl = this.images.thumbnails[0]; // Reset to first thumbnail as default
// //        this.imageUrl = '';
// //     }
//     if (this.mainViewport) {
//       const viewport = this.mainViewport.nativeElement;
//
//       // Reset the expanded class regardless of where the navigation is happening
//       this.renderer.removeClass(viewport, 'expanded');
//
//       if (this.resetAfterAnimation) {
//         // Full reset only after animation finishes
//         this.imageId = '';
//         this.selectedImage = 'thumbnail0';
//         this.isZoomed = false;
// //         this.imageUrl = null;
//         viewport.style.height = 'auto';
//         viewport.style.overflow = 'hidden';
//
// //         setTimeout(() => {
// //           this.imageUrl = '';
// //           },1000);
//
//         // Reset the flag
//         this.resetAfterAnimation = false;
//       }
//     }
//   }

public resetState(): void {
  if (this.mainViewport) {
    const viewport = this.mainViewport.nativeElement;

    // Reset the expanded class regardless of where the navigation is happening
    this.renderer.removeClass(viewport, 'expanded');

    if (this.resetAfterAnimation) {
      // Full reset only after animation finishes
      this.imageId = '';
      this.selectedImage = 'thumbnail0';
      this.isZoomed = false;

      // Set to undefined or leave as is to avoid rendering issues
//       this.imageUrl = '';

      viewport.style.height = 'auto';
      viewport.style.overflow = 'hidden';

      // Reset the flag
      this.resetAfterAnimation = false;
    }
  }
}


  // Set image paths based on the selected imageId
  setImages(imageId: string): void {
    if (this.imageMap[imageId]) {
      // Update image paths for the current imageId
      if (imageId === 'fishSlam') {
        this.images = {
          thumbnails: [
            this.imageMap[imageId],
            'assets/images/fish-slam-framed.jpg',
            'assets/images/fish-slam-individual-framed.jpg'
          ],
          zoomed: '' // No zoomed option for this image set
        };
      } else {
        this.images = {
          thumbnails: [
            this.imageMap[imageId],
            `assets/images/${imageId}-framed.jpg`
          ],
          zoomed: `assets/images/${imageId}-high-def.jpg`
        };
      }

      // Check if a zoomed option exists
      this.hasZoomedOption = !!this.images.zoomed;

      // Set the first thumbnail as the default image to be displayed
      this.imageUrl = this.images.thumbnails[0];
    } else {
      console.warn('Unknown image ID: ', imageId);
    }
  }

  // Calculate the aspect ratio of the current image to determine layout
  private calculateAspectRatio(): void {
    const tempImage = new Image();
    tempImage.src = this.imageUrl;

    tempImage.onload = () => {
      const aspectRatio = tempImage.naturalWidth / tempImage.naturalHeight;
      this.isTallImage = aspectRatio < 1; // If width < height, it's a tall image
      console.log('Aspect Ratio Calculated:', aspectRatio, 'Is Tall Image: ', this.isTallImage);
    };
  }

  // Switch the displayed image (either a thumbnail or zoomed version)
switchImage(type: string): void {
  if (this.mainViewport) {
    const viewport = this.mainViewport.nativeElement;

    if (type.startsWith('thumbnail')) {
      // Handle switching to a thumbnail
      const index = parseInt(type.replace('thumbnail', ''), 10);
      if (this.images.thumbnails[index]) {
        console.log('Switching to thumbnail:', type);
        this.imageUrl = this.images.thumbnails[index];
        this.selectedImage = type;
        this.isZoomed = false;

        // Remove expanded class if present (since we are switching away from zoomed view)
        this.renderer.removeClass(viewport, 'expanded');
        console.log('Removed expanded class from viewport');

        // Reset the viewport height and overflow
        setTimeout(() => {
          viewport.style.height = 'auto';
          viewport.style.overflow = 'hidden';
          console.log('Reset viewport style after switching to thumbnail');
        }, 0); // Small delay to ensure changes do not interfere
      }
    } else if (type === 'zoomed' && this.hasZoomedOption) {
      // Handle switching to a zoomed image if available
      console.log('Switching to zoomed view');
      this.imageUrl = this.images.zoomed;
      this.selectedImage = type;
      this.isZoomed = true;

      if (!this.isTallImage) {
        // Add expanded class to handle zoom effect
        setTimeout(() => {
          this.renderer.addClass(viewport, 'expanded');
          console.log('Added expanded class to viewport');

          // Adjust height after ensuring the class has been applied
          setTimeout(() => {
            viewport.style.height = '65vh';  // This should match your CSS .expanded height
            viewport.style.overflow = 'auto'; // Ensure overflow is set for scrolling

            // Set scroll position to focus on center if necessary
            const centerY = (viewport.scrollHeight / 2) - (viewport.clientHeight / 2);
            viewport.scrollTo({
              top: centerY,
              behavior: 'smooth'
            });
            console.log('Adjusted viewport height and scroll for zoomed view');
          }, 50); // Adjust timing to ensure the height change takes effect after the expanded class is applied
        }, 10);
      }
    }
  }
}



  // Determine if the given image type is currently selected
  isSelected(imageType: string): boolean {
    return this.selectedImage === imageType;
  }
}
