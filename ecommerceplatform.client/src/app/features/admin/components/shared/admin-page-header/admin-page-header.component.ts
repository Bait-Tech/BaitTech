import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrls: ['./admin-page-header.component.css'],
  standalone: false,
})
export class AdminPageHeaderComponent {
  @Input() title = '';
  @Input() icon = 'pi pi-th-large';
  @Input() subtitle = '';
}
