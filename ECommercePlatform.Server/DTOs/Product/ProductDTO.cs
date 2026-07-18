namespace ECommercePlatform.Server.DTOs.Product
{
    public class ProductDTO
    {
        public int? ID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int CategoryID { get; set; }
        public int? SubCategoryID { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public int? StockQuantity { get; set; }
        public List<ProductImageDTO> Images { get; set; } = [];
    }
}
