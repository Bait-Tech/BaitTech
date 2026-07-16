import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICompanySettings } from '../interfaces/company-settings.interface';

@Injectable({
  providedIn: 'root',
})
export class CompanySettingsService {
  private apiUrl = `${environment.apiUrl}/CompanySettings`;

  constructor(private http: HttpClient) {}

  getCompanySettings(): Observable<ICompanySettings> {
    return this.http.get<ICompanySettings>(`${this.apiUrl}`);
  }

  saveCompanySettings(settings: ICompanySettings): Observable<number> {
    const formData = this.buildFormData(settings);
    return this.http.put<number>(`${this.apiUrl}`, formData);
  }

  private buildFormData(settings: ICompanySettings): FormData {
    const formData = new FormData();

    formData.append('ID', settings.id.toString());
    formData.append('CompanyName', settings.companyName);
    formData.append('FacebookUrl', settings.facebookUrl ?? '');
    formData.append('InstagramUrl', settings.instagramUrl ?? '');
    formData.append('SnapchatUrl', settings.snapchatUrl ?? '');
    formData.append('PhoneNumber', settings.phoneNumber ?? '');

    if (settings.logoUrl) {
      formData.append('LogoUrl', settings.logoUrl);
    }

    if (settings.logoFile) {
      formData.append('LogoFile', settings.logoFile, settings.logoFile.name);
    }

    return formData;
  }
}
