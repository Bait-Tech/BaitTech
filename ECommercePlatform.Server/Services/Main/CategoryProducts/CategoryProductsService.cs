using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.Models.Product;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.Main.CategoryProducts
{
    public class CategoryProductsService : ICategoryProductsService
    {
        private readonly ApplicationDBContext _context;
        public CategoryProductsService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<ProductModel>> GetProductsByCategoryID(int categoryID)
        {
            var products = await _context.Products
                .Where(p => p.CategoryID == categoryID)
                .Select(p => new ProductModel
                {
                    Name = p.ArabicName,
                    Description = p.Description,
                    Code = p.Code,
                    Category =p.Category.EnlgishName,
                    SubCategory =p.SubCategory.EnlgishName,
                    Price = p.Price,
                    Discount1Price = p.Discount1Price,
                    StockQuantity = p.StockQuantity,
                    Images = p.ProductImages.Select(pi => pi.ImageUrl).ToList()

                })
                .ToListAsync();

            return products;
        }
        public async Task<List<ProductModel>> GetProductsBySubCategoryID(int subCategoryID)
        {
            var products = await _context.Products
                .Where(p => p.SubCategoryID == subCategoryID)
                .Select(p => new ProductModel
                {
                    Name = p.ArabicName,
                    Description = p.Description,
                    Code = p.Code,
                    //Category =p.Category.Name,
                    //Category =p.Category.Name,
                    Price = p.Price,
                    Discount1Price = p.Discount1Price,
                    StockQuantity = p.StockQuantity,
                    Images = p.ProductImages.Select(pi => pi.ImageUrl).ToList()

                })
                .ToListAsync();

            return products;
        }
    }
}
