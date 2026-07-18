namespace ECommercePlatform.Server.Entities.HomeSections
{
    public class HeroSection : BaseSection
    {
        public ICollection<HeroImage> Images { get; set; } = [];
    }
}
