import { DomSanitizer } from '@angular/platform-browser';
import { IHeroSectionImage } from '../interfaces/hero-section-image.interface';

export function isValidHeroVideoUrl(url: string): boolean {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return false;
  }

  if (extractYoutubeVideoId(trimmedUrl)) {
    return true;
  }

  try {
    new URL(trimmedUrl);
    return true;
  } catch {
    return false;
  }
}

export function resolveYoutubeThumbnailUrl(url: string): string {
  const videoId = extractYoutubeVideoId(url.trim());

  if (!videoId) {
    return '';
  }

  return buildYoutubeThumbnailUrl(videoId);
}

export function enrichHeroSlidePreview(
  slide: IHeroSectionImage,
  sanitizer: DomSanitizer
): IHeroSectionImage {
  const videoUrl = slide.videoUrl?.trim() ?? '';
  const baseSlide: IHeroSectionImage = {
    id: slide.id ?? 0,
    isMain: slide.isMain === true,
    imageUrl: slide.imageUrl?.trim() ?? '',
    videoUrl,
    linkUrl: slide.linkUrl?.trim() ?? '',
    imageFile: slide.imageFile,
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

export function enrichHeroSlidesPreview(
  slides: IHeroSectionImage[],
  sanitizer: DomSanitizer
): IHeroSectionImage[] {
  const enrichedSlides: IHeroSectionImage[] = [];

  for (const slide of slides) {
    enrichedSlides.push(enrichHeroSlidePreview(slide, sanitizer));
  }

  return enrichedSlides;
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
