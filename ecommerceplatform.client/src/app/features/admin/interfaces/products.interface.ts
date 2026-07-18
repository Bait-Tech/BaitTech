import { IProductImage } from "./product-image.interface";

export interface IProducts {
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
}