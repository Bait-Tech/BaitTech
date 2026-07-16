import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ProductService } from '../../../admin/services/product.service';
import { SubCategoryService } from '../../../admin/services/sub-category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IFilterProducts } from '../../interfaces/filter-products.interface';
import { IClientProductCard } from '../../interfaces/client-product-card.interface';
import { IProducts } from '../../../admin/interfaces/products.interface';
import { CartService } from '../../state-services/cart.service';
import { ICartState } from '../../interfaces/cart-interface';
import { Subject, combineLatest, takeUntil } from 'rxjs';

const DEFAULT_PRODUCT_IMAGE = '/assets/images/seed/tech-1.jpg';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: false,
})
export class ProductsComponent implements OnInit, OnDestroy {
  productCards = signal<IClientProductCard[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  loading = signal(true);
  loadError = signal(false);
  subCategoryId = signal(0);
  categoryId = signal(0);
  subCategoryName = signal('');

  pageNumbers = computed(() => {
    return this.buildPageNumbers(this.totalPages());
  });

  pageTitle = computed(() => {
    const name = this.subCategoryName().trim();
    if (name) {
      return `${name} Products`;
    }

    return 'Products';
  });

  pageSubtitle = computed(() => {
    const name = this.subCategoryName().trim();
    if (name) {
      return `Browse products in ${name}`;
    }

    return 'Browse all available products';
  });

  showBackLink = computed(() => this.subCategoryId() > 0);

  showEmptyState = computed(() => {
    return !this.loading() && !this.loadError() && this.productCards().length === 0;
  });

  showPagination = computed(() => {
    return !this.loading() && !this.loadError() && this.totalPages() > 1;
  });

  isFirstPage = computed(() => this.currentPage() <= 1);

  isLastPage = computed(() => this.currentPage() >= this.totalPages());

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductService,
    private subCategoryService: SubCategoryService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params]) => {
        const id = params.get('id');
        const subCategoryId = id ? +id : 0;
        this.subCategoryId.set(subCategoryId);

        if (subCategoryId > 0) {
          this.loadSubCategoryDetails(subCategoryId);
        } else {
          this.subCategoryName.set('');
          this.categoryId.set(0);
        }

        this.applySearchFromRoute();
        this.currentPage.set(1);
        this.loadProducts();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    this.currentPage.set(1);
    this.updateSearchQuery();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadProducts();
  }

  goToProductPage(productId: number) {
    if (productId <= 0) {
      return;
    }

    this.router.navigate(['/product-details', productId]);
  }

  goBackToSubCategories() {
    const categoryId = this.categoryId();

    if (categoryId > 0) {
      this.router.navigate(['/sub-categories', categoryId]);
      return;
    }

    this.router.navigate(['/sub-categories']);
  }

  addToCart(card: IClientProductCard, event: Event) {
    event.stopPropagation();

    if (card.outOfStock) {
      return;
    }

    const cartItem: ICartState = {
      productID: card.id,
      qty: 1,
      product: card.product,
    };

    this.cartService.addToCart(cartItem);
  }

  retryLoad() {
    this.loadProducts();
  }

  private applySearchFromRoute() {
    const query = this.route.snapshot.queryParamMap.get('q');
    this.searchTerm.set(query ? query.trim() : '');
  }

  private updateSearchQuery() {
    const query = this.searchTerm().trim();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query || null },
      queryParamsHandling: 'merge',
    });
  }

  private loadSubCategoryDetails(subCategoryId: number) {
    this.subCategoryService.getById(subCategoryId).subscribe({
      next: (subCategory) => {
        this.subCategoryName.set(subCategory.englishName?.trim() ?? '');
        this.categoryId.set(subCategory.categoryID ?? 0);
      },
      error: () => {
        this.subCategoryName.set('');
        this.categoryId.set(0);
      },
    });
  }

  private loadProducts() {
    this.loading.set(true);
    this.loadError.set(false);

    const filter = this.buildFilter();

    this.productsService.filterProducts(filter).subscribe({
      next: (response) => {
        this.productCards.set(this.mapProductCards(response.items));
        this.totalPages.set(response.totalPages > 0 ? response.totalPages : 1);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.productCards.set([]);
        this.totalPages.set(1);
        this.totalCount.set(0);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private buildFilter(): IFilterProducts {
    return {
      paginationParams: {
        pageNumber: this.currentPage(),
        pageSize: PAGE_SIZE,
      },
      categoryID: 0,
      subCategoryID: this.subCategoryId() > 0 ? this.subCategoryId() : 0,
      name: this.searchTerm().trim(),
    };
  }

  private mapProductCards(products: IProducts[]): IClientProductCard[] {
    const cards: IClientProductCard[] = [];

    for (const product of products) {
      cards.push(this.mapProductCard(product));
    }

    return cards;
  }

  private mapProductCard(product: IProducts): IClientProductCard {
    const hasDiscount = this.hasValidDiscount(product.price, product.discountPrice);
    const displayPrice = hasDiscount ? product.discountPrice! : product.price;

    return {
      id: product.id ?? 0,
      name: product.name,
      mainImageUrl: this.resolveProductImage(product),
      displayPrice,
      hasDiscount,
      originalPrice: product.price,
      discountPercent: hasDiscount
        ? this.calculateDiscountPercent(product.price, product.discountPrice!)
        : 0,
      outOfStock: product.stockQuantity === 0,
      product,
    };
  }

  private hasValidDiscount(price: number, discountPrice?: number): boolean {
    return discountPrice != null && discountPrice > 0 && discountPrice < price;
  }

  private calculateDiscountPercent(price: number, discountPrice: number): number {
    return Math.round(((price - discountPrice) / price) * 100);
  }

  private resolveProductImage(product: IProducts): string {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find((image) => image.isMain && !image.isDeleted);

      if (mainImage?.imageUrl) {
        return mainImage.imageUrl;
      }

      const firstImage = product.images.find((image) => !image.isDeleted);

      if (firstImage?.imageUrl) {
        return firstImage.imageUrl;
      }
    }

    return DEFAULT_PRODUCT_IMAGE;
  }

  private buildPageNumbers(totalPages: number): number[] {
    const pages: number[] = [];

    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }

    return pages;
  }
}
