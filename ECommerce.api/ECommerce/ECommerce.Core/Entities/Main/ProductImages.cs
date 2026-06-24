using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.Core.Entities.Main
{
    public class ProductImages
    {

        public int Id { get; set; }
        public int? ProductId { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsMain { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
