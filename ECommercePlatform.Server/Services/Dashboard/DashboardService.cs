using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.Dashboard
{
    public class DashboardService : IDashboardService
    {
        private const int LowStockThreshold = 10;
        private const int RecentOrdersLimit = 8;
        private const int TopProductsLimit = 5;

        private readonly ApplicationDBContext _dbContext;

        public DashboardService(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DashboardStatsDTO> GetStats()
        {
            var stats = new DashboardStatsDTO
            {
                TotalProducts = await GetTotalProducts(),
                TotalCategories = await GetTotalCategories(),
                TotalSubCategories = await GetTotalSubCategories(),
                PendingOrders = await GetPendingOrdersCount(),
                ConfirmedOrders = await GetConfirmedOrdersCount(),
                TotalRevenue = await GetConfirmedRevenue(),
                LowStockProducts = await GetLowStockProductsCount(),
                ActiveProducts = await GetActiveProductsCount(),
                RecentOrders = await GetRecentOrders(),
                TopProducts = await GetTopProducts()
            };

            return stats;
        }

        private async Task<int> GetTotalProducts()
        {
            return await _dbContext.Products.AsNoTracking().CountAsync();
        }

        private async Task<int> GetTotalCategories()
        {
            return await _dbContext.Categories.AsNoTracking().CountAsync();
        }

        private async Task<int> GetTotalSubCategories()
        {
            return await _dbContext.SubCategories.AsNoTracking().CountAsync();
        }

        private async Task<int> GetPendingOrdersCount()
        {
            return await _dbContext.Orders.AsNoTracking().CountAsync(o => !o.IsConfirmed);
        }

        private async Task<int> GetConfirmedOrdersCount()
        {
            return await _dbContext.Orders.AsNoTracking().CountAsync(o => o.IsConfirmed);
        }

        private async Task<decimal> GetConfirmedRevenue()
        {
            return await _dbContext.Orders
                .AsNoTracking()
                .Where(o => o.IsConfirmed)
                .SumAsync(o => o.Total);
        }

        private async Task<int> GetLowStockProductsCount()
        {
            return await _dbContext.Products
                .AsNoTracking()
                .CountAsync(p => p.StockQuantity.HasValue && p.StockQuantity.Value <= LowStockThreshold);
        }

        private async Task<int> GetActiveProductsCount()
        {
            return await _dbContext.Products
                .AsNoTracking()
                .CountAsync(p => p.IsActive);
        }

        private async Task<List<DashboardRecentOrderDTO>> GetRecentOrders()
        {
            var orders = await _dbContext.Orders
                .AsNoTracking()
                .Include(o => o.ProductsOrders)
                .OrderByDescending(o => o.CreateDate)
                .Take(RecentOrdersLimit)
                .ToListAsync();

            return MapRecentOrders(orders);
        }

        private static List<DashboardRecentOrderDTO> MapRecentOrders(List<Entities.Orders.Order> orders)
        {
            var result = new List<DashboardRecentOrderDTO>();

            foreach (var order in orders)
            {
                result.Add(new DashboardRecentOrderDTO
                {
                    OrderID = order.ID,
                    UserName = order.UserName,
                    PhoneNumber = order.PhoneNumber,
                    Total = order.Total,
                    IsConfirmed = order.IsConfirmed,
                    CreateDate = order.CreateDate,
                    ItemsCount = order.ProductsOrders?.Count ?? 0
                });
            }

            return result;
        }

        private async Task<List<DashboardTopProductDTO>> GetTopProducts()
        {
            var productSales = await _dbContext.ProductsOrders
                .AsNoTracking()
                .Include(po => po.Product)
                .ToListAsync();

            return BuildTopProducts(productSales);
        }

        private static List<DashboardTopProductDTO> BuildTopProducts(List<Entities.Orders.ProductsOrders> productSales)
        {
            var grouped = new Dictionary<int, DashboardTopProductDTO>();

            foreach (var sale in productSales)
            {
                if (sale.Product == null)
                {
                    continue;
                }

                if (!grouped.TryGetValue(sale.ProductID, out var entry))
                {
                    entry = new DashboardTopProductDTO
                    {
                        ProductID = sale.ProductID,
                        ProductName = sale.Product.EnglishName ?? string.Empty,
                        TotalSold = 0,
                        Revenue = 0
                    };
                    grouped[sale.ProductID] = entry;
                }

                entry.TotalSold += sale.QTY;
                entry.Revenue += sale.UnitPrice * sale.QTY;
            }

            var result = new List<DashboardTopProductDTO>();

            foreach (var item in grouped.Values)
            {
                result.Add(item);
            }

            result.Sort(CompareTopProducts);

            if (result.Count > TopProductsLimit)
            {
                return result.GetRange(0, TopProductsLimit);
            }

            return result;
        }

        private static int CompareTopProducts(DashboardTopProductDTO a, DashboardTopProductDTO b)
        {
            return b.TotalSold.CompareTo(a.TotalSold);
        }
    }
}
