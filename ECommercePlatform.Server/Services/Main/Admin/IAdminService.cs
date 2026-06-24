using ECommercePlatform.Server.Models.Admin;
using ECommercePlatform.Server.Models.Identity;

namespace ECommercePlatform.Server.Services.Main.Admin
{
    public interface IAdminService
    {
        Task<List<AdminModel>> GetAll();
        Task<AdminModel> Insert(SignUp signUp);
        Task<bool> Delete(string userID);
        Task<bool> ChangePassword(ChangePasswordModel model);
    }
}
