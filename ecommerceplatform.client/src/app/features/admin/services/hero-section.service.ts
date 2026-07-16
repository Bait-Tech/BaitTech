import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IHeroSection } from '../interfaces/hero-section.interface';
import { IHeroSectionImage } from '../interfaces/hero-section-image.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeroSectionService {
  private apiUrl = `${environment.apiUrl}/HeroSection`;

  constructor(private http: HttpClient) {}

  getHeroSection(): Observable<IHeroSection> {
    return this.http
      .get<unknown>(`${this.apiUrl}`)
      .pipe(map((data) => this.mapHeroSection(data)));
  }

  insertHeroSection(heroSection: IHeroSection): Observable<any> {
    const formData = this.createFormData(heroSection);
    return this.http.post(`${this.apiUrl}`, formData);
  }

  updateHeroSection(heroSection: IHeroSection): Observable<any> {
    const formData = this.createFormData(heroSection);
    return this.http.put(`${this.apiUrl}`, formData);
  }

  private mapHeroSection(data: unknown): IHeroSection {
    const source = this.asRecord(data);
    const images = this.readImages(source);

    return {
      id: this.readNumber(source, 'id', 'ID'),
      displayOrder: this.readOptionalNumber(source, 'displayOrder', 'DisplayOrder'),
      heroSectionImageDTOs: images,
    };
  }

  private readImages(source: Record<string, unknown>): IHeroSectionImage[] {
    const rawImages = source['heroSectionImageDTOs'] ?? source['HeroSectionImageDTOs'];

    if (!Array.isArray(rawImages)) {
      return [];
    }

    const images: IHeroSectionImage[] = [];

    for (const rawImage of rawImages) {
      const image = this.asRecord(rawImage);
      images.push({
        id: this.readNumber(image, 'id', 'ID'),
        isMain: this.readBoolean(image, 'isMain', 'IsMain'),
        imageUrl: this.readString(image, 'imageUrl', 'ImageUrl'),
        linkUrl: this.readString(image, 'linkUrl', 'LinkUrl'),
      });
    }

    return this.ensureMainImage(images);
  }

  private ensureMainImage(images: IHeroSectionImage[]): IHeroSectionImage[] {
    if (images.length === 0) {
      return images;
    }

    const hasMain = images.some((image) => image.isMain);

    if (hasMain) {
      return images;
    }

    const updatedImages = [...images];
    updatedImages[0] = { ...updatedImages[0], isMain: true };
    return updatedImages;
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

  private createFormData(heroSection: IHeroSection): FormData {
    const formData = new FormData();

    formData.append('ID', heroSection.id.toString());
    formData.append(
      'DisplayOrder',
      heroSection.displayOrder?.toString() || '0'
    );

    heroSection.heroSectionImageDTOs.forEach((image, index) => {
      formData.append(
        `HeroSectionImageDTOs[${index}].IsMain`,
        image.isMain.toString()
      );
      formData.append(`HeroSectionImageDTOs[${index}].LinkUrl`, image.linkUrl);
      formData.append(
        `HeroSectionImageDTOs[${index}].ImageUrl`,
        image.imageUrl
      );

      if (image.imageFile) {
        formData.append(
          `HeroSectionImageDTOs[${index}].ImageFile`,
          image.imageFile,
          image.imageFile.name
        );
      }
    });

    return formData;
  }
}
