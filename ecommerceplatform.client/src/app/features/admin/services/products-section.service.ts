import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IProductsSection } from '../interfaces/products-section.interface';
import { ISectionProducts } from '../interfaces/section-products.interface';
import { IProductImage } from '../interfaces/product-image.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsSectionService {
  private apiUrl = `${environment.apiUrl}/ProductSections`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<IProductsSection[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}`)
      .pipe(map((data) => this.mapSections(data)));
  }

  insert(section: IProductsSection): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}`, section);
  }

  update(section: IProductsSection): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}`, section);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  private mapSections(data: unknown): IProductsSection[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const sections: IProductsSection[] = [];

    for (const item of data) {
      sections.push(this.mapSection(item));
    }

    return sections;
  }

  private mapSection(data: unknown): IProductsSection {
    const source = this.asRecord(data);
    const products = this.mapSectionProducts(source['products'] ?? source['Products']);

    return {
      id: this.readNumber(source, 'id', 'ID'),
      title: this.readString(source, 'title', 'Title'),
      displayOrder: this.readNumber(source, 'displayOrder', 'DisplayOrder'),
      categoryID: this.readNumber(source, 'categoryID', 'CategoryID'),
      subCategoryID: this.readOptionalNumber(source, 'subCategoryID', 'SubCategoryID'),
      badgeText: this.readString(source, 'badgeText', 'BadgeText'),
      badgeColor: this.readString(source, 'badgeColor', 'BadgeColor'),
      products,
    };
  }

  private mapSectionProducts(data: unknown): ISectionProducts[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const products: ISectionProducts[] = [];

    for (const item of data) {
      products.push(this.mapSectionProduct(item));
    }

    return products;
  }

  private mapSectionProduct(data: unknown): ISectionProducts {
    const source = this.asRecord(data);
    const images = this.mapProductImages(source['images'] ?? source['Images']);

    return {
      id: this.readOptionalNumber(source, 'id', 'ID'),
      name: this.readString(source, 'name', 'Name'),
      description: this.readString(source, 'description', 'Description'),
      code: this.readString(source, 'code', 'Code'),
      categoryID: this.readNumber(source, 'categoryID', 'CategoryID'),
      subCategoryID: this.readOptionalNumber(source, 'subCategoryID', 'SubCategoryID'),
      price: this.readNumber(source, 'price', 'Price'),
      discountPrice: this.readOptionalNumber(source, 'discountPrice', 'DiscountPrice'),
      stockQuantity: this.readNullableNumber(source, 'stockQuantity', 'StockQuantity'),
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

  private readNullableNumber(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): number | null | undefined {
    const value = source[camelKey] ?? source[pascalKey];

    if (value === null) {
      return null;
    }

    return typeof value === 'number' ? value : undefined;
  }
}
