import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddressAutocompleteService {

  private autocompleteService!: google.maps.places.AutocompleteService;

  constructor() {
    // Ensure that the Google Maps Places library is loaded
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

