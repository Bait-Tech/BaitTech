using ECommercePlatform.Server.Entities.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommercePlatform.Server.Entities.Main
{
    public class Product : CrudBase
    {
        public string? Code { get; set; }
        public string? EnglishName { get; set; }
        public string? ArabicName { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? Discount1Price { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }

        public int? CategoryID { get; set; }
        public int? SubCategoryID { get; set; }


        [ForeignKey("CategoryID")]
        public Category? Category { get; set; }

        [ForeignKey("SubCategoryID")]
        public SubCategory? SubCategory { get; set; }

        public ICollection<ProductImage>? ProductImages { get; set; }
    }
}
