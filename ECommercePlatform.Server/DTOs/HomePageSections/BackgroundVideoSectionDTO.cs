namespace ECommercePlatform.Server.DTOs.HomePageSections
{
    public class BackgroundVideoSectionDTO
    {
        public int ID { get; set; }
        public string VideoUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
