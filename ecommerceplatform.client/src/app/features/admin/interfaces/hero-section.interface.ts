import { IHeroSectionImage } from "./hero-section-image.interface";

export interface IHeroSection {
  id: number;
  displayOrder?: number;
  heroSectionImageDTOs: IHeroSectionImage[];
}
