import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-confirm-panel',
  templateUrl: './admin-confirm-panel.component.html',
  standalone: false,
})
export class AdminConfirmPanelComponent {
  @Input() visible = false;
  @Input() title = 'Confirm Action';
  @Input() subtitle = 'Please review before continuing';
  @Input() message = '';
  @Input() confirmLabel = 'Yes';
  @Input() cancelLabel = 'No';
  @Input() loading = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onPanelVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.cancelled.emit();
    }
  }

  onConfirmClick(): void {
    this.confirmed.emit();
  }

  onCancelClick(): void {
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }
}
