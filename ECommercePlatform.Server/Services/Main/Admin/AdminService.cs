using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.Entities.Identity;
using ECommercePlatform.Server.Enums;
using ECommercePlatform.Server.Models.Admin;
using ECommercePlatform.Server.Models.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Services.Main.Admin
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDBContext _context;
        public AdminService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> RoleManager, ApplicationDBContext context)
        {
            _userManager = userManager;
            _roleManager = RoleManager;
            _context = context;
        }

        public async Task<List<AdminModel>> GetAll()
        {
            var adminUsers = await _userManager.GetUsersInRoleAsync(Roles.Admin.ToString());

            var administrators = adminUsers.Select(a => new AdminModel
            {
                ID = a.Id,
                Email = a.Email,
                UserName = $"{a.FirstName} {a.LastName}"
            }).ToList();

            return administrators;
        }

        public async Task<AdminModel> Insert(SignUp signUp)
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

                return new AdminModel();
            }

            await _userManager.AddToRoleAsync(user, Roles.Admin.ToString());

            return new AdminModel
            {
                ID = user.Id,
                Email = user.Email,
                UserName = $"{user.FirstName} {user.LastName}"
            };
        }

        public async Task<bool> Delete(string userID)
        {
            var user = await _userManager.FindByIdAsync(userID);

            if (user is null)
            {
                return false;
            }

            IdentityResult result = await _userManager.DeleteAsync(user);

            return result.Succeeded;
        }

        public async Task<bool> ChangePassword([FromBody] ChangePasswordModel model)
        {

            var user = await _userManager.FindByIdAsync(model.ID);

            if (user is null)
            {
                return false;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            IdentityResult result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            return result.Succeeded;
        }
    }
}
