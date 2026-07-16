namespace ECommercePlatform.Server.DTOs.Dashboard
{
    public class DashboardRecentOrderDTO
    {
        public int OrderID { get; set; }
        public required string UserName { get; set; }
        public required string PhoneNumber { get; set; }
        public decimal Total { get; set; }
        public bool IsConfirmed { get; set; }
        public DateTime CreateDate { get; set; }
        public int ItemsCount { get; set; }
    }
}
