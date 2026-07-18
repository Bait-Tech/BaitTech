using System.ComponentModel.DataAnnotations.Schema;

namespace ECommercePlatform.Server.Entities.HomeSections
{
    public class HeroImage
    {
        public int ID { get; set; }
        public int HeroSectionID { get; set; }

        [ForeignKey("HeroSectionID")]
        public HeroSection? HeroSection { get; set; }

        public bool IsMain { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string VideoUrl { get; set; } = string.Empty;
        public string LinkUrl { get; set; } = string.Empty;
    }
}