namespace ECommercePlatform.Server.DTOs.Dashboard
{
    public class DashboardStatsDTO
    {
        public int TotalProducts { get; set; }
        public int TotalCategories { get; set; }
        public int TotalSubCategories { get; set; }
        public int PendingOrders { get; set; }
        public int ConfirmedOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int LowStockProducts { get; set; }
        public int ActiveProducts { get; set; }
        public List<DashboardRecentOrderDTO> RecentOrders { get; set; } = [];
        public List<DashboardTopProductDTO> TopProducts { get; set; } = [];
    }
}
