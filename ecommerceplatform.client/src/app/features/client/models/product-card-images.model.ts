import { IProductImage } from '../../admin/interfaces/product-image.interface';

export interface IProductCardImages {
  mainImageUrl: string;
  hoverImageUrl: string | null;
  hasHoverImage: boolean;
}

const DEFAULT_PRODUCT_IMAGE = '/assets/images/seed/tech-1.jpg';

export function resolveProductCardImages(
  images: IProductImage[] | undefined,
  fallbackMainImageUrl?: string | null
): IProductCardImages {
  const activeImages = getActiveImages(images);
  let mainImageUrl = fallbackMainImageUrl?.trim() ?? '';

  if (!mainImageUrl && activeImages.length > 0) {
    const mainImage = activeImages.find((image) => image.isMain) ?? activeImages[0];
    mainImageUrl = mainImage.imageUrl;
  }

  if (!mainImageUrl) {
    mainImageUrl = DEFAULT_PRODUCT_IMAGE;
  }

  const hoverImageUrl = resolveHoverImageUrl(activeImages, mainImageUrl);

  return {
    mainImageUrl,
    hoverImageUrl,
    hasHoverImage: hoverImageUrl != null && hoverImageUrl.length > 0,
  };
}

function resolveHoverImageUrl(
  activeImages: IProductImage[],
  mainImageUrl: string
): string | null {
  if (activeImages.length < 2) {
    return null;
  }

  const normalizedMainUrl = mainImageUrl.trim();

  for (const image of activeImages) {
    const imageUrl = image.imageUrl?.trim() ?? '';
    if (imageUrl && imageUrl !== normalizedMainUrl) {
      return imageUrl;
    }
  }

  const fallbackUrl = activeImages[1].imageUrl?.trim() ?? '';
  return fallbackUrl || null;
}

function getActiveImages(images: IProductImage[] | undefined): IProductImage[] {
  if (!images) {
    return [];
  }

  const activeImages: IProductImage[] = [];

  for (const image of images) {
    if (!image.isDeleted && image.imageUrl?.trim()) {
      activeImages.push(image);
    }
  }

  return activeImages;
}
