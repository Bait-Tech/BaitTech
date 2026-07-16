namespace ECommercePlatform.Server.DTOs.Dashboard
{
    public class DashboardTopProductDTO
    {
        public int ProductID { get; set; }
        public required string ProductName { get; set; }
        public int TotalSold { get; set; }
        public decimal Revenue { get; set; }
    }
}
