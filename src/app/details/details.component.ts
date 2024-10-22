import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService, Image } from '../services/image.service';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
//   styleUrl: './details.component.css'
})

export class DetailsComponent implements OnInit {
  image$: Observable<Image | undefined> = of(undefined);
  isZoomView: boolean = false; // To control modal visibility

  @ViewChild('zoomOverlay') zoomOverlay!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('imageId');
    if (id) {
     this.image$ = this.imageService.getImageById(id!);
    }
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

  private setInitialScrollPosition(): void {
      if (this.zoomOverlay && this.zoomOverlay.nativeElement) {
        console.log('Zoom overlay element:', this.zoomOverlay.nativeElement);
        // Scroll to the leftmost part of the zoomed image
        this.zoomOverlay.nativeElement.scrollTo({
          left: 0,
          top: 0,
          behavior: 'auto' // No animation, scroll instantly
        });
// this.zoomOverlay.nativeElement.scrollIntoView({ block: 'start', inline: 'start', behavior: 'auto' });
      } else {

        console.error('Zoom overlay element is not defined');
        }
    }
}
