using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.Settings;
using ECommercePlatform.Server.Entities.Settings;
using ECommercePlatform.Server.Helpers.ImageHelper;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.Main.Settings
{
    public class CompanySettingsService : ICompanySettingsService
    {
        private readonly ApplicationDBContext _DBContext;
        private readonly ImageHelperService _imageHelper;

        public CompanySettingsService(ApplicationDBContext dBContext, ImageHelperService imageHelper)
        {
            _DBContext = dBContext;
            _imageHelper = imageHelper;
        }

        public async Task<CompanySettingsDTO> Get()
        {
            var settings = await GetCurrentSettings();

            if (settings == null)
            {
                return new CompanySettingsDTO();
            }

            return MapToDTO(settings);
        }

        public async Task<int> Save(CompanySettingsDTO model)
        {
            var settings = await GetCurrentSettings();

            if (settings == null)
            {
                return await InsertSettings(model);
            }

            return await UpdateSettings(settings, model);
        }

        private async Task<CompanySettings?> GetCurrentSettings()
        {
            return await _DBContext.CompanySettings.FirstOrDefaultAsync();
        }

        private async Task<int> InsertSettings(CompanySettingsDTO model)
        {
            var logoUrl = await ResolveLogoUrl(model, null);

            var settings = new CompanySettings
            {
                CompanyName = model.CompanyName,
                LogoUrl = logoUrl,
                FacebookUrl = NormalizeOptionalText(model.FacebookUrl),
                InstagramUrl = NormalizeOptionalText(model.InstagramUrl),
                SnapchatUrl = NormalizeOptionalText(model.SnapchatUrl),
                PhoneNumber = NormalizeOptionalText(model.PhoneNumber),
                CreatedAt = DateTime.UtcNow
            };

            await _DBContext.CompanySettings.AddAsync(settings);
            await _DBContext.SaveChangesAsync();

            return settings.ID;
        }

        private async Task<int> UpdateSettings(CompanySettings settings, CompanySettingsDTO model)
        {
            settings.CompanyName = model.CompanyName;
            settings.LogoUrl = await ResolveLogoUrl(model, settings.LogoUrl);
            settings.FacebookUrl = NormalizeOptionalText(model.FacebookUrl);
            settings.InstagramUrl = NormalizeOptionalText(model.InstagramUrl);
            settings.SnapchatUrl = NormalizeOptionalText(model.SnapchatUrl);
            settings.PhoneNumber = NormalizeOptionalText(model.PhoneNumber);
            settings.UpdatedAt = DateTime.UtcNow;

            await _DBContext.SaveChangesAsync();

            return settings.ID;
        }

        private async Task<string?> ResolveLogoUrl(CompanySettingsDTO model, string? currentLogoUrl)
        {
            if (model.LogoFile == null)
            {
                return currentLogoUrl;
            }

            await RemoveExistingLogo(currentLogoUrl);

            return await _imageHelper.AddImage(model.LogoFile, "companySettings");
        }

        private async Task RemoveExistingLogo(string? currentLogoUrl)
        {
            if (string.IsNullOrWhiteSpace(currentLogoUrl))
            {
                return;
            }

            await _imageHelper.DeleteImage(currentLogoUrl);
        }

        private static string? NormalizeOptionalText(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return value.Trim();
        }

        private static CompanySettingsDTO MapToDTO(CompanySettings settings)
        {
            return new CompanySettingsDTO
            {
                ID = settings.ID,
                CompanyName = settings.CompanyName,
                LogoUrl = settings.LogoUrl,
                FacebookUrl = settings.FacebookUrl,
                InstagramUrl = settings.InstagramUrl,
                SnapchatUrl = settings.SnapchatUrl,
                PhoneNumber = settings.PhoneNumber
            };
        }
    }
}
