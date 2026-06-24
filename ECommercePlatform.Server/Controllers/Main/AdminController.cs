using ECommercePlatform.Server.Models.Admin;
using ECommercePlatform.Server.Models.Identity;
using ECommercePlatform.Server.Services.Main.Admin;
using ECommercePlatform.Server.Services.Main.Product;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.Main
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService) 
        {
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var admins = await _adminService.GetAll();

            return Ok(admins);
        }

        [HttpPost]
        public async Task<ActionResult> CreateAdmin([FromBody] SignUp signUp)
        {
            var result = await _adminService.Insert(signUp);

            if (result.Email == null)
            {
                return BadRequest("Failed to create admin");
            }

            return CreatedAtAction(nameof(GetAll), result);
        }

        [HttpDelete("{userId}")]
        public async Task<ActionResult> DeleteAdmin(string userId)
        {
            var result = await _adminService.Delete(userId);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpPut("changePassword")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            var result = await _adminService.ChangePassword(model);
            if (!result)
            {
                return BadRequest("Failed to change password");
            }
            return NoContent();
        }
    }
    // Home page customize
    // orders pending / comfrimed
    // Dashboard
    // get Products by category or sub category
    // 

}
