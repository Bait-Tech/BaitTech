using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.HomePageSections;
using ECommercePlatform.Server.Entities.HomeSections;
using ECommercePlatform.Server.Services.Cashe;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.HomePageCustomize.BackgroundVideo
{
    public class BackgroundVideoSectionService : IBackgroundVideoSectionService
    {
        private const string CacheKey = "BackgroundVideoSection";
        private readonly ApplicationDBContext _DBContext;
        private readonly ICasheService _casheService;

        public BackgroundVideoSectionService(ApplicationDBContext dBContext, ICasheService casheService)
        {
            _DBContext = dBContext;
            _casheService = casheService;
        }

        public async Task<BackgroundVideoSectionDTO> Get()
        {
            var cachedData = _casheService.GetData<BackgroundVideoSectionDTO>(CacheKey);

            if (cachedData != null)
            {
                return cachedData;
            }

            var section = await GetCurrentSection();

            if (section == null)
            {
                return new BackgroundVideoSectionDTO();
            }

            var result = MapToDTO(section);
            var expiryTime = DateTimeOffset.Now.AddSeconds(30);
            _casheService.SetData(CacheKey, result, expiryTime);

            return result;
        }

        public async Task<int> Save(BackgroundVideoSectionDTO model)
        {
            var section = await GetCurrentSection();

            if (section == null)
            {
                return await InsertSection(model);
            }

            return await UpdateSection(section, model);
        }

        private async Task<BackgroundVideoSection?> GetCurrentSection()
        {
            return await _DBContext.BackgroundVideoSections.FirstOrDefaultAsync();
        }

        private async Task<int> InsertSection(BackgroundVideoSectionDTO model)
        {
            var section = new BackgroundVideoSection
            {
                VideoUrl = NormalizeOptionalText(model.VideoUrl),
                IsActive = model.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _DBContext.BackgroundVideoSections.AddAsync(section);
            await _DBContext.SaveChangesAsync();
            ClearCache();

            return section.ID;
        }

        private async Task<int> UpdateSection(BackgroundVideoSection section, BackgroundVideoSectionDTO model)
        {
            section.VideoUrl = NormalizeOptionalText(model.VideoUrl);
            section.IsActive = model.IsActive;
            section.UpdatedAt = DateTime.UtcNow;

            await _DBContext.SaveChangesAsync();
            ClearCache();

            return section.ID;
        }

        private static BackgroundVideoSectionDTO MapToDTO(BackgroundVideoSection section)
        {
            return new BackgroundVideoSectionDTO
            {
                ID = section.ID,
                VideoUrl = section.VideoUrl,
                IsActive = section.IsActive
            };
        }

        private static string NormalizeOptionalText(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            return value.Trim();
        }

        private void ClearCache()
        {
            _casheService.RemoveData(CacheKey);
        }
    }
}
