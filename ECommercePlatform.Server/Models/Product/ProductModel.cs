namespace ECommercePlatform.Server.Models.Product
{
    public class ProductModel
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Category {  get; set; } = string.Empty;
        public string SubCategory {  get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? Discount1Price { get; set; }
        public int StockQuantity { get; set; }
        public List<string>? Images {  get; set; }
    }
}
