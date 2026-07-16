import { Inject, Injectable, signal, DOCUMENT } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { ICompanySettings } from '../../features/admin/interfaces/company-settings.interface';

const DEFAULT_COMPANY_NAME = 'Bait Tech';
const DEFAULT_LOGO_URL = 'assets/logo.png';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/CompanySettings`;

  companyName = signal(DEFAULT_COMPANY_NAME);
  logoUrl = signal(DEFAULT_LOGO_URL);
  facebookUrl = signal('');
  instagramUrl = signal('');
  snapchatUrl = signal('');
  phoneNumber = signal('');
  phoneHref = signal('');
  hasSocialLinks = signal(false);

  constructor(
    private http: HttpClient,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {}

  load(): void {
    this.http.get<ICompanySettings>(this.apiUrl).subscribe((data) => {
      this.applyBrand(data);
    });
  }

  applyBrand(data: ICompanySettings): void {
    const name = this.resolveName(data.companyName);
    const logo = this.resolveLogo(data.logoUrl);
    const facebookUrl = this.resolveOptionalText(data.facebookUrl);
    const instagramUrl = this.resolveOptionalText(data.instagramUrl);
    const snapchatUrl = this.resolveOptionalText(data.snapchatUrl);
    const phoneNumber = this.resolveOptionalText(data.phoneNumber);
    const phoneHref = this.resolvePhoneHref(phoneNumber);

    this.companyName.set(name);
    this.logoUrl.set(logo);
    this.facebookUrl.set(facebookUrl);
    this.instagramUrl.set(instagramUrl);
    this.snapchatUrl.set(snapchatUrl);
    this.phoneNumber.set(phoneNumber);
    this.phoneHref.set(phoneHref);
    this.hasSocialLinks.set(this.resolveHasSocialLinks(facebookUrl, instagramUrl, snapchatUrl, phoneNumber));
    this.titleService.setTitle(name);
    this.updateFavicon(logo);
  }

  private resolveName(companyName?: string): string {
    if (companyName && companyName.trim()) {
      return companyName.trim();
    }

    return DEFAULT_COMPANY_NAME;
  }

  private resolveLogo(logoUrl?: string): string {
    if (logoUrl && logoUrl.trim()) {
      return logoUrl.trim();
    }

    return DEFAULT_LOGO_URL;
  }

  private resolveOptionalText(value?: string): string {
    if (value && value.trim()) {
      return value.trim();
    }

    return '';
  }

  private resolvePhoneHref(phoneNumber: string): string {
    if (!phoneNumber) {
      return '';
    }

    return `tel:${phoneNumber.replace(/\s+/g, '')}`;
  }

  private resolveHasSocialLinks(
    facebookUrl: string,
    instagramUrl: string,
    snapchatUrl: string,
    phoneNumber: string
  ): boolean {
    return !!(facebookUrl || instagramUrl || snapchatUrl || phoneNumber);
  }

  private updateFavicon(logoUrl: string): void {
    const link = this.resolveFaviconElement();
    link.setAttribute('href', logoUrl);
    link.removeAttribute('type');
  }

  private resolveFaviconElement(): HTMLLinkElement {
    const existing = this.document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (existing) {
      return existing;
    }

    const created = this.document.createElement('link');
    created.rel = 'icon';
    this.document.head.appendChild(created);

    return created;
  }
}
