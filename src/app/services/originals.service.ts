import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Image } from '../models/image.interface';
import { Option } from '../models/option.interface';
import { ImageService } from './image.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface OriginalStatus {
  id: string;       // subtitle string
  sold: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class OriginalsService {

//   private apiUrl = 'https://4ooriklr9f.execute-api.us-east-1.amazonaws.com/original-status';
  private baseUrl = 'https://4ooriklr9f.execute-api.us-east-1.amazonaws.com';

  constructor(
    private http: HttpClient,
    private imageService: ImageService
  ) {}

  isOriginal(optionSubtitle: string | null | undefined): boolean {
    if (!optionSubtitle) return false;
    return optionSubtitle.endsWith("ORIGINAL");
    }

  getMergedOriginals(): Observable<Image[]> {
    const getStatusUrl = `${this.baseUrl}/original-status`;

    return this.imageService.getImages().pipe(
      switchMap(images =>
        this.http.get<OriginalStatus[]>(getStatusUrl).pipe(
          map(statusList => {
            // Merge logic
            const merged = images.map(img => {
              if (!img.options || img.options.length === 0) return img;
              const option = img.options[0]; // Originals always have 1 option
              // TS now knows statusList elements have id and sold
              const match = statusList.find(s => s.id === option.subtitle);
              if (match) {
                option.sold = match.sold; // Inject DB value
              }
            return img;
            });
//           console.log("MERGED ORIGINALS DATA:", merged);
            return merged;
          })
        )
      )
    );
  }

  //JUST WROTE THIS AFTER WRITING CONDITIONAL CHECK INSIDE PAYMENT COMPONENT, MAY OR MAY NOT WORK
  updateOriginalStatus(id: string, sold: boolean): Observable<any> {
    const updateStatusUrl = `${this.baseUrl}/update-status`;
    const body = { id, sold };
//     console.log("updateOriginalStatus HIT with: " + "{" + id + ", " + sold + "}");
//     console.log("updateOriginalStatus url = " + url);
    return this.http.post(updateStatusUrl, body);
    }

}
