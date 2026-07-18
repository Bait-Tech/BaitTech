namespace ECommercePlatform.Server.DTOs.HomePageSections
{
    public class HeroSectionImageDTO
    {
        public int ID { get; set; }
        public bool IsMain { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? LinkUrl { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
