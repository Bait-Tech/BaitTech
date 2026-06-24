using ECommercePlatform.Server.Models.Identity;
using ECommercePlatform.Server.Services.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.Identity
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IIdentityService _identityService;

        public AuthController(IIdentityService identityService)
        {
            _identityService = identityService;
        }


        [HttpPost("Register")]
        public async Task<IActionResult> SignUp([FromBody] SignUp model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _identityService.SignUp(model);

            if (!result.IsAuthenticated)
            {
                return BadRequest();
            }

            return Ok(result);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _identityService.Login(model);

            if (!result.IsAuthenticated)
            {
                return BadRequest(result);
            }

            if (!string.IsNullOrEmpty(result.RefreshToken))
            {
                SetRefreshTokenInCookie(result.RefreshToken, result.RefreshTokenExpiration);
            }

            return Ok(result);
        }

        [HttpGet("RefreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var result = await _identityService.RefreshTokenAsync(refreshToken);
            if (!result.IsAuthenticated)
            {
                return BadRequest(result);
            }

            SetRefreshTokenInCookie(result.RefreshToken, result.RefreshTokenExpiration);

            return Ok(result);

        }

        [HttpPost("RevokeToken")]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeToken model)
        {
            var token = model.Token ?? Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(token))
            {
                return BadRequest();
            }

            var result = await _identityService.RevokeTokenAsync(token);

            if (!result)
            {
                return BadRequest();
            }

            return Ok();
        }

        private void SetRefreshTokenInCookie(string refreshToken, DateTime? expires)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = expires?.ToLocalTime(),
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}
