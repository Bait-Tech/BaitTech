import { Component, OnInit, signal } from '@angular/core';
import { HeroSectionService } from '../../../../services/hero-section.service';
import { IHeroSection } from '../../../../interfaces/hero-section.interface';
import { IHeroSectionImage } from '../../../../interfaces/hero-section-image.interface';

@Component({
    selector: 'app-hero-section',
    templateUrl: './hero-section.component.html',
    styleUrls: ['./hero-section.component.css'],
    standalone: false
})
export class HeroSectionComponent implements OnInit {
  heroSectionId = signal(0);
  heroImages = signal<IHeroSectionImage[]>([]);
  displayOrder = signal(0);

  constructor(private heroSectionService: HeroSectionService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.heroSectionService.getHeroSection().subscribe((data) => {
      this.applyHeroSection(data);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.addHeroImage(reader.result as string, file);
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  onImageChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const images = this.heroImages();
    const imageItem = images[index];

    if (!imageItem || !input.files || !input.files.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.updateHeroImage(index, reader.result as string, file);
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  setMainImage(index: number): void {
    const images = this.heroImages().map((image, i) => ({
      ...image,
      isMain: i === index,
    }));
    this.heroImages.set(images);
  }

  removeImage(index: number): void {
    const images = [...this.heroImages()];
    const wasMain = images[index].isMain;
    images.splice(index, 1);

    if (wasMain && images.length > 0) {
      images[0] = { ...images[0], isMain: true };
    }

    this.heroImages.set(images);
  }

  saveChanges() {
    const payload = this.buildPayload();
    payload.id ? this.updateHeroSection(payload) : this.insertHeroSection(payload);
  }

  private applyHeroSection(data: IHeroSection): void {
    this.heroSectionId.set(data.id ?? 0);
    this.displayOrder.set(data.displayOrder ?? 0);
    this.heroImages.set([...(data.heroSectionImageDTOs ?? [])]);
  }

  private addHeroImage(imageUrl: string, file: File): void {
    const images = [...this.heroImages()];
    images.push({
      id: 0,
      isMain: images.length === 0,
      linkUrl: '',
      imageUrl,
      imageFile: file,
    });
    this.heroImages.set(images);
  }

  private updateHeroImage(index: number, imageUrl: string, file: File): void {
    const images = [...this.heroImages()];
    images[index] = {
      ...images[index],
      imageUrl,
      imageFile: file,
    };
    this.heroImages.set(images);
  }

  private buildPayload(): IHeroSection {
    return {
      id: this.heroSectionId(),
      displayOrder: this.displayOrder(),
      heroSectionImageDTOs: this.heroImages(),
    };
  }

  private insertHeroSection(payload: IHeroSection) {
    this.heroSectionService.insertHeroSection(payload).subscribe(() => {
      this.loadData();
    });
  }

  private updateHeroSection(payload: IHeroSection) {
    this.heroSectionService.updateHeroSection(payload).subscribe(() => {
      this.loadData();
    });
  }
}
