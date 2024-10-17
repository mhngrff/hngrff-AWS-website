import { Component, Renderer2, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, NavigationEnd, Router, NavigationStart } from '@angular/router'
import { Subscription } from 'rxjs';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
              private renderer: Renderer2,
              private el: ElementRef,
              private navigationService: NavigationService
              ) {}

  ngOnInit(): void {}

  goToDetails(imageId: string){
    console.log('home.component.ts - HIT goToDetails()', imageId);
    this.navigationService.goToDetails(imageId);

  }

}
