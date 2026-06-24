using ECommerce.Core.Common;
using ECommerce.Core.DTOs.Identity;
using ECommerce.Core.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECommerce.Services.Services.Identity.AdminServices
{
    public interface IAdminService
    {
        Task<ApiResponse<User>> GetByIdAsync(string userId);
        Task<ApiResponse<List<User>>> GetAllAsync();
        Task<ApiResponse<User>> RegisterAsync(string email, string password);
        Task<ApiResponse<User>> UpdateAsync(UserDto user);
        Task<ApiResponse<string>> DeleteAsync(string userId);
        Task<ApiResponse<string>> ChangePasssword(string userId, string newPassword);
    }
}
