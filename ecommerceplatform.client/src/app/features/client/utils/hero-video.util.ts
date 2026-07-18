import { DomSanitizer } from '@angular/platform-browser';
import { IHeroSectionImage } from '../../admin/interfaces/hero-section-image.interface';
import { IClientHeroSlide } from '../interfaces/client-hero-slide.interface';

export function enrichClientHeroSlide(
  slide: IHeroSectionImage,
  sanitizer: DomSanitizer
): IClientHeroSlide {
  const videoUrl = slide.videoUrl?.trim() ?? '';
  const baseSlide: IClientHeroSlide = {
    id: slide.id ?? 0,
    isMain: slide.isMain === true,
    imageUrl: slide.imageUrl?.trim() ?? '',
    videoUrl,
    linkUrl: slide.linkUrl?.trim() ?? '',
    isYoutubeVideo: false,
    videoEmbedUrl: '',
    videoThumbnailUrl: '',
    safeVideoEmbedUrl: undefined,
  };

  if (!videoUrl) {
    return baseSlide;
  }

  const youtubeVideoId = extractYoutubeVideoId(videoUrl);

  if (!youtubeVideoId) {
    return baseSlide;
  }

  const videoEmbedUrl = buildYoutubeEmbedUrl(youtubeVideoId);

  return {
    ...baseSlide,
    isYoutubeVideo: true,
    videoEmbedUrl,
    videoThumbnailUrl: buildYoutubeThumbnailUrl(youtubeVideoId),
    safeVideoEmbedUrl: sanitizer.bypassSecurityTrustResourceUrl(videoEmbedUrl),
  };
}

export function enrichClientHeroSlides(
  slides: IHeroSectionImage[],
  sanitizer: DomSanitizer
): IClientHeroSlide[] {
  const enrichedSlides: IClientHeroSlide[] = [];

  for (const slide of slides) {
    enrichedSlides.push(enrichClientHeroSlide(slide, sanitizer));
  }

  return enrichedSlides;
}

export function resolveMainHeroLcpUrl(slides: IClientHeroSlide[]): string {
  if (slides.length === 0) {
    return '';
  }

  const mainIndex = slides.findIndex((slide) => slide.isMain);
  const slide = slides[mainIndex >= 0 ? mainIndex : 0];

  if (!slide) {
    return '';
  }

  if (slide.isYoutubeVideo && slide.videoThumbnailUrl) {
    return slide.videoThumbnailUrl;
  }

  if (slide.videoUrl) {
    return '';
  }

  return slide.imageUrl;
}

export function hasYoutubeHeroSlide(slides: IClientHeroSlide[]): boolean {
  for (const slide of slides) {
    if (slide.isYoutubeVideo) {
      return true;
    }
  }

  return false;
}

function extractYoutubeVideoId(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      return readPathSegment(parsedUrl.pathname, 0);
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v')?.trim() ?? '';
      }

      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      const section = pathParts[0]?.toLowerCase() ?? '';

      if (section === 'embed' || section === 'shorts' || section === 'live') {
        return pathParts[1]?.trim() ?? '';
      }
    }
  } catch {
    return '';
  }

  return '';
}

function readPathSegment(pathname: string, index: number): string {
  const segments = pathname.split('/').filter(Boolean);
  return segments[index]?.trim() ?? '';
}

function buildYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    rel: '0',
    playsinline: '1',
    loop: '1',
    playlist: videoId,
    modestbranding: '1',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function buildYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
