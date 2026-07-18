import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, computed, effect, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { HeroSectionService } from '../../../../services/hero-section.service';
import { IHeroSection } from '../../../../interfaces/hero-section.interface';
import { IHeroSectionImage } from '../../../../interfaces/hero-section-image.interface';
import {
  enrichHeroSlidePreview,
  enrichHeroSlidesPreview,
  isValidHeroVideoUrl,
  resolveYoutubeThumbnailUrl,
} from '../../../../utils/hero-video-preview.util';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
  standalone: false,
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  heroSectionId = signal(0);
  heroImages = signal<IHeroSectionImage[]>([]);
  displayOrder = signal(0);
  videoUrlInput = signal('');

  hasValidVideoUrlInput = computed(() => isValidHeroVideoUrl(this.videoUrlInput()));
  videoUrlPreviewThumbnail = computed(() => resolveYoutubeThumbnailUrl(this.videoUrlInput()));
  isYoutubeVideoUrlInput = computed(() => !!this.videoUrlPreviewThumbnail());

  initialActiveIndex = computed(() => this.resolveInitialActiveIndex(this.heroImages()));
  activeSlideIndex = signal(0);

  private carouselElement: HTMLElement | null = null;
  private carouselInstance: { dispose(): void; to(index: number): void } | null = null;
  private onCarouselSlid = () => {
    this.updateActiveSlideIndex();
    this.syncVideoPlayback();
  };

  constructor(
    private heroSectionService: HeroSectionService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    effect(() => {
      this.heroImages();
      this.initialActiveIndex();
      this.activeSlideIndex.set(this.initialActiveIndex());
      queueMicrotask(() => this.refreshCarousel());
    });
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.carouselElement = document.getElementById('heroPreviewCarousel');
    this.carouselElement?.addEventListener('slid.bs.carousel', this.onCarouselSlid);
    this.refreshCarousel();
  }

  ngOnDestroy() {
    this.carouselElement?.removeEventListener('slid.bs.carousel', this.onCarouselSlid);
    this.carouselInstance?.dispose();
    this.carouselInstance = null;
  }

  loadData() {
    this.heroSectionService.getHeroSection().subscribe({
      next: (data) => this.applyHeroSection(data),
      error: (error) => this.showError(this.resolveErrorDetail(error, 'Failed to load hero section')),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.addHeroImage(reader.result as string, file);
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  onImageChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const images = this.heroImages();
    const imageItem = images[index];

    if (!imageItem || !input.files || !input.files.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.updateHeroImage(index, reader.result as string, file);
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  onVideoUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.videoUrlInput.set(target.value);
  }

  onVideoUrlChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    const images = [...this.heroImages()];
    const imageItem = images[index];

    if (!imageItem) {
      return;
    }

    images[index] = enrichHeroSlidePreview(
      {
        ...imageItem,
        videoUrl: target.value.trim(),
      },
      this.sanitizer
    );
    this.heroImages.set(images);
  }

  addVideoSlide() {
    const videoUrl = this.videoUrlInput().trim();

    if (!isValidHeroVideoUrl(videoUrl)) {
      this.showWarning('Enter a valid video URL');
      return;
    }

    const images = [...this.heroImages()];
    images.push(
      enrichHeroSlidePreview(
        {
          id: 0,
          isMain: images.length === 0,
          linkUrl: '',
          imageUrl: '',
          videoUrl,
        },
        this.sanitizer
      )
    );
    this.heroImages.set(images);
    this.videoUrlInput.set('');
  }

  setMainImage(index: number): void {
    const images = this.heroImages().map((image, i) => ({
      ...image,
      isMain: i === index,
    }));
    this.heroImages.set(images);
  }

  removeImage(index: number): void {
    const images = [...this.heroImages()];
    const wasMain = images[index].isMain;
    images.splice(index, 1);

    if (wasMain && images.length > 0) {
      images[0] = { ...images[0], isMain: true };
    }

    this.heroImages.set(images);
  }

  validateForSave(): string {
    return this.validateSlides();
  }

  saveChanges$(): Observable<void> {
    const payload = this.buildPayload();

    if (payload.id) {
      return this.heroSectionService.updateHeroSection(payload).pipe(
        map(() => undefined)
      );
    }

    return this.heroSectionService.insertHeroSection(payload).pipe(
      map(() => undefined)
    );
  }

  reloadData() {
    this.loadData();
  }

  showWarning(detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail,
    });
  }

  showError(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }

  resolveErrorDetail(error: HttpErrorResponse, fallback: string): string {
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

  private applyHeroSection(data: IHeroSection): void {
    this.heroSectionId.set(data.id ?? 0);
    this.displayOrder.set(data.displayOrder ?? 0);
    this.heroImages.set(this.enrichSlides(this.normalizeSlides(data.heroSectionImageDTOs ?? [])));
  }

  private normalizeSlides(slides: IHeroSectionImage[]): IHeroSectionImage[] {
    const normalized: IHeroSectionImage[] = [];

    for (const slide of slides) {
      normalized.push({
        id: slide.id ?? 0,
        isMain: slide.isMain === true,
        imageUrl: slide.imageUrl?.trim() ?? '',
        videoUrl: slide.videoUrl?.trim() ?? '',
        linkUrl: slide.linkUrl?.trim() ?? '',
      });
    }

    return normalized;
  }

  private enrichSlides(slides: IHeroSectionImage[]): IHeroSectionImage[] {
    return enrichHeroSlidesPreview(slides, this.sanitizer);
  }

  private addHeroImage(imageUrl: string, file: File): void {
    const images = [...this.heroImages()];
    images.push({
      id: 0,
      isMain: images.length === 0,
      linkUrl: '',
      imageUrl,
      videoUrl: '',
      imageFile: file,
    });
    this.heroImages.set(images);
  }

  private updateHeroImage(index: number, imageUrl: string, file: File): void {
    const images = [...this.heroImages()];
    images[index] = {
      ...images[index],
      imageUrl,
      videoUrl: '',
      imageFile: file,
    };
    this.heroImages.set(images);
  }

  private buildPayload(): IHeroSection {
    return {
      id: this.heroSectionId(),
      displayOrder: this.displayOrder(),
      heroSectionImageDTOs: this.normalizeSlides(this.heroImages()),
    };
  }

  private validateSlides(): string {
    const slides = this.heroImages();

    if (slides.length === 0) {
      return 'Add at least one hero slide before saving';
    }

    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index];
      const hasImage = !!slide.imageUrl?.trim() || !!slide.imageFile;
      const hasVideo = !!slide.videoUrl?.trim();

      if (!hasImage && !hasVideo) {
        return `Slide ${index + 1} needs an image or a video URL`;
      }

      if (hasVideo && !isValidHeroVideoUrl(slide.videoUrl.trim())) {
        return `Slide ${index + 1} has an invalid video URL`;
      }
    }

    return '';
  }

  private refreshCarousel() {
    const element = document.getElementById('heroPreviewCarousel');

    if (!element) {
      this.carouselInstance?.dispose();
      this.carouselInstance = null;
      this.carouselElement = null;
      return;
    }

    this.carouselElement = element;
    const Carousel = this.getBootstrapCarousel();

    if (!Carousel) {
      this.syncVideoPlayback();
      return;
    }

    this.carouselInstance?.dispose();
    this.carouselInstance = new Carousel(element, { ride: false });
    this.carouselInstance.to(this.initialActiveIndex());
    this.updateActiveSlideIndex();
    this.syncVideoPlayback();
  }

  private resolveInitialActiveIndex(images: IHeroSectionImage[]): number {
    if (images.length === 0) {
      return 0;
    }

    const mainIndex = images.findIndex((image) => image.isMain);
    return mainIndex >= 0 ? mainIndex : 0;
  }

  private updateActiveSlideIndex() {
    if (!this.carouselElement) {
      return;
    }

    const items = this.carouselElement.querySelectorAll('.carousel-item');

    items.forEach((item, index) => {
      if (item.classList.contains('active')) {
        this.activeSlideIndex.set(index);
      }
    });
  }

  private getBootstrapCarousel() {
    const bootstrap = (window as Window & {
      bootstrap?: {
        Carousel: new (
          element: Element,
          options?: { ride?: boolean | string }
        ) => { dispose(): void; to(index: number): void };
      };
    }).bootstrap;

    return bootstrap?.Carousel ?? null;
  }

  private syncVideoPlayback() {
    if (!this.carouselElement) {
      return;
    }

    const items = this.carouselElement.querySelectorAll('.carousel-item');

    items.forEach((item) => {
      const video = item.querySelector('video');

      if (!video) {
        return;
      }

      video.muted = true;

      if (item.classList.contains('active')) {
        video.play().catch(() => undefined);
        return;
      }

      video.pause();
    });
  }
}
