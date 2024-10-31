// import { Injectable } from '@angular/core';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AddressAutocompleteService {
//
//   private autocompleteService!: google.maps.places.AutocompleteService;
//
//   constructor() {
//     // Ensure that the Google Maps Places library is loaded
//     if (typeof google !== 'undefined' && google.maps && google.maps.places) {
//       this.autocompleteService = new google.maps.places.AutocompleteService();
//     } else {
//       console.error('Google Maps JavaScript API library not loaded.');
//     }
//   }
//
//   getPlacePredictions(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
//     return new Promise((resolve, reject) => {
//       if (!this.autocompleteService) {
//         reject('Autocomplete service not initialized');
//         return;
//       }
//
//       this.autocompleteService.getPlacePredictions({ input }, (predictions, status) => {
//         if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
//           resolve(predictions);
//         } else {
//           reject(`Autocomplete error: ${status}`);
//         }
//       });
//     });
//   }
// }
//
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressAutocompleteService {
  private scriptLoadedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public scriptLoaded$: Observable<boolean> = this.scriptLoadedSubject.asObservable();
  private autocompleteService!: google.maps.places.AutocompleteService;

  constructor() {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      this.initializeAutocompleteService();
    } else {
      this.loadGoogleMapsScript();
    }
  }

  private loadGoogleMapsScript(): void {
    if (!document.getElementById('google-maps-script')) {
      // Create the script element for Google Maps API
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC2M6pU6cZVbtrrnb2t3KmtwdvZ4Q6cbiU&libraries=places`;
      script.async = true;
      script.defer = true;

      // Set up the onload handler
      script.onload = () => {
        this.initializeAutocompleteService();
        this.scriptLoadedSubject.next(true); // Notify subscribers that the script has been loaded
      };

      // Append the script to the document body
      document.body.appendChild(script);
    } else {
      // If the script is already present in the DOM, wait for it to finish loading
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        // Script is already loaded, initialize the service
        this.initializeAutocompleteService();
        this.scriptLoadedSubject.next(true);
      } else {
        // Add an event listener to the existing script in case it is still loading
        const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement;
        existingScript.onload = () => {
          this.initializeAutocompleteService();
          this.scriptLoadedSubject.next(true);
        };
      }
    }
  }


  private initializeAutocompleteService(): void {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    } else {
      console.error('Google Maps JavaScript API library not loaded.');
    }
  }

  getPlacePredictions(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        reject('Autocomplete service not initialized');
        return;
      }

      this.autocompleteService.getPlacePredictions({ input }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          reject(`Autocomplete error: ${status}`);
        }
      });
    });
  }
}
