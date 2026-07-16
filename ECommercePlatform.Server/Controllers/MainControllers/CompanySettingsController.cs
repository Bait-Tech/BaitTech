using ECommercePlatform.Server.DTOs.Settings;
using ECommercePlatform.Server.Services.Main.Settings;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.MainControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanySettingsController : ControllerBase
    {
        private readonly ICompanySettingsService _companySettingsService;

        public CompanySettingsController(ICompanySettingsService companySettingsService)
        {
            _companySettingsService = companySettingsService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var settings = await _companySettingsService.Get();

            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> Save([FromForm] CompanySettingsDTO model)
        {
            var id = await _companySettingsService.Save(model);

            return Ok(id);
        }
    }
}
