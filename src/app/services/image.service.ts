import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SubsetImage {
  type: string;
  url: string;
}

export interface Image {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  subsetImages?: SubsetImage[];
  mainImage: string;
  zoomImage?: string;
}

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

  getImageById(id: string): Observable<Image | undefined> {
    return this.getImages().pipe(
      map(images => images.find(image => image.id === id))
    );
  }
}
