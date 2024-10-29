import { Component } from '@angular/core';
import { RouterOutlet, NavigationStart, Router } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent} from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { DetailsComponent } from './details/details.component';
import { CartComponent } from './cart/cart.component';
import { CartService } from './services/cart.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, NavbarComponent, FooterComponent, DetailsComponent, CartComponent, CommonModule],
  templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hngrff-angular-app';
  isCartVisible = false;
    constructor(private router: Router, private cartService: CartService) {

      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.cartService.closeCart();
          console.log('closecart called from navigationstart')
        }
      });
      this.cartService.cartVisible$.subscribe((visible) => {
        this.isCartVisible = visible;
      });
    }

  closeCart(): void {
    this.cartService.closeCart(); // Use the existing closeCart method from CartService
  }
}
