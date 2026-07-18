import { SafeResourceUrl } from '@angular/platform-browser';

export interface IBackgroundVideoSection {
  id: number;
  videoUrl: string;
  isActive: boolean;
}

export interface IBackgroundVideoPreview {
  videoUrl: string;
  isYoutubeVideo: boolean;
  videoThumbnailUrl: string;
  safeVideoEmbedUrl?: SafeResourceUrl;
}
