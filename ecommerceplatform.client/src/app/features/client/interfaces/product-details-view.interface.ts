import { IProducts } from '../../admin/interfaces/products.interface';
import { IProductImage } from '../../admin/interfaces/product-image.interface';

export interface IProductDetailsView {
  product: IProducts;
  images: IProductImage[];
  displayPrice: number;
  hasDiscount: boolean;
  originalPrice: number;
  discountPercent: number;
  savingsAmount: number;
  outOfStock: boolean;
  stockQuantity: number;
  lowStock: boolean;
}
