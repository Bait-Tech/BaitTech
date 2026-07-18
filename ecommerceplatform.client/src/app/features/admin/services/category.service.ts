import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICategories } from '../interfaces/categories.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ICategories[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/All`)
      .pipe(map((data) => this.mapCategories(data)));
  }

  getCategory(id: number): Observable<ICategories> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`)
      .pipe(map((data) => this.mapCategory(data)));
  }

  createCategory(categoryData: ICategories): Observable<number> {
    const formData = this.createFormData(categoryData);
    return this.http.post<number>(`${this.apiUrl}/Category`, formData);
  }

  updateCategory(categoryData: ICategories): Observable<any> {
    const formData = this.createFormData(categoryData);
    return this.http.put(`${this.apiUrl}/Category`, formData);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteCategories(ids: number[]): Observable<any> {
    const options = {
      body: ids,
    };
    return this.http.delete(`${this.apiUrl}/List`, options);
  }

  private mapCategories(data: unknown): ICategories[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const categories: ICategories[] = [];

    for (const item of data) {
      categories.push(this.mapCategory(item));
    }

    return categories;
  }

  private mapCategory(data: unknown): ICategories {
    const source = this.asRecord(data);
    const name = this.readString(source, 'name', 'Name');
    const englishName = this.readString(source, 'englishName', 'EnglishName');

    return {
      id: this.readNumber(source, 'id', 'ID'),
      name: name || englishName,
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

  private createFormData(category: ICategories): FormData {
    const formData = new FormData();
    formData.append('name', category.name);

    if (category.id) {
      formData.append('id', category.id.toString());
    }

    if (category.imageFile) {
      formData.append('imageFile', category.imageFile);
    } else if (category.imageUrl) {
      formData.append('imageUrl', category.imageUrl);
    }

    return formData;
  }
}
