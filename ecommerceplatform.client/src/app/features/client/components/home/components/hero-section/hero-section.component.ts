import { Component, computed, input } from '@angular/core';
import { IHeroSectionImage } from '../../../../../admin/interfaces/hero-section-image.interface';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
  standalone: false,
})
export class HeroSectionComponent {
  heroImages = input<IHeroSectionImage[]>([]);

  hasHeroImages = computed(() => this.heroImages().length > 0);

  initialActiveIndex = computed(() => {
    const images = this.heroImages();

    if (images.length === 0) {
      return 0;
    }

    const mainIndex = images.findIndex((image) => image.isMain);
    return mainIndex >= 0 ? mainIndex : 0;
  });
}
