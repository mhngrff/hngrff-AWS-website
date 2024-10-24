import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image } from '../services/image.service';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
//   styleUrl: './details.component.css'
})

export class DetailsComponent implements OnInit, AfterViewInit {
  image$: Observable<Image | undefined> = of(undefined);
  imageMetadata$: Observable<Partial<Image> | undefined> = of(undefined);
  mainImageUrl: string | null = null;
  isZoomView: boolean = false; // To control modal visibility
  currentIndex = 0;
  totalImages: number = 0;
  isAtFirstImage = true;
  isAtLastImage = false;
  isDefaultView = true;

  private debounceTimer: any;

  @ViewChild('zoomOverlay') zoomOverlay!: ElementRef;
  @ViewChild('scrollableContainer') scrollableContainer!: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private imageService: ImageService,
    private navigationService: NavigationService
  ) {}

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('imageId');
//     if (id) {
//       this.image$ = this.imageService.getImageById(id!);
//       this.image$.subscribe((image: Image | undefined) => {
//         if (image) {
//           this.totalImages = (image.alternateViews?.length || 0) + 1; // Add +1 for the default image
//           this.currentIndex = 0;
//           this.updateArrowStates();
//         } else {
//           console.error(`Image with id ${id} not found`);
//           // Handle the error appropriately (e.g., redirect to home page or show a message)
//         }
//       });
//     }
//   }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('imageId');
    if (id) {
      // Fetch the metadata first (title, description, price)
      this.imageMetadata$ = this.imageService.getImageMetadataById(id!);

      setTimeout(() => {
      // Fetch the full image data separately
      this.image$ = this.imageService.getImageById(id!);
      this.image$.subscribe((image: Image | undefined) => {
        if (image) {
          this.mainImageUrl = image.mainImage;
          this.totalImages = (image.alternateViews?.length || 0) + 1;
          this.updateArrowStates();
        } else {
          console.error(`Image with id ${id} not found`);
        }
      });
    }, 0);
    }
  }

  ngAfterViewInit(): void {
    if (this.scrollableContainer) {
      this.scrollableContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set a debounce delay (e.g., 100ms) to limit how frequently we update the index
    this.debounceTimer = setTimeout(() => {
      if (this.scrollableContainer) {
        const container = this.scrollableContainer.nativeElement;
        const scrollPosition = container.scrollLeft;
        const newIndex = Math.round(scrollPosition / window.innerWidth);

        if (newIndex !== this.currentIndex) {
          this.currentIndex = newIndex;
          this.updateArrowStates();
        }
      }
    }, 100); // Adjust debounce delay to change how quickly the progress indicator updates after scrolling
  }

  updateArrowStates(): void {
    this.isAtFirstImage = this.currentIndex === 0;
    this.isAtLastImage = this.currentIndex === this.totalImages - 1;
    this.isDefaultView = this.currentIndex === 0;
  }

  navigateLeft(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToCurrentIndex();

    }
//     this.updateArrowStates(); THIS APPEARS TO DO NOTHING
  }

  navigateRight(): void {
    if (this.currentIndex < this.totalImages - 1) {
      this.currentIndex++;
      this.scrollToCurrentIndex();

    }
//     this.updateArrowStates(); THIS APPEARS TO DO NOTHING
  }

//   scrollToCurrentIndex(): void {
//     const scrollableContainer = document.querySelector('.scrollable-container') as HTMLElement;
//     const offset = this.currentIndex * window.innerWidth;
//     scrollableContainer.scrollTo({
//       left: offset,
//       behavior: 'smooth'
//     });
//   }

//   scrollToCurrentIndex(): void {
//     const scrollableContainer = this.scrollableContainer.nativeElement;
//     const targetOffset = this.currentIndex * window.innerWidth;
//
//     // Temporarily disable scroll updates to prevent mid-animation progress indicator changes
//     this.scrollableContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
//
//     // Scroll smoothly to the target position
//     scrollableContainer.scrollTo({
//       left: targetOffset,
//       behavior: 'smooth'
//     });
//
//     // Monitor the scroll position until it matches the targetOffset
//     const handleScroll = () => {
//       const currentScrollPosition = scrollableContainer.scrollLeft;
//
//       if (Math.abs(currentScrollPosition - targetOffset) <= 1) {
//         // Re-enable the scroll event listener when the rest state is reached
//         scrollableContainer.removeEventListener('scroll', handleScroll);
//         this.scrollableContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
//
//         // Update arrow states and progress indicator at the rest state
//         setTimeout(() => {
//         this.updateArrowStates();
//         }, 100);
//       }
//     };
//
//     // Attach the listener to monitor the scroll progress
//     scrollableContainer.addEventListener('scroll', handleScroll);
//   }

  scrollToCurrentIndex(): void {
    const scrollableContainer = this.scrollableContainer.nativeElement;
    const targetOffset = this.currentIndex * window.innerWidth;

    // Temporarily disable scroll updates to prevent mid-animation progress indicator changes
    this.scrollableContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));

    // Scroll smoothly to the target position
    scrollableContainer.scrollTo({
      left: targetOffset,
      behavior: 'smooth'
    });

    // Create an IntersectionObserver to monitor when the current image is centered
    const targetSlide = scrollableContainer.children[this.currentIndex] as HTMLElement;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // When the slide is fully in view, update arrow states and re-enable listeners
          observer.disconnect(); // Disconnect observer once target is in view
          this.scrollableContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
          this.updateArrowStates();
        }
      });
    }, {
      root: scrollableContainer,
      threshold: 0.5 // Adjust the threshold as needed; 0.5 means it considers the target "in view" when 50% visible
    });

    // Start observing the current slide element
    observer.observe(targetSlide);
  }



  openZoomView(): void {
    this.isZoomView = true;

    setTimeout(() => {
      if (this.zoomOverlay) {
        this.setInitialScrollPosition();
      }
    }, 0);
  }

  closeZoomView(): void {
    this.isZoomView = false;
  }

  //THIS MIGHT BE USELESS AND CAN BE REMOVED ...
  private setInitialScrollPosition(): void {
    if (this.zoomOverlay && this.zoomOverlay.nativeElement) {
      console.log('Zoom overlay element:', this.zoomOverlay.nativeElement);
       // Scroll to the leftmost part of the zoomed image
       this.zoomOverlay.nativeElement.scrollTo({
         left: 0,
         top: 0,
         behavior: 'auto' // No animation, scroll instantly
       });
    } else {
       console.error('Zoom overlay element is not defined');
    }
  }

  onImageLoad(event: Event): void {
    const imgElement = event.target as HTMLElement;
    imgElement.classList.add('loaded');
  }

  goToPayment(): void {
    this.navigationService.goToPayment();
    }

  addToCart(): void {
    }
}
