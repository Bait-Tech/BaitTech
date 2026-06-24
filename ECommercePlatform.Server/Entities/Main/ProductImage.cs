using System.ComponentModel.DataAnnotations.Schema;

namespace ECommercePlatform.Server.Entities.Main
{
    public class ProductImage
    {
        public int ID { get; set; }
        public int? ProductID { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsMain { get; set; }

        [ForeignKey("ProductID")]
        public Product? Product { get; set; }
    }
}
