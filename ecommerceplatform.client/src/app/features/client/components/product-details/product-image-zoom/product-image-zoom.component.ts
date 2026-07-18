import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { IProductImage } from '../../../../admin/interfaces/product-image.interface';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

@Component({
  selector: 'app-product-image-zoom',
  templateUrl: './product-image-zoom.component.html',
  styleUrls: ['./product-image-zoom.component.css'],
  standalone: false,
})
export class ProductImageZoomComponent implements OnInit, OnDestroy {
  images = input.required<IProductImage[]>();
  startIndex = input(0);
  productName = input('');
  closed = output<void>();

  currentIndex = signal(0);
  zoomLevel = signal(MIN_ZOOM);
  panX = signal(0);
  panY = signal(0);
  isDragging = signal(false);

  currentImageUrl = computed(() => {
    const items = this.images();
    const index = this.currentIndex();
    return items[index]?.imageUrl ?? '';
  });

  imageCounter = computed(() => {
    const total = this.images().length;
    if (total <= 1) {
      return '';
    }

    return `${this.currentIndex() + 1} / ${total}`;
  });

  zoomPercentLabel = computed(() => `${Math.round(this.zoomLevel() * 100)}%`);

  canZoomIn = computed(() => this.zoomLevel() < MAX_ZOOM);

  canZoomOut = computed(() => this.zoomLevel() > MIN_ZOOM);

  hasPrevious = computed(() => this.currentIndex() > 0);

  hasNext = computed(() => this.currentIndex() < this.images().length - 1);

  showNavigation = computed(() => this.images().length > 1);

  imageTransform = computed(() => {
    return `translate3d(${this.panX()}px, ${this.panY()}px, 0) scale(${this.zoomLevel()})`;
  });

  viewportClass = computed(() => ({
    'zoom-viewport-dragging': this.isDragging(),
    'zoom-viewport-active': this.zoomLevel() > MIN_ZOOM,
  }));

  private dragStartX = 0;
  private dragStartY = 0;
  private panStartX = 0;
  private panStartY = 0;

  ngOnInit(): void {
    this.currentIndex.set(this.resolveStartIndex());
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.showPrevious();
      return;
    }

    if (event.key === 'ArrowRight') {
      this.showNext();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.close();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  zoomIn(): void {
    if (!this.canZoomIn()) {
      return;
    }

    this.zoomLevel.set(this.roundZoom(this.zoomLevel() + ZOOM_STEP));
  }

  zoomOut(): void {
    if (!this.canZoomOut()) {
      return;
    }

    const nextZoom = this.roundZoom(this.zoomLevel() - ZOOM_STEP);
    this.zoomLevel.set(nextZoom);

    if (nextZoom === MIN_ZOOM) {
      this.resetPan();
    }
  }

  resetZoom(): void {
    this.zoomLevel.set(MIN_ZOOM);
    this.resetPan();
  }

  toggleZoom(): void {
    if (this.zoomLevel() > MIN_ZOOM) {
      this.resetZoom();
      return;
    }

    this.zoomLevel.set(2);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomIn();
      return;
    }

    this.zoomOut();
  }

  showPrevious(): void {
    if (!this.hasPrevious()) {
      return;
    }

    this.currentIndex.set(this.currentIndex() - 1);
    this.resetZoom();
  }

  showNext(): void {
    if (!this.hasNext()) {
      return;
    }

    this.currentIndex.set(this.currentIndex() + 1);
    this.resetZoom();
  }

  onPointerDown(event: PointerEvent): void {
    if (this.zoomLevel() <= MIN_ZOOM) {
      return;
    }

    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.panStartX = this.panX();
    this.panStartY = this.panY();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }

    this.panX.set(this.panStartX + (event.clientX - this.dragStartX));
    this.panY.set(this.panStartY + (event.clientY - this.dragStartY));
  }

  onPointerUp(): void {
    this.isDragging.set(false);
  }

  private resolveStartIndex(): number {
    const items = this.images();
    const index = this.startIndex();

    if (items.length === 0) {
      return 0;
    }

    if (index < 0 || index >= items.length) {
      return 0;
    }

    return index;
  }

  private resetPan(): void {
    this.panX.set(0);
    this.panY.set(0);
  }

  private roundZoom(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
