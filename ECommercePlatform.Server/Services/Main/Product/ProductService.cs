using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.Product;
using ECommercePlatform.Server.Entities.Main;
using ECommercePlatform.Server.Extensions.pagination;
using ECommercePlatform.Server.Helpers.ImageHelper;
using ECommercePlatform.Server.Services.Base.Crud;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.Main.Product
{
    public class ProductService : CrudService<Entities.Main.Product>, IProductService
    {
        private readonly ApplicationDBContext _context;
        private readonly ImageHelperService _imageHelper;

        public ProductService(ApplicationDBContext context, ImageHelperService imageHelper) : base(context)
        {
            _context = context;
            _imageHelper = imageHelper;
        }

        public async Task<List<ProductDTO>> GetAllProductsAsync()
        {
            return await _context
                .Products
                .Include(p => p.ProductImages)
                .Select(p => new ProductDTO
                {
                    ID = p.ID,
                    Price = p.Price,
                    CategoryID = p.CategoryID.Value,
                    Description = p.Description,
                    Code = p.Code,
                    SubCategoryID = p.SubCategoryID.Value,
                    StockQuantity = p.StockQuantity,
                    DiscountPrice = p.Discount1Price,
                    Name = p.EnglishName,
                    Images = p.ProductImages.Select(pi => new ProductImageDTO
                    {
                        ID = pi.ID,
                        IsMain = pi.IsMain,
                        ImageUrl = pi.ImageUrl,
                    }).ToList()
                }).ToListAsync();
        }
        public async Task<ProductDTO> GetByID(int id)
        {
            var product = await _context.Products
                 .Where(p => p.ID == id)
                 .Include(p => p.ProductImages)
                 .Select(p => new ProductDTO
                 {
                     ID = p.ID,
                     Price = p.Price,
                     CategoryID = p.CategoryID.Value,
                     Description = p.Description,
                     Code = p.Code,
                     SubCategoryID = p.SubCategoryID.Value,
                     StockQuantity = p.StockQuantity,
                     DiscountPrice = p.Discount1Price,
                     Name = p.EnglishName,
                     Images = p.ProductImages.Select(pi => new ProductImageDTO
                     {
                         ID = pi.ID,
                         IsMain = pi.IsMain,
                         ImageUrl = pi.ImageUrl,
                     }).ToList()
                 }).FirstOrDefaultAsync();

            if (product is null)
            {
                return new ProductDTO();
            }

            return product;
        }
        public async Task<PaginatedResult<ProductDTO>> GetPaginatedResultAsync(PaginationParams paginationParams)
        {
            var query = _context.Products
                       .AsNoTracking()
                       .Include(p => p.ProductImages)
                       .Select(p => new ProductDTO
                       {
                           ID = p.ID,
                           Price = p.Price,
                           CategoryID = p.CategoryID ?? 0,
                           Description = p.Description ?? "",
                           Code = p.Code ?? "",
                           SubCategoryID = p.SubCategoryID ?? 0,
                           StockQuantity = p.StockQuantity,
                           DiscountPrice = p.Discount1Price,
                           Name = p.EnglishName ?? "",
                           Images = p.ProductImages.Select(pi => new ProductImageDTO
                           {
                               ID = pi.ID,
                               IsMain = pi.IsMain,
                               ImageUrl = pi.ImageUrl,
                           }).ToList()
                       });

            return await query.ToPaginatedListAsync(paginationParams);
        }
        public async Task<List<ProductDTO>> GetProductsByCategory(int categoryID, int? subCategoryID)
        {
            if (subCategoryID is not null)
            {
                return await _context.Products
                      .Where(p => p.CategoryID == categoryID && p.SubCategoryID == subCategoryID)
                      .AsNoTracking()
                      .Include(p => p.ProductImages)
                      .Select(p => new ProductDTO
                      {
                          ID = p.ID,
                          Price = p.Price,
                          CategoryID = p.CategoryID.Value,
                          Description = p.Description ?? "",
                          Code = p.Code,
                          SubCategoryID = p.SubCategoryID.Value,
                          StockQuantity = p.StockQuantity,
                          DiscountPrice = p.Discount1Price,
                          Name = p.EnglishName ?? "Empty",
                          Images = p.ProductImages.Select(pi => new ProductImageDTO
                          {
                              ID = pi.ID,
                              IsMain = pi.IsMain,
                              ImageUrl = pi.ImageUrl,
                          }).ToList()
                      })
                      .ToListAsync();
            }

            return await _context.Products
                             .Where(p => p.CategoryID == categoryID)
                             .AsNoTracking()
                             .Include(p => p.ProductImages)
                             .Select(p => new ProductDTO
                             {
                                 ID = p.ID,
                                 Price = p.Price,
                                 CategoryID = p.CategoryID.Value,
                                 Description = p.Description ?? "",
                                 Code = p.Code,
                                 SubCategoryID = p.SubCategoryID.Value,
                                 StockQuantity = p.StockQuantity,
                                 DiscountPrice = p.Discount1Price,
                                 Name = p.EnglishName ?? "Empty",
                                 Images = p.ProductImages.Select(pi => new ProductImageDTO
                                 {
                                     ID = pi.ID,
                                     IsMain = pi.IsMain,
                                     ImageUrl = pi.ImageUrl,
                                 }).ToList()
                             })
                             .ToListAsync();
        }
        public async Task<PaginatedResult<ProductDTO>> FilterProducts(FilterProductsDTO filterProductsDTO)
        {
            var query = _context.Products.AsQueryable();

            if (filterProductsDTO?.CategoryID != null && filterProductsDTO.CategoryID != 0)
                query = query.Where(p => p.CategoryID == filterProductsDTO.CategoryID);

            if (filterProductsDTO?.SubCategoryID != null && filterProductsDTO?.SubCategoryID !=0)
                query = query.Where(p => p.SubCategoryID == filterProductsDTO.SubCategoryID);

            if (!string.IsNullOrWhiteSpace(filterProductsDTO?.Name))
                query = query.Where(p => p.EnglishName!.Contains(filterProductsDTO.Name));

            var projectedQuery = query
                .Include(p => p.ProductImages)
                .Select(p => new ProductDTO
                {
                    ID = p.ID,
                    Price = p.Price,
                    CategoryID = p.CategoryID ?? 0,
                    Description = p.Description ?? "",
                    Code = p.Code ?? "",
                    SubCategoryID = p.SubCategoryID ?? 0,
                    StockQuantity = p.StockQuantity,
                    DiscountPrice = p.Discount1Price,
                    Name = p.EnglishName ?? "",
                    Images = p.ProductImages.Select(pi => new ProductImageDTO
                    {
                        ID = pi.ID,
                        IsMain = pi.IsMain,
                        ImageUrl = pi.ImageUrl ?? "",
                    }).ToList()
                });

            return await projectedQuery.ToPaginatedListAsync(filterProductsDTO.PaginationParams);
        }
        public async Task<int> InsertAsync(ProductDTO productDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var product = new Entities.Main.Product
                {
                    Code = productDto.Code,
                    EnglishName = productDto.Name,
                    Description = productDto.Description,
                    Price = productDto.Price,
                    Discount1Price = productDto.DiscountPrice,
                    StockQuantity = productDto.StockQuantity,
                    IsActive = true,
                    CategoryID = productDto.CategoryID,
                    SubCategoryID = productDto.SubCategoryID,
                    ProductImages = []
                };

                await _context.Products.AddAsync(product);
                await _context.SaveChangesAsync();

                if (productDto.Images != null && productDto.Images.Count != 0)
                {
                    for (int i = 0; i < productDto.Images.Count; i++)
                    {
                        var imageDto = productDto.Images[i];
                        string imagePath = await _imageHelper.AddImage(imageDto.ImageFile, "products");
                        var productImage = new ProductImage
                        {
                            ProductID = product.ID,
                            ImageUrl = imagePath,
                            IsMain = imageDto.IsMain || (i == 0 && !productDto.Images.Any(img => img.IsMain))
                        };
                        product.ProductImages.Add(productImage);
                    }
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return product.ID;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> UpdateAsync(ProductDTO productDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstOrDefaultAsync(p => p.ID == productDto.ID);

                if (product == null)
                {
                    return false;
                }

                product.Code = productDto.Code;
                product.EnglishName = productDto.Name;
                product.ArabicName = productDto.Name;
                product.Description = productDto.Description;
                product.Price = productDto.Price;
                product.Discount1Price = productDto.DiscountPrice;
                product.StockQuantity = productDto.StockQuantity;
                product.CategoryID = productDto.CategoryID;
                product.SubCategoryID = productDto.SubCategoryID;

                foreach (var imageDto in productDto.Images)
                {
                    if (imageDto.ID.HasValue)
                    {
                        var existingImage = product.ProductImages!.FirstOrDefault(pi => pi.ID == imageDto.ID);
                        if (existingImage != null)
                        {
                            if (imageDto.IsDeleted)
                            {
                                await _imageHelper.DeleteImage(existingImage.ImageUrl!);
                                product.ProductImages!.Remove(existingImage);
                            }
                            else
                            {
                                existingImage.IsMain = imageDto.IsMain;
                            }
                        }
                    }
                    else if (imageDto.ImageFile != null)
                    {
                        string imagePath = await _imageHelper.AddImage(imageDto.ImageFile, "products");
                        var newImage = new ProductImage
                        {
                            ProductID = product.ID,
                            ImageUrl = imagePath,
                            IsMain = imageDto.IsMain
                        };
                        product.ProductImages!.Add(newImage);
                    }
                }

                if (!product.ProductImages!.Any(pi => pi.IsMain))
                {
                    var firstImage = product.ProductImages!.FirstOrDefault();
                    if (firstImage != null)
                    {
                        firstImage.IsMain = true;
                    }
                }
                _context.Update(product);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }
        public async Task<bool> DeleteProductAsync(int productId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var product = await _context.Products
                    .Include(p => p.ProductImages)
                    .FirstOrDefaultAsync(p => p.ID == productId);

                if (product == null)
                {
                    return false;
                }

                await RemoveProductImagesAsync(product.ProductImages);
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> DeleteListAsync(List<int> productIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var products = await _context
                    .Products
                    .Include(p => p.ProductImages)
                    .Where(c => productIds.Contains(c.ID))
                    .ToListAsync();

                foreach (var product in products)
                {
                    await RemoveProductImagesAsync(product.ProductImages);
                }

                _context.RemoveRange(products);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

        }

        private async Task RemoveProductImagesAsync(ICollection<ProductImage>? images)
        {
            if (images == null || images.Count == 0)
            {
                return;
            }

            foreach (var image in images)
            {
                if (!string.IsNullOrEmpty(image.ImageUrl))
                {
                    await _imageHelper.DeleteImage(image.ImageUrl);
                }
            }

            _context.ProductImages.RemoveRange(images);
        }
    }
}
