import { Component, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CompanySettingsService } from '../../services/company-settings.service';
import { CompanyService } from '../../../../shared/services/company.service';
import { ICompanySettings } from '../../interfaces/company-settings.interface';

@Component({
    selector: 'app-company-settings',
    templateUrl: './company-settings.component.html',
    styleUrls: ['./company-settings.component.css'],
    standalone: false
})
export class CompanySettingsComponent implements OnInit {
  companyName = signal('');
  logoPreview = signal('');
  facebookUrl = signal('');
  instagramUrl = signal('');
  snapchatUrl = signal('');
  phoneNumber = signal('');
  loading = signal(true);
  saving = signal(false);
  panelVisible = signal(false);
  editCompanyName = signal('');
  editLogoPreview = signal('');
  editFacebookUrl = signal('');
  editInstagramUrl = signal('');
  editSnapchatUrl = signal('');
  editPhoneNumber = signal('');
  logoStatusLabel = signal('Not uploaded');
  facebookStatusLabel = signal('Not set');
  instagramStatusLabel = signal('Not set');
  snapchatStatusLabel = signal('Not set');
  phoneStatusLabel = signal('Not set');
  configuredSocialCount = signal(0);

  private settingsId = 0;
  private currentLogoUrl = '';
  private selectedLogo: File | null = null;

  constructor(
    private companySettingsService: CompanySettingsService,
    private companyService: CompanyService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.companySettingsService.getCompanySettings().subscribe({
      next: (data) => {
        this.applySettings(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load company settings',
        });
      },
    });
  }

  openEditPanel(): void {
    this.editCompanyName.set(this.companyName());
    this.editLogoPreview.set(this.logoPreview());
    this.editFacebookUrl.set(this.facebookUrl());
    this.editInstagramUrl.set(this.instagramUrl());
    this.editSnapchatUrl.set(this.snapchatUrl());
    this.editPhoneNumber.set(this.phoneNumber());
    this.selectedLogo = null;
    this.panelVisible.set(true);
  }

  hidePanel(): void {
    this.panelVisible.set(false);
  }

  onPanelVisibleChange(visible: boolean): void {
    this.panelVisible.set(visible);
  }

  onEditCompanyNameChange(value: string): void {
    this.editCompanyName.set(value);
  }

  onEditFacebookUrlChange(value: string): void {
    this.editFacebookUrl.set(value);
  }

  onEditInstagramUrlChange(value: string): void {
    this.editInstagramUrl.set(value);
  }

  onEditSnapchatUrlChange(value: string): void {
    this.editSnapchatUrl.set(value);
  }

  onEditPhoneNumberChange(value: string): void {
    this.editPhoneNumber.set(value);
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) {
      return;
    }

    this.selectedLogo = input.files[0];
    this.readLogoPreview(this.selectedLogo, (preview) => this.editLogoPreview.set(preview));
  }

  saveChanges(): void {
    if (!this.editCompanyName().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Company name is required',
      });
      return;
    }

    this.saving.set(true);
    this.companySettingsService
      .saveCompanySettings(this.buildPayload())
      .subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
  }

  private applySettings(data: ICompanySettings): void {
    this.settingsId = data.id ?? 0;
    this.currentLogoUrl = data.logoUrl ?? '';
    this.companyName.set(data.companyName ?? '');
    this.logoPreview.set(this.currentLogoUrl);
    this.facebookUrl.set(this.resolveOptionalText(data.facebookUrl));
    this.instagramUrl.set(this.resolveOptionalText(data.instagramUrl));
    this.snapchatUrl.set(this.resolveOptionalText(data.snapchatUrl));
    this.phoneNumber.set(this.resolveOptionalText(data.phoneNumber));
    this.logoStatusLabel.set(this.resolveLogoStatusLabel(this.currentLogoUrl));
    this.facebookStatusLabel.set(this.resolveLinkStatusLabel(this.facebookUrl()));
    this.instagramStatusLabel.set(this.resolveLinkStatusLabel(this.instagramUrl()));
    this.snapchatStatusLabel.set(this.resolveLinkStatusLabel(this.snapchatUrl()));
    this.phoneStatusLabel.set(this.resolveLinkStatusLabel(this.phoneNumber()));
    this.configuredSocialCount.set(this.resolveConfiguredSocialCount());
    this.selectedLogo = null;
  }

  private resolveOptionalText(value?: string): string {
    if (value && value.trim()) {
      return value.trim();
    }

    return '';
  }

  private resolveLogoStatusLabel(logoUrl: string): string {
    if (logoUrl) {
      return 'Uploaded';
    }

    return 'Not uploaded';
  }

  private resolveLinkStatusLabel(value: string): string {
    if (value) {
      return 'Configured';
    }

    return 'Not set';
  }

  private resolveConfiguredSocialCount(): number {
    let count = 0;

    if (this.facebookUrl()) {
      count += 1;
    }

    if (this.instagramUrl()) {
      count += 1;
    }

    if (this.snapchatUrl()) {
      count += 1;
    }

    if (this.phoneNumber()) {
      count += 1;
    }

    return count;
  }

  private readLogoPreview(file: File, onLoaded: (preview: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => onLoaded(reader.result as string);
    reader.readAsDataURL(file);
  }

  private buildPayload(): ICompanySettings {
    return {
      id: this.settingsId,
      companyName: this.editCompanyName().trim(),
      logoUrl: this.currentLogoUrl,
      facebookUrl: this.editFacebookUrl().trim(),
      instagramUrl: this.editInstagramUrl().trim(),
      snapchatUrl: this.editSnapchatUrl().trim(),
      phoneNumber: this.editPhoneNumber().trim(),
      logoFile: this.selectedLogo ?? undefined,
    };
  }

  private onSaveSuccess(): void {
    this.saving.set(false);
    this.panelVisible.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Company settings saved successfully',
    });
    this.loadSettings();
    this.companyService.load();
  }

  private onSaveError(): void {
    this.saving.set(false);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save company settings',
    });
  }
}
