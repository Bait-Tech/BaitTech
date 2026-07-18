using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.HomePageSections;
using ECommercePlatform.Server.Entities.HomeSections;
using ECommercePlatform.Server.Helpers.ImageHelper;
using ECommercePlatform.Server.Services.Cashe;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.HomePageCustomize.Hero
{
    public class HeroSectionService : IHeroSectionService
    {
        private readonly ApplicationDBContext _DBContext;
        private readonly ImageHelperService _imageHelper;
        private readonly ICasheService _casheService;

        public HeroSectionService(ApplicationDBContext dBContext, ImageHelperService imageHelper , ICasheService casheService)
        {
            _DBContext = dBContext;
            _imageHelper = imageHelper;
            _casheService = casheService;
        }

        public async Task<HeroSectionDTO> Get()
        {
            var casheData = _casheService.GetData<HeroSectionDTO>("HeroSection");

            if (casheData != null) {
                return casheData;
            }

            var heroSection = await _DBContext.HeroSections
                .Include(hs => hs.Images)
                .FirstOrDefaultAsync();

            if (heroSection == null)
            {
                return new HeroSectionDTO();
            }

            var result = MapHeroSection(heroSection);

            var expiryTime = DateTimeOffset.Now.AddSeconds(30);
            _casheService.SetData("HeroSection", result, expiryTime);

            return result;
        }

        public async Task<int> Insert(HeroSectionDTO model)
        {
            var heroSection = new HeroSection
            {
                DisplayOrder = model.DisplayOrder ?? 1,
            };

            await _DBContext.AddAsync(heroSection);
            await _DBContext.SaveChangesAsync();

            var sectionImages = await BuildHeroImages(model.HeroSectionImageDTOs, heroSection.ID);

            await _DBContext.AddRangeAsync(sectionImages);
            await _DBContext.SaveChangesAsync();
            ClearHeroSectionCache();

            return heroSection.ID;
        }

        public async Task<int> Update(HeroSectionDTO model)
        {
            var section = await _DBContext.HeroSections
                .Where(hs => hs.ID == model.ID)
                .FirstOrDefaultAsync();

            if (section == null)
            {
                return 0;
            }

            var existSectionImages = await _DBContext.HeroImages
                .Where(hi => hi.HeroSectionID == model.ID)
                .ToListAsync();

            await DeleteLocalHeroImages(existSectionImages);

            _DBContext.RemoveRange(existSectionImages);
            await _DBContext.SaveChangesAsync();

            var updatedImages = await BuildHeroImages(model.HeroSectionImageDTOs, model.ID);

            await _DBContext.AddRangeAsync(updatedImages);
            await _DBContext.SaveChangesAsync();
            ClearHeroSectionCache();

            return section.ID;
        }

        private static HeroSectionDTO MapHeroSection(HeroSection heroSection)
        {
            return new HeroSectionDTO
            {
                ID = heroSection.ID,
                DisplayOrder = heroSection.DisplayOrder,
                HeroSectionImageDTOs = heroSection.Images.Select(MapHeroImage).ToList()
            };
        }

        private static HeroSectionImageDTO MapHeroImage(HeroImage image)
        {
            return new HeroSectionImageDTO
            {
                ID = image.ID,
                ImageUrl = image.ImageUrl,
                VideoUrl = image.VideoUrl,
                IsMain = image.IsMain,
                LinkUrl = image.LinkUrl
            };
        }

        private async Task<List<HeroImage>> BuildHeroImages(List<HeroSectionImageDTO> images, int heroSectionId)
        {
            var sectionImages = new List<HeroImage>();

            foreach (var image in images)
            {
                if (!HasSlideMedia(image))
                {
                    continue;
                }

                var imageUrl = await ResolveImageUrl(image);

                sectionImages.Add(new HeroImage
                {
                    HeroSectionID = heroSectionId,
                    ImageUrl = imageUrl,
                    VideoUrl = NormalizeOptionalText(image.VideoUrl),
                    IsMain = image.IsMain,
                    LinkUrl = NormalizeOptionalText(image.LinkUrl)
                });
            }

            return sectionImages;
        }

        private async Task<string> ResolveImageUrl(HeroSectionImageDTO image)
        {
            if (image.ImageFile != null)
            {
                return await _imageHelper.AddImage(image.ImageFile, "heroSection");
            }

            return NormalizeOptionalText(image.ImageUrl);
        }

        private static bool HasSlideMedia(HeroSectionImageDTO image)
        {
            var hasImage = !string.IsNullOrWhiteSpace(image.ImageUrl) || image.ImageFile != null;
            var hasVideo = !string.IsNullOrWhiteSpace(image.VideoUrl);
            return hasImage || hasVideo;
        }

        private async Task DeleteLocalHeroImages(IEnumerable<HeroImage> images)
        {
            foreach (var image in images)
            {
                if (!IsLocalImageUrl(image.ImageUrl))
                {
                    continue;
                }

                await _imageHelper.DeleteImage(image.ImageUrl);
            }
        }

        private static bool IsLocalImageUrl(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return false;
            }

            return imageUrl.Contains("/images/", StringComparison.OrdinalIgnoreCase);
        }

        private static string NormalizeOptionalText(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            return value.Trim();
        }

        private void ClearHeroSectionCache()
        {
            _casheService.RemoveData("HeroSection");
        }
    }
}
