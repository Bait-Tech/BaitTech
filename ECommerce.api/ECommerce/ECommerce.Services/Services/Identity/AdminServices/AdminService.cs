using ECommerce.Core.Common;
using ECommerce.Core.DTOs.Identity;
using ECommerce.Core.Entities.Identity;
using ECommerce.Core.Enums.Identity;
using ECommerce.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services.Services.Identity.AdminServices
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;
        public AdminService(UserManager<User> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }
        public async Task<ApiResponse<User>> GetByIdAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return ApiResponse<User>.FailureResponse(ApiResponseMessages.UserNotFound);
            }
            return ApiResponse<User>.SuccessReponse(user);
        }
        public async Task<ApiResponse<List<User>>> GetAllAsync()
        {
            var users = await _userManager.GetUsersInRoleAsync(Roles.Admin.ToString());
            return ApiResponse<List<User>>.SuccessReponse(users.ToList());
        }
        public async Task<ApiResponse<User>> RegisterAsync(string email, string password)
        {
            var existingUser = await _userManager.FindByNameAsync(email);

            if (existingUser != null)
            {

                return ApiResponse<User>.FailureResponse(ApiResponseMessages.UserAlreadyExists);
            }

            var newUser = new User
            {
                Email = email,
            };

            var result = await _userManager.CreateAsync(newUser, password);


            if (!result.Succeeded)
            {
                return ApiResponse<User>.FailureResponse(ApiResponseCodes.BadRequest, result.Errors.Select(e => e.Description).ToList());
            }

            await _userManager.AddToRoleAsync(newUser, Roles.Admin.ToString());

            return ApiResponse<User>.SuccessReponse(newUser, ApiResponseMessages.UserCreated);
        }
        public async Task<ApiResponse<User>> UpdateAsync(UserDto user)
        {
            var existingUser = await _userManager.FindByEmailAsync(user.Email);

            if (existingUser == null)
            {
                return ApiResponse<User>.FailureResponse(ApiResponseMessages.UserNotFound);
            }

            if (existingUser?.Id != user.ID)
            {
                return ApiResponse<User>.FailureResponse(ApiResponseMessages.EmailExists);
            }

            existingUser.Email = user.Email;

            await _userManager.UpdateAsync(existingUser);

            return ApiResponse<User>.SuccessReponse(existingUser, ApiResponseMessages.UserUpdated);
        }
        public async Task<ApiResponse<string>> DeleteAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return ApiResponse<string>.FailureResponse(ApiResponseMessages.UserNotFound);
            }

            await _userManager.DeleteAsync(user);

            return ApiResponse<string>.SuccessResponse(ApiResponseMessages.DeletedSuccesfully);
        }
        public async Task<ApiResponse<string>> ChangePasssword(string userId , string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return ApiResponse<string>.FailureResponse(ApiResponseMessages.UserNotFound);
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);


            IdentityResult result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            return ApiResponse<string>.SuccessResponse(ApiResponseMessages.UpdatedSuccesfully);
        }
    }
}
