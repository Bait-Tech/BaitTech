import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, signal } from '@angular/core';
import { CompanyService } from '../../../../shared/services/company.service';
import { IContactChannel } from '../../interfaces/contact-channel.interface';

@Component({
  selector: 'app-contact-widget',
  templateUrl: './contact-widget.component.html',
  styleUrls: ['./contact-widget.component.css'],
  imports: [CommonModule],
})
export class ContactWidgetComponent {
  isOpen = signal(false);

  contactChannels = computed(() => this.buildContactChannels());
  hasContactChannels = computed(() => this.contactChannels().length > 0);

  constructor(private companyService: CompanyService) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.isOpen()) {
      return;
    }

    const target = event.target as HTMLElement;

    if (!target.closest('.contact-widget')) {
      this.isOpen.set(false);
    }
  }

  toggleWidget(event: Event) {
    event.stopPropagation();
    this.isOpen.update((value) => !value);
  }

  closeWidget() {
    this.isOpen.set(false);
  }

  private buildContactChannels(): IContactChannel[] {
    const channels: IContactChannel[] = [];

    this.addFacebookChannel(channels);
    this.addInstagramChannel(channels);
    this.addSnapchatChannel(channels);
    this.addPhoneChannel(channels);

    return channels;
  }

  private addFacebookChannel(channels: IContactChannel[]) {
    const href = this.companyService.facebookUrl();

    if (!href) {
      return;
    }

    channels.push({
      id: 'facebook',
      href,
      label: 'Facebook',
      iconClass: 'bi bi-facebook',
      external: true,
    });
  }

  private addInstagramChannel(channels: IContactChannel[]) {
    const href = this.companyService.instagramUrl();

    if (!href) {
      return;
    }

    channels.push({
      id: 'instagram',
      href,
      label: 'Instagram',
      iconClass: 'bi bi-instagram',
      external: true,
    });
  }

  private addSnapchatChannel(channels: IContactChannel[]) {
    const href = this.companyService.snapchatUrl();

    if (!href) {
      return;
    }

    channels.push({
      id: 'snapchat',
      href,
      label: 'Snapchat',
      iconClass: 'bi bi-snapchat',
      external: true,
    });
  }

  private addPhoneChannel(channels: IContactChannel[]) {
    const href = this.companyService.phoneHref();

    if (!href) {
      return;
    }

    channels.push({
      id: 'phone',
      href,
      label: 'Phone',
      iconClass: 'bi bi-telephone-fill',
      external: false,
    });
  }
}
