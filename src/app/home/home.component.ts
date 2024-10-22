// import { Component, OnInit } from '@angular/core';
// import { ImageService } from '../services/image.service';
// import { NavigationService } from '../services/navigation.service';
// import { CommonModule } from '@angular/common';
//
//
// interface ImageData {
//   id: string;
//   title: string;
//   url: string;
// }
//
// @Component({
//   selector: 'app-home',
//   standalone: true,
//   templateUrl: './home.component.html',
//   imports: [CommonModule],
//   styleUrls: ['../../less/home.less']
// })
// export class HomeComponent implements OnInit {
//   images: Image[] = [];
//
//   constructor(private imageService: ImageService,
//               private navigationService: NavigationService) {}
//
//   ngOnInit(): void {
//     this.imageService.getImages().subscribe(data => {
//       this.images = data;
//     });
//   }
//
//   goToDetails(imageId: string){
//     this.navigationService.goToDetails(imageId);
//     }
// }

import { Component, OnInit } from '@angular/core';
import { ImageService, Image } from '../services/image.service';
import { NavigationService } from '../services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [CommonModule],
  styleUrls: ['../../less/home.less']
})
export class HomeComponent implements OnInit {
  images: Image[] = [];

  constructor(
    private imageService: ImageService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.imageService.getImages().subscribe(data => {
      this.images = data;
    });
//     console.log(this.images);
  }

  goToDetails(imageId: string): void {
    this.navigationService.goToDetails(imageId);
  }
}
