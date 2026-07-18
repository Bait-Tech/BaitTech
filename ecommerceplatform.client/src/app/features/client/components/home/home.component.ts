import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../admin/services/category.service';
import { ProductsSectionService } from '../../../admin/services/products-section.service';
import { ICategories } from '../../../admin/interfaces/categories.interface';
import { IProductsSection } from '../../../admin/interfaces/products-section.interface';
import { ISectionProducts } from '../../../admin/interfaces/section-products.interface';
import {
  IHomeProductCard,
  IHomeProductsSection,
} from '../../interfaces/home-product-card.interface';
import { IClientHeroSlide } from '../../interfaces/client-hero-slide.interface';
import { resolveProductCardImages } from '../../models/product-card-images.model';
import { isProductOutOfStock } from '../../../../shared/utils/product-stock.util';

const DEFAULT_CATEGORY_IMAGE = '/assets/images/seed/tech-2.jpg';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  heroImages = signal<IClientHeroSlide[]>([]);
  categories = signal<ICategories[]>([]);
  productsSections = signal<IHomeProductsSection[]>([]);

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productsSectionService: ProductsSectionService
  ) {}

  ngOnInit() {
    const heroImages = this.route.snapshot.data['heroImages'] as IClientHeroSlide[] | undefined;
    this.heroImages.set(heroImages ?? []);
    this.scheduleSecondaryContentLoad();
  }

  private scheduleSecondaryContentLoad() {
    queueMicrotask(() => {
      this.loadCategories();
      this.loadProductsSections();
    });
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories.set(this.mapCategories(categories));
    });
  }

  private loadProductsSections() {
    this.productsSectionService.getAll().subscribe((sections) => {
      this.productsSections.set(this.mapProductsSections(sections));
    });
  }

  private mapCategories(categories: ICategories[]): ICategories[] {
    const mapped: ICategories[] = [];

    for (const category of categories) {
      mapped.push({
        ...category,
        imageUrl: this.resolveCategoryImage(category.imageUrl),
      });
    }

    return mapped;
  }

  private mapProductsSections(sections: IProductsSection[]): IHomeProductsSection[] {
    const mapped: IHomeProductsSection[] = [];

    for (const section of sections) {
      const products = this.mapSectionProducts(section.products);
      mapped.push({
        id: section.id,
        title: section.title,
        badgeText: section.badgeText,
        badgeColor: section.badgeColor,
        products,
        hasProducts: products.length > 0,
      });
    }

    return mapped;
  }

  private mapSectionProducts(products: ISectionProducts[]): IHomeProductCard[] {
    const mapped: IHomeProductCard[] = [];

    for (const product of products) {
      mapped.push(this.mapProductCard(product));
    }

    return mapped;
  }

  private mapProductCard(product: ISectionProducts): IHomeProductCard {
    const hasDiscount = this.hasValidDiscount(product.price, product.discountPrice);
    const displayPrice = hasDiscount ? product.discountPrice! : product.price;
    const cardImages = resolveProductCardImages(product.images, product.mainImageUrl);

    return {
      id: product.id ?? 0,
      name: product.name,
      mainImageUrl: cardImages.mainImageUrl,
      hoverImageUrl: cardImages.hoverImageUrl,
      hasHoverImage: cardImages.hasHoverImage,
      displayPrice,
      hasDiscount,
      originalPrice: product.price,
      discountPercent: hasDiscount
        ? this.calculateDiscountPercent(product.price, product.discountPrice!)
        : 0,
      outOfStock: isProductOutOfStock(product.stockQuantity),
      product,
    };
  }

  private hasValidDiscount(price: number, discountPrice?: number): boolean {
    return discountPrice != null && discountPrice > 0 && discountPrice < price;
  }

  private calculateDiscountPercent(price: number, discountPrice: number): number {
    return Math.round(((price - discountPrice) / price) * 100);
  }

  private resolveCategoryImage(imageUrl?: string): string {
    if (imageUrl && imageUrl.trim()) {
      return imageUrl.trim();
    }

    return DEFAULT_CATEGORY_IMAGE;
  }
}
