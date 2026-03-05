import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { ImageService, Image } from '../services/image.service';
import { ImageService} from '../services/image.service';
import { Image } from '../models/image.interface';
import { Option } from '../models/option.interface';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../services/navigation.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.interface';
import { OriginalsService } from '../services/originals.service'


@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
})

export class DetailsComponent implements OnInit, AfterViewInit {
  cartItems$!: Observable<CartItem[]>; //ADDED 11/19/2025 for ORIGINAL functionality
  image$: Observable<Image | undefined> = of(undefined);
  imageMetadata$: Observable<Partial<Image> | undefined> = of(undefined);
  mainImageUrl: string | null = null;
  zoomImageUrl: string | null = null;
  isZoomView: boolean = false; // To control modal visibility
  currentIndex = 0;
  totalImages: number = 0;
  isAtFirstImage = true;
  isAtLastImage = false;
  isDefaultView = true;
  latestImage: Image | null = null; // 10/4/2025 STICKER UPDATE

  // 3/5/2026 DECOUPLING VIEWPORT IMAGES AND SELECTABLE OPTIONS
  displayImages: string[] = [];
  displayOptions: Option[] = [];

  selectedOption: string | null = null; // New variable for selected option
  selectedPrice: number | null = null; // New variable for selected price
  selectedWeight: number | null = null;
  selectedProductId: string | null = null;

  quantity: number = 1;
  imageId: string = ''; // Store image ID locally
  thumbnailUrl: string | null = null;

  originalStatusResolved = false;


  private debounceTimer: any;

  @ViewChild('zoomOverlay') zoomOverlay!: ElementRef;
  @ViewChild('scrollableContainer') scrollableContainer!: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private imageService: ImageService,
    private navigationService: NavigationService,
    private cartService: CartService,
    private originalsService: OriginalsService
  ) {}

    ngOnInit(): void {

      const id = this.route.snapshot.paramMap.get('imageId');
      this.cartItems$ = this.cartService.getCartItems();

      if (!id) return;
      this.imageId = id;
      this.imageMetadata$ = this.imageService.getImageMetadataById(id);
      this.image$ = this.imageService.getImageById(id);

      this.image$.subscribe((image: Image | undefined) => {

        if (image && image.options && image.options.length > 0) {

          this.latestImage = image;
          this.displayOptions = image.options.filter(opt => opt.subtitle);
          this.displayImages = image.options
            .filter(opt => opt.imageUrl)
            .map(opt => opt.imageUrl as string);

          this.zoomImageUrl = image.zoomImage || null;
          this.mainImageUrl = image.options[0].imageUrl;
          this.totalImages = this.displayImages.length;
          this.thumbnailUrl = image.thumbnail || null;

          this.updateArrowStates();

          // Merge dynamic sold status
          if (image.options?.some(opt => opt.subtitle?.includes('ORIGINAL'))) {

            this.originalsService.getMergedOriginals().subscribe((mergedImages: Image[]) => {

              const mergedImage = mergedImages.find(img => img.id === image.id);
              if (mergedImage?.options && image.options) {
                const mergedOptions = mergedImage.options;

                image.options.forEach(opt => {
                  if (opt.subtitle) {
                    const match = mergedOptions.find(o => o.subtitle === opt.subtitle);
                    if (match) {
                      opt.sold = match.sold;
                    }
                  }
                });
                this.latestImage = image;
                this.originalStatusResolved = true;
              }
            });
          }
        } else {
          console.error(`Image with id ${id} not found`);
        }
      });

      // Default option selection
      this.imageMetadata$.subscribe((metadata) => {
        if (metadata?.options) {
          const validOptions = metadata.options.filter(opt => opt.subtitle);
          if (validOptions.length > 0) {
            this.selectedOption = validOptions[0].subtitle;
            this.selectedPrice = validOptions[0].price;
            this.selectedWeight = validOptions[0].weight;
            this.selectedProductId = validOptions[0].productId;

          }
        }
      });
    }

  isStickerItem(): boolean {
    const optionSubtitle = this.latestImage?.options?.[0]?.subtitle;
    return optionSubtitle ? optionSubtitle.toLowerCase().includes('sticker') : false;
  }

  onOptionChange(): void {
      if (!this.latestImage?.options) return;
      const selected = this.latestImage.options.find(
        option => option.subtitle === this.selectedOption
      );

      this.selectedPrice = selected ? selected.price : null;
      this.selectedWeight = selected ? selected.weight : null;
      this.selectedProductId = selected ? selected.productId : null;
  }

  ngAfterViewInit(): void {
    if (this.scrollableContainer) {
      this.scrollableContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll(): void {
    console.log("onScroll called");
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.scrollableContainer) {
        const container = this.scrollableContainer.nativeElement;

        // Dynamically detect the slide width with type assertion
        const slide = container.querySelector('.image-slide') as HTMLElement | null;
        const slideWidth = slide?.offsetWidth || window.innerWidth;

        const scrollPosition = container.scrollLeft;
        const newIndex = Math.round(scrollPosition / slideWidth);

        if (newIndex !== this.currentIndex) {
          this.currentIndex = newIndex;
          this.updateArrowStates();
        }
      }
    }, 100);
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
  }

  navigateRight(): void {
    if (this.currentIndex < this.totalImages - 1) {
      this.currentIndex++;
      this.scrollToCurrentIndex();

    }
  }

  scrollToCurrentIndex(): void {
    console.log("scrollToCurrentIndex called");
    const scrollableContainer = this.scrollableContainer.nativeElement;

    // Dynamically detect the width of each slide
    const slide = scrollableContainer.querySelector('.image-slide') as HTMLElement | null;
    const slideWidth = slide?.offsetWidth || window.innerWidth; // Fallback to full width for safety

    // Calculate the target scroll position based on the current index and slide width
    const targetOffset = this.currentIndex * slideWidth;

    // Temporarily disable scroll updates to prevent mid-animation progress indicator changes
    this.scrollableContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));

    // Scroll smoothly to the target position
    scrollableContainer.scrollTo({
      left: targetOffset,
      behavior: 'smooth',
    });

    // Create an IntersectionObserver to monitor when the current image is centered
    const targetSlide = scrollableContainer.children[this.currentIndex] as HTMLElement;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When the slide is fully in view, update arrow states and re-enable listeners
            observer.disconnect(); // Disconnect observer once target is in view
            this.scrollableContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
            this.updateArrowStates();
          }
        });
      },
      {
        root: scrollableContainer,
        threshold: 0.5, // Adjust the threshold as needed; 0.5 means it considers the target "in view" when 50% visible
      }
    );

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

  buyNow(): void {
    const currentItem: CartItem = {
      imageId: this.route.snapshot.paramMap.get('imageId') || '',
      optionSubtitle: this.selectedOption || '',
      price: this.selectedPrice || 0,
      quantity: this.quantity,
      thumbnailUrl: this.mainImageUrl || '',
      weight: this.selectedWeight || 0,
      productId: this.selectedProductId || ''
    };

    console.log('currentItem=', currentItem);
    this.cartService.setSelectedItem(currentItem); // Store the current item in the service
    this.cartService.setBuyNowFlow(true); // Set the Buy Now flow
    this.navigationService.goToPayment(); // Navigate to the payment component
  }

  addToCart(): void {
    if (this.selectedOption && this.selectedPrice && this.selectedWeight && this.selectedProductId !== null) {
         this.cartService.addItem({
           imageId: this.imageId,
           optionSubtitle: this.selectedOption || '',
           price: this.selectedPrice || 0,
           quantity: this.quantity,          // UI-facing
           internalQuantity: this.quantity * (this.selectedOption?.toLowerCase().includes('stickers') ? 3 : 1), // bundle for pricing
           thumbnailUrl: this.thumbnailUrl,
           weight: this.selectedWeight || 0,
           productId: this.selectedProductId || ''
         });
    console.log('added imageid: ', this.selectedOption);
    } else {
      console.error('Unable to add to cart: Invalid option or price.');
    }
//   console.log('thumbnailUrl= ', this.mainImageUrl)
  console.log('selectedWeight= ', this.selectedWeight)
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    } else {

      }
  }

  goToIndividualPrints(){
    this.navigationService.goToIndividualPrints();
  }

  goToContact(){
    this.navigationService.goToContact();
    }

  isOriginal(): boolean {
     if (!this.selectedOption) return false;
     return this.originalsService.isOriginal(this.selectedOption);
    }


  isOriginalSold(): boolean {
    // Non-originals bypass this check and never have buttons disabled
    if (!this.isOriginal()) return false;

    // Original but status not yet resolved → assume sold
    if (!this.originalStatusResolved) return true;

    // Now we can safely check real status
    const activeOption = this.latestImage?.options?.find(
      (opt) => opt.subtitle === this.selectedOption
    );

    return activeOption?.sold === true;
  }

  isOriginalInCart(cartItems: CartItem[] | null): boolean {
      if (!cartItems) return false;

      return cartItems.some(
        item =>
          item.imageId === this.imageId &&   // current detail page's image
          item.optionSubtitle === this.selectedOption // ensures it’s THIS original
      );
  }

  disableAddToCart(cartItems: CartItem[] | null): boolean {
    if(!this.isOriginal()) { return false }
    if (this.isOriginalSold()) return true;       // sold = highest priority
    return this.isOriginalInCart(cartItems);      // normal condition
  }

  disableBuyNow(): boolean {
    return this.isOriginalSold();                 // sold = disable
  }

}
