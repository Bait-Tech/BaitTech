import { Component, Inject, OnDestroy, OnInit, Renderer2, DOCUMENT } from '@angular/core';
import { LayoutService } from '../services/app.layout.service';
import { AdminAsideMenuComponent } from './components/admin-aside-menu/admin-aside-menu.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, AdminAsideMenuComponent]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    public layoutService: LayoutService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.layoutService.stateChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnInit(): void {
    this.enableAdminTheme();
  }

  private enableAdminTheme(): void {
    this.renderer.addClass(this.document.body, 'admin-theme');
  }

  private disableAdminTheme(): void {
    this.renderer.removeClass(this.document.body, 'admin-theme');
  }

  get containerClass(): Record<string, boolean> {
    return {
      'layout-wrapper': true,
      'layout-static': true,
      'layout-static-active': this.layoutService.state.staticMenuDesktopInactive,
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'p-input-filled': this.layoutService.state.inputStyle === 'filled',
      'p-ripple-disabled': !this.layoutService.state.ripple
    };
  }

  hideMenu(): void {
    this.layoutService.hideMenu();
  }

  ngOnDestroy(): void {
    this.disableAdminTheme();
    this.destroy$.next();
    this.destroy$.complete();
  }
}