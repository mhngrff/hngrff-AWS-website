import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ImageData {
  id: string;
  title: string;
  url: string;
  zoomUrl?: string;
  framedUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private dataUrl = 'assets/data/image-data.json';

  constructor(private http: HttpClient) {}

  getImages(): Observable<ImageData[]> {
    return this.http.get<ImageData[]>(this.dataUrl);
  }

  getImageById(id: string): Observable<ImageData | undefined> {
    return this.http.get<ImageData[]>(this.dataUrl).pipe(
      map((images: ImageData[]) => images.find((image: ImageData) => image.id === id))
    );
  }
}
