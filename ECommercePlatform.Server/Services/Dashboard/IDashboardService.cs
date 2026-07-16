using ECommercePlatform.Server.DTOs.Dashboard;

namespace ECommercePlatform.Server.Services.Dashboard
{
    public interface IDashboardService
    {
        Task<DashboardStatsDTO> GetStats();
    }
}
