using ECommercePlatform.Server.Services.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.MainControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _dashboardService.GetStats();

            return Ok(stats);
        }
    }
}
