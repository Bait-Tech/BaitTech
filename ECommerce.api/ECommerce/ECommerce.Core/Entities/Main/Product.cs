using ECommerce.Core.Entities.Base;

namespace ECommerce.Core.Entities.Main
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

        public int? CategoryId { get; set; }
        public int? SubCategoryId { get; set; }


    }
}
