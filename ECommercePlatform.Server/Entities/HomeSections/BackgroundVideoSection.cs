namespace ECommercePlatform.Server.Entities.HomeSections
{
    public class BackgroundVideoSection
    {
        public int ID { get; set; }
        public string VideoUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
