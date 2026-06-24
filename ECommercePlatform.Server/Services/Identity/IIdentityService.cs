using ECommercePlatform.Server.Models.Identity;

namespace ECommercePlatform.Server.Services.Identity
{
    public interface IIdentityService
    {
        Task<AuthenticationResponse> Login(Login login);
        Task<AuthenticationResponse> SignUp(SignUp signUp);
        Task<AuthenticationResponse> RefreshTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string token);
    }
}
