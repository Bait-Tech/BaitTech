using ECommercePlatform.Server.DTOs.HomePageSections;

namespace ECommercePlatform.Server.Services.HomePageCustomize.BackgroundVideo
{
    public interface IBackgroundVideoSectionService
    {
        Task<BackgroundVideoSectionDTO> Get();
        Task<int> Save(BackgroundVideoSectionDTO model);
    }
}
