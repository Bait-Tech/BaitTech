import { SafeResourceUrl } from '@angular/platform-browser';

export interface IHeroSectionImage {
  id: number;
  isMain: boolean;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  imageFile?: File;
  isYoutubeVideo?: boolean;
  videoEmbedUrl?: string;
  videoThumbnailUrl?: string;
  safeVideoEmbedUrl?: SafeResourceUrl;
}
