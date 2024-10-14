import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})

export class DetailsComponent {
  imageId!: string;
  imageUrl!: string;

  // Mapping imageIds to image file paths
  imageMap: { [key: string]: string } = {
    redfish: 'assets/images/redfish-1.jpg',
    trout: 'assets/images/trout-1.jpg',
    flounder: 'assets/images/flounder-1.jpg'
  };

  constructor(private route: ActivatedRoute) {}
    ngOnInit(): void {
      this.route.params.subscribe((params) => {
        this.imageId = params['imageId'];
        this.imageUrl = this.imageMap[this.imageId];
            console.log('Image ID:', this.imageId); // Check the value of imageId
            console.log('Image URL:', this.imageUrl); // Check the value of imageUrl

     });
  }
}
