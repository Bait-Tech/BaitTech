import { SafeResourceUrl } from '@angular/platform-browser';

export interface IClientHeroSlide {
  id: number;
  isMain: boolean;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  isYoutubeVideo: boolean;
  videoEmbedUrl: string;
  videoThumbnailUrl: string;
  safeVideoEmbedUrl?: SafeResourceUrl;
}
