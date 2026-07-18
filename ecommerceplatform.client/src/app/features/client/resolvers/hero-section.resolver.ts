import { inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { HeroSectionService } from '../../admin/services/hero-section.service';
import { preloadLcpImage, preconnectOrigin } from '../../../shared/utils/lcp-preload.util';
import { IClientHeroSlide } from '../interfaces/client-hero-slide.interface';
import {
  enrichClientHeroSlides,
  hasYoutubeHeroSlide,
  resolveMainHeroLcpUrl,
} from '../utils/hero-video.util';

export const heroSectionResolver: ResolveFn<IClientHeroSlide[]> = () => {
  const heroSectionService = inject(HeroSectionService);
  const sanitizer = inject(DomSanitizer);

  return heroSectionService.getHeroSection().pipe(
    map((section) => {
      const slides = enrichClientHeroSlides(section.heroSectionImageDTOs ?? [], sanitizer);
      const lcpUrl = resolveMainHeroLcpUrl(slides);

      if (lcpUrl) {
        preloadLcpImage(lcpUrl);
      }

      if (hasYoutubeHeroSlide(slides)) {
        preconnectOrigin('https://www.youtube.com');
        preconnectOrigin('https://i.ytimg.com');
      }

      return slides;
    })
  );
};
