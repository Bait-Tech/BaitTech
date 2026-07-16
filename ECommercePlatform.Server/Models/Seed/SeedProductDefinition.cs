namespace ECommercePlatform.Server.Models.Seed
{
    public class SeedProductDefinition
    {
        public string Code { get; set; } = string.Empty;
        public string EnglishName { get; set; } = string.Empty;
        public string ArabicName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? Discount1Price { get; set; }
        public int StockQuantity { get; set; }
        public string SubCategoryEnglishName { get; set; } = string.Empty;
    }
}
