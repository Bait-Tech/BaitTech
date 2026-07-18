import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../admin/services/product.service';
import { MessageService } from 'primeng/api';
import { CartService } from '../../state-services/cart.service';
import { ICartState } from '../../interfaces/cart-interface';
import { IProductDetailsView } from '../../interfaces/product-details-view.interface';
import { IProducts } from '../../../admin/interfaces/products.interface';
import { IProductImage } from '../../../admin/interfaces/product-image.interface';
import {
  isProductLowStock,
  isProductOutOfStock,
  tracksProductStock,
} from '../../../../shared/utils/product-stock.util';
import { Subject, takeUntil } from 'rxjs';

const DEFAULT_PRODUCT_IMAGE = '/assets/images/seed/tech-1.jpg';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  standalone: false,
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  productView = signal<IProductDetailsView | null>(null);
  loading = signal(true);
  loadError = signal(false);
  quantity = signal(1);
  selectedImageIndex = signal(0);
  imageZoomVisible = signal(false);

  mainImageUrl = computed(() => {
    const view = this.productView();
    if (!view || view.images.length === 0) {
      return DEFAULT_PRODUCT_IMAGE;
    }

    const index = this.selectedImageIndex();
    const image = view.images[index];
    return image?.imageUrl || DEFAULT_PRODUCT_IMAGE;
  });

  canDecrement = computed(() => {
    const view = this.productView();
    return !!view && !view.outOfStock && this.quantity() > 1;
  });

  canIncrement = computed(() => {
    const view = this.productView();
    if (!view || view.outOfStock) {
      return false;
    }

    if (!view.tracksStock) {
      return true;
    }

    return this.quantity() < view.stockQuantity!;
  });

  quantityMax = computed(() => {
    const view = this.productView();
    if (!view?.tracksStock) {
      return null;
    }

    return view.stockQuantity ?? 1;
  });

  lineTotal = computed(() => {
    const view = this.productView();
    if (!view) {
      return 0;
    }

    return view.displayPrice * this.quantity();
  });

  private productId = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private messageService: MessageService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.loadError.set(true);
        this.loading.set(false);
        return;
      }

      this.productId = +id;
      this.quantity.set(1);
      this.selectedImageIndex.set(0);
      this.loadProduct();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  openImageZoom() {
    this.imageZoomVisible.set(true);
  }

  closeImageZoom() {
    this.imageZoomVisible.set(false);
  }

  decrementQuantity() {
    if (!this.canDecrement()) {
      return;
    }

    this.quantity.set(this.quantity() - 1);
  }

  incrementQuantity() {
    const view = this.productView();

    if (!view || view.outOfStock) {
      return;
    }

    if (view.tracksStock && this.quantity() >= view.stockQuantity!) {
      this.showMaxQuantityMessage(view.stockQuantity!);
      return;
    }

    this.quantity.set(this.quantity() + 1);
  }

  onQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    const view = this.productView();

    if (!view) {
      return;
    }

    if (isNaN(value) || value < 1) {
      this.quantity.set(1);
      input.value = '1';
      return;
    }

    if (value > view.stockQuantity! && view.tracksStock) {
      this.quantity.set(view.stockQuantity!);
      input.value = view.stockQuantity!.toString();
      this.showMaxQuantityMessage(view.stockQuantity!);
      return;
    }

    this.quantity.set(value);
  }

  addToCart() {
    const view = this.productView();

    if (!view || view.outOfStock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'This product is out of stock',
        life: 3000,
      });
      return;
    }

    const cartItem: ICartState = {
      productID: view.product.id,
      qty: this.quantity(),
      product: view.product,
    };

    this.cartService.addToCart(cartItem);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${this.quantity()} x ${view.product.name} added to cart`,
      life: 3000,
    });
  }

  goBack() {
    const view = this.productView();
    const subCategoryId = view?.product.subCategoryID;

    if (subCategoryId && subCategoryId > 0) {
      this.router.navigate(['/products', subCategoryId]);
      return;
    }

    this.router.navigate(['/products']);
  }

  goToCart() {
    this.cartService.openPanel();
  }

  retryLoad() {
    this.loadProduct();
  }

  private loadProduct() {
    this.loading.set(true);
    this.loadError.set(false);

    this.productService.getProductByID(this.productId).subscribe({
      next: (product) => {
        this.productView.set(this.buildProductView(product));
        this.selectedImageIndex.set(this.resolveMainImageIndex(product));
        this.loading.set(false);
      },
      error: () => {
        this.productView.set(null);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private buildProductView(product: IProducts): IProductDetailsView {
    const images = this.filterImages(product.images);
    const hasDiscount = this.hasValidDiscount(product.price, product.discountPrice);
    const displayPrice = hasDiscount ? product.discountPrice! : product.price;
    const savingsAmount = hasDiscount ? product.price - product.discountPrice! : 0;
    const stockQuantity = product.stockQuantity;
    const tracksStock = tracksProductStock(stockQuantity);

    return {
      product,
      images,
      displayPrice,
      hasDiscount,
      originalPrice: product.price,
      discountPercent: hasDiscount
        ? this.calculateDiscountPercent(product.price, product.discountPrice!)
        : 0,
      savingsAmount,
      outOfStock: isProductOutOfStock(stockQuantity),
      tracksStock,
      stockQuantity,
      lowStock: isProductLowStock(stockQuantity),
    };
  }

  private filterImages(images: IProductImage[]): IProductImage[] {
    const filtered: IProductImage[] = [];

    for (const image of images) {
      if (!image.isDeleted && image.imageUrl) {
        filtered.push(image);
      }
    }

    return filtered;
  }

  private resolveMainImageIndex(product: IProducts): number {
    const images = this.filterImages(product.images);

    if (images.length === 0) {
      return 0;
    }

    const mainIndex = images.findIndex((image) => image.isMain);
    return mainIndex >= 0 ? mainIndex : 0;
  }

  private hasValidDiscount(price: number, discountPrice?: number): boolean {
    return discountPrice != null && discountPrice > 0 && discountPrice < price;
  }

  private calculateDiscountPercent(price: number, discountPrice: number): number {
    return Math.round(((price - discountPrice) / price) * 100);
  }

  private showMaxQuantityMessage(stockQuantity: number) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Maximum Quantity',
      detail: `Only ${stockQuantity} items available in stock`,
      life: 3000,
    });
  }
}
