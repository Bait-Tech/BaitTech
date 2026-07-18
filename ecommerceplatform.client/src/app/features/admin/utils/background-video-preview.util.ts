import { DomSanitizer } from '@angular/platform-browser';
import { IBackgroundVideoPreview } from '../interfaces/background-video-section.interface';

export function enrichBackgroundVideoPreview(
  videoUrl: string,
  sanitizer: DomSanitizer
): IBackgroundVideoPreview {
  const trimmedUrl = videoUrl.trim();
  const basePreview: IBackgroundVideoPreview = {
    videoUrl: trimmedUrl,
    isYoutubeVideo: false,
    videoThumbnailUrl: '',
    safeVideoEmbedUrl: undefined,
  };

  if (!trimmedUrl) {
    return basePreview;
  }

  const youtubeVideoId = extractYoutubeVideoId(trimmedUrl);

  if (!youtubeVideoId) {
    return basePreview;
  }

  const videoEmbedUrl = buildYoutubeEmbedUrl(youtubeVideoId);

  return {
    videoUrl: trimmedUrl,
    isYoutubeVideo: true,
    videoThumbnailUrl: buildYoutubeThumbnailUrl(youtubeVideoId),
    safeVideoEmbedUrl: sanitizer.bypassSecurityTrustResourceUrl(videoEmbedUrl),
  };
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
    enablejsapi: '1',
  });

  const origin = resolveEmbedOrigin();

  if (origin) {
    params.set('origin', origin);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function resolveEmbedOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.origin;
}

function buildYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
