namespace ECommercePlatform.Server.DTOs.Settings
{
    public class CompanySettingsDTO
    {
        public int ID { get; set; }
        public string CompanyName { get; set; } = "";
        public string? LogoUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? SnapchatUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public IFormFile? LogoFile { get; set; }
    }
}
