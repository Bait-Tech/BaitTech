using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.Entities.Identity;
using ECommercePlatform.Server.Enums;
using ECommercePlatform.Server.Helpers;
using ECommercePlatform.Server.Models.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ECommercePlatform.Server.Services.Identity
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDBContext _context;
        private readonly JWT _jwt;
        public IdentityService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> RoleManager, IOptions<JWT> jwt, ApplicationDBContext context)
        {
            _userManager = userManager;
            _jwt = jwt.Value;
            _roleManager = RoleManager;
            _context = context;
        }

        public async Task<AuthenticationResponse> Login(Login login)
        {
            var authModel = new AuthenticationResponse();

            if (login.Email is null || login.Password is null)
            {
                return authModel;
            }

            var user = await _userManager.FindByEmailAsync(login.Email);

            if (user is null || !await _userManager.CheckPasswordAsync(user, login.Password))
            {
                //return new AuthModel { Key = ResponseKeys.InvalidCredentials.ToString() };
            }

            var jwtSecurityToken = await CreateJwtToken(user);

            var userRole = await _userManager.GetRolesAsync(user);

            authModel.IsAuthenticated = true;
            authModel.Token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);
            authModel.Email = user.Email;
            authModel.FirstName = user.FirstName;
            authModel.LastName = user.LastName;
            authModel.UserName = user.UserName;
            authModel.Role = userRole.FirstOrDefault();

            if (user.RefreshTokens.Any(t => t.IsActive))
            {
                var activeRefreshToken = user.RefreshTokens.FirstOrDefault(t => t.IsActive);
                authModel.RefreshToken = activeRefreshToken.Token;
                authModel.RefreshTokenExpiration = jwtSecurityToken.ValidTo;
            }

            else
            {
                var refreshToken = GenerateRefreshToken();
                authModel.RefreshToken = refreshToken.Token;
                authModel.RefreshTokenExpiration = jwtSecurityToken.ValidTo;
                user.RefreshTokens.Add(refreshToken);
                await _userManager.UpdateAsync(user);
            }

            return authModel;
        }
        public async Task<AuthenticationResponse> SignUp(SignUp signUp)
        {
            if (await _userManager.FindByEmailAsync(signUp.Email) is not null)
            {
                //return new AuthModel { Key = ResponseKeys.EmailExists.ToString() };
            }

            var user = new ApplicationUser
            {
                UserName = signUp.Email,
                Email = signUp.Email,
                FirstName = signUp.FirstName,
                LastName = signUp.LastName,
            };

            var result = await _userManager.CreateAsync(user, signUp.Password);

            if (!result.Succeeded)
            {
                var errors = string.Empty;

                foreach (var error in result.Errors)
                {
                    errors += $"{error.Description},";
                }

                return new AuthenticationResponse();
            }

            await _userManager.AddToRoleAsync(user, Roles.Admin.ToString());

            var jwtSecurityToken = await CreateJwtToken(user);

            return new AuthenticationResponse
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName = user.UserName,
                IsAuthenticated = true,
                RefreshTokenExpiration = jwtSecurityToken.ValidTo,
                Role = Roles.Admin.ToString(),
                Token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken),
            };
        }
        public async Task<AuthenticationResponse> RefreshTokenAsync(string token)
        {
            var authModel = new AuthenticationResponse();

            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

            if (user is null)
            {
                authModel.IsAuthenticated = false;
                // authModel.Key = ResponseKeys.InvalidToken.ToString();
                return authModel;
            }

            var refreshToken = user.RefreshTokens.Single(t => t.Token == token);

            if (!refreshToken.IsActive)
            {
                authModel.IsAuthenticated = false;
                // authModel.Key = ResponseKeys.InactiveToken.ToString();
                return authModel;
            }

            refreshToken.RevokedOn = DateTime.UtcNow;

            var newRefreshToken = GenerateRefreshToken();

            user.RefreshTokens.Add(newRefreshToken);

            await _userManager.UpdateAsync(user);

            var jwtToken = await CreateJwtToken(user);

            var userRole = await _userManager.GetRolesAsync(user);

            authModel.IsAuthenticated = true;
            authModel.Token = new JwtSecurityTokenHandler().WriteToken(jwtToken);
            authModel.Email = user.Email;
            authModel.UserName = user.UserName;
            authModel.Role = userRole.FirstOrDefault();
            authModel.RefreshToken = newRefreshToken.Token;
            authModel.RefreshTokenExpiration = newRefreshToken.ExpiresOn;
            return authModel;
        }
        public async Task<bool> RevokeTokenAsync(string token)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));
            if (user is null)
            {
                return false;
            }

            var refreshToken = user.RefreshTokens.Single(t => t.Token == token);

            if (!refreshToken.IsActive)
            {
                return false;
            }

            refreshToken.RevokedOn = DateTime.UtcNow;


            await _userManager.UpdateAsync(user);

            return true;
        }
        private async Task<JwtSecurityToken> CreateJwtToken(ApplicationUser user)
        {
            var userClaims = await _userManager.GetClaimsAsync(user);
            var userRole = await _userManager.GetRolesAsync(user);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("uid", user.Id),
               new Claim("role", userRole.FirstOrDefault())
            }
            .Union(userClaims);

            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
            var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

            var jwtSecurityToken = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwt.DurationInMinutes),
                signingCredentials: signingCredentials);

            return jwtSecurityToken;
        }
        private RefreshToken GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var generator = new RNGCryptoServiceProvider();

            generator.GetBytes(randomNumber);
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                ExpiresOn = DateTime.UtcNow.AddDays(10),
                CreatedOn = DateTime.UtcNow,
            };

        }
    }
}
