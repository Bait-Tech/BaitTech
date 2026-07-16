import { Component, OnInit, signal } from '@angular/core';

import { MessageService } from 'primeng/api';

import { Subject, debounceTime } from 'rxjs';

import { IFilterOrders } from '../../interfaces/filter-orders.interface';

import { IOrders } from '../../interfaces/orders.interface';

import { IProductsOrder } from '../../interfaces/products-order.interface';

import { OrdersService } from '../../services/orders.service';



@Component({

    selector: 'app-confirmed-orders',

    templateUrl: './confirmed-orders.component.html',

    styleUrls: ['./confirmed-orders.component.css', '../shared/order-filters-panel.css'],

    standalone: false

})

export class ConfirmedOrdersComponent implements OnInit {

  orders = signal<IOrders[]>([]);

  selectedOrders: IOrders[] = [];

  totalRecords = signal(0);

  initialLoading = signal(true);

  tableLoading = signal(false);

  productsPanelVisible = signal(false);
  productsPanelTitle = signal('Order Products');
  selectedOrderProducts = signal<IProductsOrder[]>([]);
  hasActiveFilters = signal(false);

  private filterSubject = new Subject<void>();



  filters: IFilterOrders = {

    paginationParams: {

      pageNumber: 1,

      pageSize: 10,

    },

    userName: '',

    PhoneNumber: '',

    isApproved:true

  };



  constructor(

    private ordersService: OrdersService,

    private messageService: MessageService

  ) {

    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {

      this.loadOrders({ first: 0, rows: 10 });

    });

  }



  ngOnInit(): void {

    this.loadOrders({ first: 0, rows: 10 });

  }



  loadOrders(event: any) {

    if (!this.initialLoading()) {

      this.tableLoading.set(true);

    }



    const first = event?.first ?? 0;

    const rows = event?.rows ?? 10;



    const filter: IFilterOrders = {

      paginationParams: {

        pageNumber: Math.floor(first / rows) + 1,

        pageSize: rows,

      },

      userName: this.filters.userName,

      PhoneNumber: this.filters.PhoneNumber,

      isApproved:true

    };



    this.ordersService.getOrders(filter).subscribe({

      next: (response) => {

        this.orders.set(response?.items ?? []);

        this.totalRecords.set(response?.totalCount ?? 0);

        this.initialLoading.set(false);

        this.tableLoading.set(false);

      },

      error: () => {

        this.messageService.add({

          severity: 'error',

          summary: 'Error',

          detail: 'Failed to load orders',

        });

        this.initialLoading.set(false);

        this.tableLoading.set(false);

      },

    });

  }



  showProducts(order: IOrders) {
    this.selectedOrderProducts.set(order.productsOrderDTO ?? []);
    this.productsPanelTitle.set(`Order #${order.orderID} Products`);
    this.productsPanelVisible.set(true);
  }

  hideProductsPanel(): void {
    this.productsPanelVisible.set(false);
    this.selectedOrderProducts.set([]);
  }

  onProductsPanelVisibleChange(visible: boolean): void {
    this.productsPanelVisible.set(visible);
    if (!visible) {
      this.selectedOrderProducts.set([]);
    }
  }



  onFilter() {
    this.updateActiveFilters();
    this.filterSubject.next();
  }

  clearFilters() {
    this.filters.userName = '';
    this.filters.PhoneNumber = '';
    this.hasActiveFilters.set(false);
    this.filterSubject.next();
  }

  private updateActiveFilters() {
    const hasUserName = (this.filters.userName ?? '').trim().length > 0;
    const hasPhoneNumber = (this.filters.PhoneNumber ?? '').trim().length > 0;
    this.hasActiveFilters.set(hasUserName || hasPhoneNumber);
  }



  deleteSelectedOrders() {

    if (!this.selectedOrders.length) {

      this.messageService.add({

        severity: 'warn',

        summary: 'Warning',

        detail: 'Please select orders to delete',

      });

      return;

    }



    const orderIds = this.selectedOrders.map((order) => order.orderID!);

    this.ordersService.deleteOrders(orderIds).subscribe({

      next: () => {

        this.messageService.add({

          severity: 'success',

          summary: 'Success',

          detail: 'Orders deleted successfully',

        });

        this.loadOrders({ first: 0, rows: 10 });

        this.selectedOrders = [];

      },

      error: () => {

        this.messageService.add({

          severity: 'error',

          summary: 'Error',

          detail: 'Failed to delete orders',

        });

      },

    });

  }

}


