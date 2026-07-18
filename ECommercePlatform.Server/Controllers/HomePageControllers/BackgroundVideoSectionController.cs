using ECommercePlatform.Server.DTOs.HomePageSections;
using ECommercePlatform.Server.Services.HomePageCustomize.BackgroundVideo;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.HomePageControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BackgroundVideoSectionController : ControllerBase
    {
        private readonly IBackgroundVideoSectionService _backgroundVideoSectionService;

        public BackgroundVideoSectionController(IBackgroundVideoSectionService backgroundVideoSectionService)
        {
            _backgroundVideoSectionService = backgroundVideoSectionService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var section = await _backgroundVideoSectionService.Get();

            return Ok(section);
        }

        [HttpPut]
        public async Task<IActionResult> Save([FromBody] BackgroundVideoSectionDTO model)
        {
            var id = await _backgroundVideoSectionService.Save(model);

            return Ok(id);
        }
    }
}
