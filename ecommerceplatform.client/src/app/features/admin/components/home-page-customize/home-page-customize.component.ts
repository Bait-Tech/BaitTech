import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { BackgroundVideoSectionService } from '../../services/background-video-section.service';
import { IBackgroundVideoSection } from '../../interfaces/background-video-section.interface';
import {
  isValidHeroVideoUrl,
  resolveYoutubeThumbnailUrl,
} from '../../utils/hero-video-preview.util';
import { enrichBackgroundVideoPreview } from '../../utils/background-video-preview.util';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';

@Component({
  selector: 'app-home-page-customize',
  templateUrl: './home-page-customize.component.html',
  styleUrls: ['./home-page-customize.component.css'],
  standalone: false,
})
export class HomePageCustomizeComponent implements OnInit {
  @ViewChild(HeroSectionComponent) heroSection?: HeroSectionComponent;

  backgroundVideoSectionId = signal(0);
  backgroundVideoUrl = signal('');
  backgroundVideoActive = signal(true);
  pageSaving = signal(false);

  hasValidBackgroundVideoUrl = computed(() => isValidHeroVideoUrl(this.backgroundVideoUrl()));
  backgroundVideoPreviewThumbnail = computed(() => resolveYoutubeThumbnailUrl(this.backgroundVideoUrl()));
  isYoutubeBackgroundVideoUrl = computed(() => !!this.backgroundVideoPreviewThumbnail());
  hasBackgroundVideoPreview = computed(
    () => this.hasValidBackgroundVideoUrl() && this.backgroundVideoUrl().trim().length > 0
  );
  backgroundVideoPreview = computed(() =>
    enrichBackgroundVideoPreview(this.backgroundVideoUrl(), this.sanitizer)
  );

  constructor(
    private backgroundVideoSectionService: BackgroundVideoSectionService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadBackgroundVideo();
  }

  onBackgroundVideoUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.backgroundVideoUrl.set(target.value);
  }

  onBackgroundVideoActiveChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.backgroundVideoActive.set(target.checked);
  }

  clearBackgroundVideoUrl() {
    this.backgroundVideoUrl.set('');
  }

  savePage() {
    const heroSection = this.heroSection;

    if (!heroSection) {
      this.showPageError('Hero section is not ready yet');
      return;
    }

    const heroValidationMessage = heroSection.validateForSave();

    if (heroValidationMessage) {
      heroSection.showWarning(heroValidationMessage);
      return;
    }

    const trimmedUrl = this.backgroundVideoUrl().trim();

    if (trimmedUrl && !isValidHeroVideoUrl(trimmedUrl)) {
      this.showPageWarning('Enter a valid background video URL');
      return;
    }

    const backgroundVideoPayload = this.buildBackgroundVideoPayload(trimmedUrl);

    this.pageSaving.set(true);
    forkJoin([
      heroSection.saveChanges$(),
      this.backgroundVideoSectionService.saveBackgroundVideoSection(backgroundVideoPayload),
    ]).subscribe({
      next: () => {
        this.pageSaving.set(false);
        heroSection.reloadData();
        this.loadBackgroundVideo();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Homepage saved successfully',
        });
      },
      error: (error) => {
        this.pageSaving.set(false);
        const detail = heroSection.resolveErrorDetail(
          error,
          this.resolveBackgroundVideoErrorDetail(error, 'Failed to save homepage')
        );
        this.showPageError(detail);
      },
    });
  }

  private buildBackgroundVideoPayload(trimmedUrl: string): IBackgroundVideoSection {
    return {
      id: this.backgroundVideoSectionId(),
      videoUrl: trimmedUrl,
      isActive: trimmedUrl.length > 0 ? this.backgroundVideoActive() : false,
    };
  }

  private loadBackgroundVideo() {
    this.backgroundVideoSectionService.getBackgroundVideoSection().subscribe({
      next: (data) => this.applyBackgroundVideoSection(data),
      error: (error) =>
        this.showPageError(
          this.resolveBackgroundVideoErrorDetail(error, 'Failed to load background video')
        ),
    });
  }

  private applyBackgroundVideoSection(data: IBackgroundVideoSection) {
    this.backgroundVideoSectionId.set(data.id ?? 0);
    this.backgroundVideoUrl.set(data.videoUrl?.trim() ?? '');
    this.backgroundVideoActive.set(data.isActive !== false);
  }

  private resolveBackgroundVideoErrorDetail(error: HttpErrorResponse, fallback: string): string {
    const body = error.error;

    if (!body || typeof body !== 'object') {
      return fallback;
    }

    const validationErrors = body.errors;

    if (!validationErrors || typeof validationErrors !== 'object') {
      return typeof body.title === 'string' ? body.title : fallback;
    }

    const messages: string[] = [];

    for (const key of Object.keys(validationErrors)) {
      const fieldErrors = validationErrors[key];

      if (Array.isArray(fieldErrors)) {
        for (const message of fieldErrors) {
          if (typeof message === 'string') {
            messages.push(message);
          }
        }
      }
    }

    if (messages.length > 0) {
      return messages.join(' ');
    }

    return fallback;
  }

  private showPageWarning(detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail,
    });
  }

  private showPageError(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }
}
