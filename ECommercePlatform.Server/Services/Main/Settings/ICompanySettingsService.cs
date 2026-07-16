using ECommercePlatform.Server.DTOs.Settings;

namespace ECommercePlatform.Server.Services.Main.Settings
{
    public interface ICompanySettingsService
    {
        Task<CompanySettingsDTO> Get();
        Task<int> Save(CompanySettingsDTO model);
    }
}
