import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { IProducts } from '../../../../../admin/interfaces/products.interface';
import { CartService } from '../../../../state-services/cart.service';
import { ICartState } from '../../../../interfaces/cart-interface';
import {
  IHomeProductCard,
  IHomeProductsSection,
} from '../../../../interfaces/home-product-card.interface';

@Component({
  selector: 'app-products-section',
  templateUrl: './products-section.component.html',
  styleUrls: ['./products-section.component.css'],
  standalone: false,
})
export class ProductsSectionComponent {
  section = input.required<IHomeProductsSection>();

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  goToProductPage(productId: number) {
    if (productId <= 0) {
      return;
    }

    this.router.navigate(['/product-details', productId]);
  }

  addToCart(card: IHomeProductCard, event: Event) {
    event.stopPropagation();

    if (card.outOfStock) {
      return;
    }

    const cartItem: ICartState = {
      productID: card.id,
      qty: 1,
      product: card.product as IProducts,
    };

    this.cartService.addToCart(cartItem);
  }
}
