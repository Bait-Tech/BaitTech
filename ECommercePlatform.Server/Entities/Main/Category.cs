using ECommercePlatform.Server.Entities.Base;

namespace ECommercePlatform.Server.Entities.Main
{
    public class Category : CrudBase
    {
        public required string ArabicName { get; set; }
        public string? EnlgishName {  get; set; }
        public string? ImageUrl { get; set; }
        public ICollection<Product>? Products { get; set; }
        public ICollection<SubCategory>? SubCategories { get; set; }
    }
}
