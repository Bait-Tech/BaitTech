import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.css'],
  standalone: false,
})
export class SidePanelComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() width = '32rem';
  @Input() closeOnBackdrop = true;
  @Output() visibleChange = new EventEmitter<boolean>();

  onCloseClick(): void {
    this.emitClose();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.emitClose();
    }
  }

  private emitClose(): void {
    this.visibleChange.emit(false);
  }
}
