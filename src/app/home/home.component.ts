import { Component, OnInit } from '@angular/core';
// import { ImageService, Image } from '../services/image.service';
import { ImageService } from '../services/image.service';
import { Image } from '../models/image.interface';
import { Option } from '../models/option.interface';
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
