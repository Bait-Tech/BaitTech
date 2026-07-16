export interface IDashboardRecentOrder {
  orderID: number;
  userName: string;
  phoneNumber: string;
  total: number;
  isConfirmed: boolean;
  createDate: string;
  itemsCount: number;
}

export interface IDashboardTopProduct {
  productID: number;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface IDashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSubCategories: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  activeProducts: number;
  recentOrders: IDashboardRecentOrder[];
  topProducts: IDashboardTopProduct[];
}

export interface IDashboardStatCard {
  label: string;
  value: string;
  icon: string;
  accent: string;
  route: string;
}
