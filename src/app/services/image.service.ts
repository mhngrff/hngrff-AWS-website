import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Image } from '../models/image.interface';

// export interface Option {
//   subtitle: string;
//   price: number;
//   imageUrl: string;
// }
//
// export interface Image {
//   id: string;
//   title: string;
//   description: string;
//   currency: string;
//   mainImage: string;
//   zoomImage?: string;
//   options?: Option[];
// }

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private dataUrl = '/assets/data/image-data.json';

  constructor(private http: HttpClient) {}

  getImages(): Observable<Image[]> {
    return this.http.get<{ images: Image[] }>(this.dataUrl).pipe(
      map(data => data.images) // Extract the images array from the response
    );
  }

  getImageMetadataById(id: string): Observable<Partial<Image> | undefined> {
    return this.getImages().pipe(
      map(images => {
        const image = images.find(img => img.id === id);
        if (image) {
          // Return everything except the URLs for images
          const { title, description, currency, id, options } = image;
          return { title, description, currency, id, options };
        }
        return undefined;
      })
    );
  }

  getImageById(id: string): Observable<Image | undefined> {
    return this.getImages().pipe(
      map(images => images.find(image => image.id === id))
    );
  }
}
