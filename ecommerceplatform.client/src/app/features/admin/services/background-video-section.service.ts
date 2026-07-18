import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IBackgroundVideoSection } from '../interfaces/background-video-section.interface';

@Injectable({
  providedIn: 'root',
})
export class BackgroundVideoSectionService {
  private apiUrl = `${environment.apiUrl}/BackgroundVideoSection`;

  constructor(private http: HttpClient) {}

  getBackgroundVideoSection(): Observable<IBackgroundVideoSection> {
    return this.http
      .get<unknown>(this.apiUrl)
      .pipe(map((data) => this.mapSection(data)));
  }

  saveBackgroundVideoSection(section: IBackgroundVideoSection): Observable<number> {
    return this.http.put<number>(this.apiUrl, {
      id: section.id,
      videoUrl: section.videoUrl?.trim() ?? '',
      isActive: section.isActive,
    });
  }

  private mapSection(data: unknown): IBackgroundVideoSection {
    const source = this.asRecord(data);

    return {
      id: this.readNumber(source, 'id', 'ID'),
      videoUrl: this.readString(source, 'videoUrl', 'VideoUrl'),
      isActive: this.readBoolean(source, 'isActive', 'IsActive'),
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

  private readBoolean(
    source: Record<string, unknown>,
    camelKey: string,
    pascalKey: string
  ): boolean {
    const value = source[camelKey] ?? source[pascalKey];

    if (value === false) {
      return false;
    }

    return true;
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
