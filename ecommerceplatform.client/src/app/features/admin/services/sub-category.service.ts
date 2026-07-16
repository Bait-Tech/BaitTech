import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ISubCategories } from '../interfaces/sub-categories.interface';
import { BaseCrudService } from '../../../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root',
})
export class SubCategoryService extends BaseCrudService<ISubCategories> {
  constructor(http: HttpClient) {
    super(http, 'SubCategory');
  }

  deleteList(ids: number[]): Observable<any> {
    const options = {
      body: ids,
    };
    return this.http.delete(`${this.fullUrl}/List`, options);
  }

  getByCategoryID(categoryID: number): Observable<ISubCategories[]> {
    const params = new HttpParams().set('categoryID', categoryID.toString());

    return this.http
      .get<unknown>(`${this.fullUrl}/SubCategories`, { params })
      .pipe(map((data) => this.mapSubCategories(data)));
  }

  override getById(id: number): Observable<ISubCategories> {
    return this.http
      .get<unknown>(`${this.fullUrl}/${id}`)
      .pipe(map((data) => this.mapSubCategory(data)));
  }

  override getAll(): Observable<ISubCategories[]> {
    return this.http
      .get<unknown>(this.fullUrl)
      .pipe(map((data) => this.mapSubCategories(data)));
  }

  private mapSubCategories(data: unknown): ISubCategories[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const subCategories: ISubCategories[] = [];

    for (const item of data) {
      subCategories.push(this.mapSubCategory(item));
    }

    return subCategories;
  }

  private mapSubCategory(data: unknown): ISubCategories {
    const source = this.asRecord(data);

    return {
      id: this.readNumber(source, 'id', 'ID'),
      englishName: this.readString(source, 'englishName', 'EnglishName'),
      arabicName: this.readString(source, 'arabicName', 'ArabicName'),
      categoryID: this.readNumber(source, 'categoryID', 'CategoryID'),
      imageUrl: this.readString(source, 'imageUrl', 'ImageUrl'),
    };
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

  private readNumber(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): number {
    const value = source[camelKey] ?? source[pascalKey];
    return typeof value === 'number' ? value : 0;
  }
}
