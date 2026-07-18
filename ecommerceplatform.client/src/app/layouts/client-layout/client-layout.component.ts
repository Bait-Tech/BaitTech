import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CartPanelComponent } from '../../features/client/components/shopping-cart/cart-panel/cart-panel.component';
import { BackgroundVideoSectionService } from '../../features/admin/services/background-video-section.service';
import { enrichBackgroundVideoPreview } from '../../features/admin/utils/background-video-preview.util';
import { preconnectOrigin } from '../../shared/utils/lcp-preload.util';
import { FooterComponent } from './components/footer/footer.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { ContactWidgetComponent } from './components/contact-widget/contact-widget.component';

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    NavBarComponent,
    CartPanelComponent,
    ContactWidgetComponent,
  ],
})
export class ClientLayoutComponent implements OnInit, AfterViewInit {
  private backgroundVideoElement = viewChild<ElementRef<HTMLVideoElement>>('backgroundVideo');

  videoUrl = signal('');
  isActive = signal(false);

  hasBackgroundVideo = computed(() => this.isActive() && this.videoUrl().trim().length > 0);
  backgroundVideoPreview = computed(() => enrichBackgroundVideoPreview(this.videoUrl(), this.sanitizer));

  constructor(
    private backgroundVideoSectionService: BackgroundVideoSectionService,
    private sanitizer: DomSanitizer
  ) {
    effect(() => {
      this.hasBackgroundVideo();
      this.backgroundVideoPreview();
      queueMicrotask(() => this.syncBackgroundVideoPlayback());
    });
  }

  ngOnInit() {
    this.loadBackgroundVideo();
  }

  ngAfterViewInit() {
    this.syncBackgroundVideoPlayback();
  }

  private loadBackgroundVideo() {
    this.backgroundVideoSectionService.getBackgroundVideoSection().subscribe({
      next: (section) => {
        const videoUrl = section.videoUrl?.trim() ?? '';
        this.videoUrl.set(videoUrl);
        this.isActive.set(this.readIsActive(section.isActive));
        this.preloadYoutubeResources(videoUrl);
      },
    });
  }

  private preloadYoutubeResources(videoUrl: string) {
    const preview = enrichBackgroundVideoPreview(videoUrl, this.sanitizer);

    if (!preview.isYoutubeVideo) {
      return;
    }

    preconnectOrigin('https://www.youtube.com');
    preconnectOrigin('https://i.ytimg.com');
  }

  private readIsActive(value: boolean | undefined): boolean {
    return value !== false;
  }

  private syncBackgroundVideoPlayback() {
    if (!this.hasBackgroundVideo() || this.backgroundVideoPreview().isYoutubeVideo) {
      return;
    }

    const video = this.backgroundVideoElement()?.nativeElement;

    if (!video) {
      return;
    }

    video.muted = true;
    video.play().catch(() => undefined);
  }
}
