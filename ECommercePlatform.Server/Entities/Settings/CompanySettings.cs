using ECommercePlatform.Server.Entities.Base;

namespace ECommercePlatform.Server.Entities.Settings
{
    public class CompanySettings : CrudBase
    {
        public string CompanyName { get; set; } = "";
        public string? LogoUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? SnapchatUrl { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
