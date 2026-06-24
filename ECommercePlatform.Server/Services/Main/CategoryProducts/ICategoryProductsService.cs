using ECommercePlatform.Server.Models.Product;

namespace ECommercePlatform.Server.Services.Main.CategoryProducts
{
    public interface ICategoryProductsService
    {
        Task<List<ProductModel>> GetProductsByCategoryID(int categoryID);
        Task<List<ProductModel>> GetProductsBySubCategoryID(int subCategoryID);
    }
}
