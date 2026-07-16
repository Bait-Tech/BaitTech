import { Component, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';
import {
  IDashboardRecentOrder,
  IDashboardStatCard,
  IDashboardStats,
  IDashboardTopProduct,
} from '../../interfaces/dashboard-stats.interface';
import { formatJodCurrency } from '../../../../shared/utils/format-jod-currency.util';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  statCards = signal<IDashboardStatCard[]>([]);
  recentOrders = signal<IDashboardRecentOrder[]>([]);
  topProducts = signal<IDashboardTopProduct[]>([]);
  totalOrders = signal(0);
  catalogSummary = signal('');

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);

    this.dashboardService.getStats().subscribe({
      next: (stats) => this.applyStats(stats),
      error: () => this.onLoadError(),
    });
  }

  private applyStats(stats: IDashboardStats): void {
    this.statCards.set(this.buildStatCards(stats));
    this.recentOrders.set(stats.recentOrders ?? []);
    this.topProducts.set(stats.topProducts ?? []);
    this.totalOrders.set(stats.pendingOrders + stats.confirmedOrders);
    this.catalogSummary.set(this.buildCatalogSummary(stats));
    this.loading.set(false);
  }

  private buildStatCards(stats: IDashboardStats): IDashboardStatCard[] {
    return [
      {
        label: 'Total Revenue',
        value: this.formatCurrency(stats.totalRevenue),
        icon: 'pi pi-wallet',
        accent: 'accent-gold',
        route: '/admin/confirmed-orders',
      },
      {
        label: 'Pending Orders',
        value: stats.pendingOrders.toString(),
        icon: 'pi pi-clock',
        accent: 'accent-warning',
        route: '/admin/pending-orders',
      },
      {
        label: 'Confirmed Orders',
        value: stats.confirmedOrders.toString(),
        icon: 'pi pi-check-circle',
        accent: 'accent-success',
        route: '/admin/confirmed-orders',
      },
      {
        label: 'Products',
        value: stats.totalProducts.toString(),
        icon: 'pi pi-box',
        accent: 'accent-info',
        route: '/admin/products',
      },
      {
        label: 'Active Products',
        value: stats.activeProducts.toString(),
        icon: 'pi pi-check',
        accent: 'accent-success',
        route: '/admin/products',
      },
      {
        label: 'Low Stock',
        value: stats.lowStockProducts.toString(),
        icon: 'pi pi-exclamation-triangle',
        accent: 'accent-danger',
        route: '/admin/products',
      },
      {
        label: 'Categories',
        value: stats.totalCategories.toString(),
        icon: 'pi pi-tags',
        accent: 'accent-info',
        route: '/admin/categories',
      },
      {
        label: 'Sub Categories',
        value: stats.totalSubCategories.toString(),
        icon: 'pi pi-sitemap',
        accent: 'accent-info',
        route: '/admin/sub-categories',
      },
    ];
  }

  private buildCatalogSummary(stats: IDashboardStats): string {
    return `${stats.totalCategories} categories · ${stats.totalSubCategories} sub categories · ${stats.activeProducts} active products`;
  }

  private formatCurrency(value: number): string {
    return formatJodCurrency(value);
  }

  private onLoadError(): void {
    this.loading.set(false);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dashboard data',
    });
  }
}
