import { ISectionProducts } from '../../admin/interfaces/section-products.interface';

export interface IHomeProductCard {
  id: number;
  name: string;
  mainImageUrl: string;
  hoverImageUrl: string | null;
  hasHoverImage: boolean;
  displayPrice: number;
  hasDiscount: boolean;
  originalPrice: number;
  discountPercent: number;
  outOfStock: boolean;
  product: ISectionProducts;
}

export interface IHomeProductsSection {
  id: number;
  title: string;
  badgeText: string;
  badgeColor: string;
  products: IHomeProductCard[];
  hasProducts: boolean;
}
