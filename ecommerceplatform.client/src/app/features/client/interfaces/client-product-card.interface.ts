import { IProducts } from '../../admin/interfaces/products.interface';

export interface IClientProductCard {
  id: number;
  name: string;
  mainImageUrl: string;
  displayPrice: number;
  hasDiscount: boolean;
  originalPrice: number;
  discountPercent: number;
  outOfStock: boolean;
  product: IProducts;
}
