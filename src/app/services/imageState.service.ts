import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageStateService {
  private imageIdSubject = new BehaviorSubject<string | null>(null);

  setImageId(imageId: string): void {
    this.imageIdSubject.next(imageId);
  }

  getImageIdObservable() {
    return this.imageIdSubject.asObservable();
    }

  getImageId(): string | null {
    return this.imageIdSubject.getValue();
    }
}
