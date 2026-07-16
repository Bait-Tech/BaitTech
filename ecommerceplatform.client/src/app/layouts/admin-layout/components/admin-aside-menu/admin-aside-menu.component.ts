import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { CompanyService } from '../../../../shared/services/company.service';
import { IAdminNavGroup } from '../../../../features/admin/interfaces/admin-nav.interface';

@Component({
    selector: 'app-admin-aside-menu',
    templateUrl: './admin-aside-menu.component.html',
    styleUrls: ['./admin-aside-menu.component.css'],
    imports: [CommonModule, RouterModule]
})
export class AdminAsideMenuComponent implements OnInit {
  navGroups = signal<IAdminNavGroup[]>([]);
  userName = signal('Admin User');
  userRole = signal('Administrator');
  userInitials = signal('A');

  constructor(
    private authService: AuthService,
    public companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadNavGroups();
    this.loadCurrentUser();
  }

  private loadNavGroups(): void {
    this.navGroups.set([
      {
        title: 'Overview',
        items: [
          { label: 'Dashboard', icon: 'pi pi-home', route: '/admin/dashboard' },
        ],
      },
      {
        title: 'Catalog',
        items: [
          { label: 'Categories', icon: 'pi pi-sitemap', route: '/admin/categories' },
          { label: 'Sub Categories', icon: 'pi pi-tags', route: '/admin/sub-categories' },
          { label: 'Products', icon: 'pi pi-box', route: '/admin/products' },
        ],
      },
      {
        title: 'Store',
        items: [
          { label: 'Home Page', icon: 'pi pi-desktop', route: '/admin/home-page-customize' },
        ],
      },
      {
        title: 'Orders',
        items: [
          { label: 'Pending Orders', icon: 'pi pi-clock', route: '/admin/pending-orders' },
          { label: 'Confirmed Orders', icon: 'pi pi-check-circle', route: '/admin/confirmed-orders' },
        ],
      },
      {
        title: 'Settings',
        items: [
          { label: 'Company Settings', icon: 'pi pi-cog', route: '/admin/company-settings' },
        ],
      },
    ]);
  }

  private loadCurrentUser(): void {
    const user = this.authService.currentUserValue;

    if (!user) {
      return;
    }

    const name = this.buildUserName(user);
    this.userName.set(name);
    this.userRole.set(user.role || 'Administrator');
    this.userInitials.set(this.buildInitials(name));
  }

  private buildUserName(user: any): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.userName || user.email || 'Admin User';
  }

  private buildInitials(name: string): string {
    const parts = name.split(' ').filter((part) => part.length > 0);

    if (parts.length === 0) {
      return 'A';
    }

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
