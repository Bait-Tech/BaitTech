import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../state-services/cart.service';

@Component({
  selector: 'app-cart-redirect',
  template: '',
  standalone: false,
})
export class CartRedirectComponent implements OnInit {
  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.openPanel();
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
