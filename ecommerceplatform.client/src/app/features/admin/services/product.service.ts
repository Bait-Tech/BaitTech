import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IProducts } from '../interfaces/products.interface';
import { IProductImage } from '../interfaces/product-image.interface';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/interfaces/paginated-result.interface';
import { IFilterProducts } from '../../client/interfaces/filter-products.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProducts[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/All`)
      .pipe(map((data) => this.mapProducts(data)));
  }

  getProductByID(id: number): Observable<IProducts> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`)
      .pipe(map((data) => this.mapProduct(data)));
  }

  getPagedProducts(
    first: number,
    rows: number
  ): Observable<PaginatedResult<IProducts>> {
    const params = new HttpParams()
      .set('pageNumber', (first / rows + 1).toString())
      .set('pageSize', rows.toString());

    return this.http
      .get<unknown>(`${this.apiUrl}/Paged/Products`, { params })
      .pipe(map((data) => this.mapPaginatedProducts(data)));
  }

  getProductsByCategory(categoryID: number, subCategoryID?: number) {
    let params = new HttpParams().set('categoryID', categoryID);

    if (subCategoryID) {
      params = params.set('subCategoryID', subCategoryID.toString());
    }

    return this.http
      .get<unknown>(`${this.apiUrl}/ProductsByCategory`, { params })
      .pipe(map((data) => this.mapProducts(data)));
  }

  filterProducts(filter: IFilterProducts): Observable<PaginatedResult<IProducts>> {
    return this.http
      .post<unknown>(`${this.apiUrl}/FilterProducts`, filter)
      .pipe(map((data) => this.mapPaginatedProducts(data)));
  }

  createProduct(productData: IProducts): Observable<number> {
    const formData = this.createFormData(productData);
    return this.http.post<number>(`${this.apiUrl}/Product`, formData);
  }

  updateProduct(productData: IProducts): Observable<any> {
    const formData = this.createFormData(productData);
    return this.http.put(`${this.apiUrl}/Product`, formData);
  }

  deleteProducts(ids: number[]): Observable<any> {
    const options = {
      body: ids,
    };
    return this.http.delete(`${this.apiUrl}/List`, options);
  }

  private mapPaginatedProducts(data: unknown): PaginatedResult<IProducts> {
    const source = this.asRecord(data);
    const items = this.mapProducts(source['items'] ?? source['Items']);

    return {
      currentPage: this.readNumber(source, 'currentPage', 'CurrentPage'),
      totalPages: this.readNumber(source, 'totalPages', 'TotalPages'),
      pageSize: this.readNumber(source, 'pageSize', 'PageSize'),
      totalCount: this.readNumber(source, 'totalCount', 'TotalCount'),
      hasPrevious: this.readBoolean(source, 'hasPrevious', 'HasPrevious'),
      hasNext: this.readBoolean(source, 'hasNext', 'HasNext'),
      items,
    };
  }

  private mapProducts(data: unknown): IProducts[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const products: IProducts[] = [];

    for (const item of data) {
      products.push(this.mapProduct(item));
    }

    return products;
  }

  private mapProduct(data: unknown): IProducts {
    const source = this.asRecord(data);
    const images = this.mapProductImages(source['images'] ?? source['Images']);

    return {
      id: this.readNumber(source, 'id', 'ID'),
      name: this.readString(source, 'name', 'Name'),
      description: this.readString(source, 'description', 'Description'),
      code: this.readString(source, 'code', 'Code'),
      categoryID: this.readNumber(source, 'categoryID', 'CategoryID'),
      subCategoryID: this.readOptionalNumber(source, 'subCategoryID', 'SubCategoryID'),
      price: this.readNumber(source, 'price', 'Price'),
      discountPrice: this.readOptionalNumber(source, 'discountPrice', 'DiscountPrice'),
      stockQuantity: this.readNumber(source, 'stockQuantity', 'StockQuantity'),
      images,
    };
  }

  private mapProductImages(data: unknown): IProductImage[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const images: IProductImage[] = [];

    for (const item of data) {
      const source = this.asRecord(item);
      images.push({
        id: this.readOptionalNumber(source, 'id', 'ID'),
        imageUrl: this.readString(source, 'imageUrl', 'ImageUrl'),
        isMain: this.readBoolean(source, 'isMain', 'IsMain'),
        isDeleted: this.readBoolean(source, 'isDeleted', 'IsDeleted'),
      });
    }

    return images;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private readString(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): string {
    const value = source[camelKey] ?? source[pascalKey];
    return typeof value === 'string' ? value : '';
  }

  private readBoolean(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): boolean {
    const value = source[camelKey] ?? source[pascalKey];
    return value === true;
  }

  private readNumber(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): number {
    const value = source[camelKey] ?? source[pascalKey];
    return typeof value === 'number' ? value : 0;
  }

  private readOptionalNumber(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): number | undefined {
    const value = source[camelKey] ?? source[pascalKey];
    return typeof value === 'number' ? value : undefined;
  }

  private createFormData(product: IProducts): FormData {
    const formData = new FormData();

    if (product.id) {
      formData.append('id', product.id.toString());
    }

    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('code', product.code);
    formData.append('categoryID', product.categoryID.toString());
    formData.append('price', product.price.toString());
    formData.append('stockQuantity', product.stockQuantity.toString());

    if (product.subCategoryID) {
      formData.append('subCategoryID', product.subCategoryID.toString());
    }
    if (product.discountPrice) {
      formData.append('discountPrice', product.discountPrice.toString());
    }

    product.images.forEach((image, index) => {
      if (image.imageFile) {
        formData.append(`Images[${index}].ImageFile`, image.imageFile);
      }
      formData.append(`Images[${index}].IsMain`, image.isMain.toString());
      formData.append(`Images[${index}].IsDeleted`, image.isDeleted.toString());
      if (image.id) {
        formData.append(`Images[${index}].ID`, image.id.toString());
      }
    });

    return formData;
  }
}
