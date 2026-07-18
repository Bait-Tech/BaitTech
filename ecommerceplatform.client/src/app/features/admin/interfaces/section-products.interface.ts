import { IProductImage } from './product-image.interface';

export interface ISectionProducts {
  id?: number;
  name: string;
  description: string;
  code: string;
  categoryID: number;
  subCategoryID?: number;
  price: number;
  discountPrice?: number;
  stockQuantity?: number | null;
  images: IProductImage[];
  isSelected?: boolean;
  mainImageUrl? : string | null;
}
