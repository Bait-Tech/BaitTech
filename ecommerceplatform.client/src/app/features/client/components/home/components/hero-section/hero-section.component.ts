import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, computed, effect, input, signal } from '@angular/core';
import { Carousel } from 'bootstrap';
import { IClientHeroSlide } from '../../../../interfaces/client-hero-slide.interface';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  heroImages = input<IClientHeroSlide[]>([]);

  activeSlideIndex = signal(0);

  hasHeroImages = computed(() => this.heroImages().length > 0);
  initialActiveIndex = computed(() => this.resolveInitialActiveIndex(this.heroImages()));
  lcpSlideFlags = computed(() => this.buildLcpSlideFlags());
  private carouselElement: HTMLElement | null = null;
  private carouselInstance: Carousel | null = null;
  private onCarouselSlid = () => {
    this.updateActiveSlideIndex();
    this.syncVideoPlayback();
  };

  constructor() {
    effect(() => {
      this.heroImages();
      this.activeSlideIndex.set(this.initialActiveIndex());
      queueMicrotask(() => this.refreshCarousel());
    });
  }

  ngAfterViewInit() {
    this.refreshCarousel();
  }

  ngOnDestroy() {
    this.carouselElement?.removeEventListener('slid.bs.carousel', this.onCarouselSlid);
    this.carouselInstance?.dispose();
    this.carouselInstance = null;
  }

  private buildLcpSlideFlags(): boolean[] {
    const lcpIndex = this.initialActiveIndex();
    const flags: boolean[] = [];

    for (let index = 0; index < this.heroImages().length; index++) {
      flags.push(index === lcpIndex);
    }

    return flags;
  }

  private resolveInitialActiveIndex(images: IClientHeroSlide[]): number {
    if (images.length === 0) {
      return 0;
    }

    const mainIndex = images.findIndex((image) => image.isMain);
    return mainIndex >= 0 ? mainIndex : 0;
  }

  private refreshCarousel() {
    const element = document.getElementById('homeHeroCarousel');

    if (!element) {
      this.carouselElement?.removeEventListener('slid.bs.carousel', this.onCarouselSlid);
      this.carouselInstance?.dispose();
      this.carouselInstance = null;
      this.carouselElement = null;
      return;
    }

    if (this.carouselElement !== element) {
      this.carouselElement?.removeEventListener('slid.bs.carousel', this.onCarouselSlid);
      this.carouselElement = element;
      this.carouselElement.addEventListener('slid.bs.carousel', this.onCarouselSlid);
    }

    this.carouselInstance?.dispose();
    this.carouselInstance = new Carousel(element, { ride: false });
    this.carouselInstance.to(this.initialActiveIndex());
    this.updateActiveSlideIndex();
    this.syncVideoPlayback();
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
