using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.HomePageSections;
using ECommercePlatform.Server.DTOs.Product;
using ECommercePlatform.Server.Entities.HomeSections;
using ECommercePlatform.Server.Entities.Main;
using ECommercePlatform.Server.Helpers.ImageHelper;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.HomePageCustomize.Products
{
    public class ProductsSectionService : IProductsSectionService
    {
        private readonly ApplicationDBContext _DBContext;
        private readonly ImageHelperService _imageHelper;

        public ProductsSectionService(ApplicationDBContext dBContext, ImageHelperService imageHelper)
        {
            _DBContext = dBContext;
            _imageHelper = imageHelper;
        }

        public async Task<List<ProductSectionDTO>> GetAll()
        {
            var section = await _DBContext.ProductSections
                .OrderBy(ps => ps.DisplayOrder)
                .Include(ps => ps.SectionProducts)
                .ThenInclude(ps => ps.Product)
                .ThenInclude(ps => ps.ProductImages)
                .ToListAsync();


            return section.Select(s => new ProductSectionDTO
            {
                ID = s.ID,
                BadgeColor = s.BadgeColor,
                BadgeText = s.BadgeText,
                Title = s.Title,
                DisplayOrder = s.DisplayOrder,
                CategoryID = s.CategoryID,
                SubCategoryID = s.SubCategoryID,
                Products = s.SectionProducts?.Select(sp => new ProductDTO
                {
                    ID = sp.ProductID,
                    Name = sp.Product.EnglishName,
                    Description = sp.Product.Description,
                    Price = sp.Product.Price,
                    DiscountPrice = sp.Product.Discount1Price,
                    StockQuantity = sp.Product.StockQuantity,
                    Images = MapCardImages(sp.Product.ProductImages)
                }).ToList() ?? []
            }).ToList();

        }

        public async Task<int> Insert(ProductSectionDTO model)
        {
            if (model.Products.Count == 0)
            {
                return 0;
            }

            var maxDisplayOrder = await _DBContext.ProductSections
                 .MaxAsync(ps => (int?)ps.DisplayOrder) ?? 0;

            var productSection = new ProductSection
            {
                Title = model.Title,
                BadgeText = model.BadgeText,
                DisplayOrder = maxDisplayOrder + 1 ,
                BadgeColor = model.BadgeColor,
                CategoryID = model.CategoryID,
                SubCategoryID = model.SubCategoryID
            };

            await _DBContext.AddAsync(productSection);

            await _DBContext.SaveChangesAsync();

            var sectionProducts = model.Products.Select(p => new SectionProducts
            {
                ProductID = p.ID.Value,
                SectionID = productSection.ID
            })
            .ToList();

            await _DBContext.AddRangeAsync(sectionProducts);

            await _DBContext.SaveChangesAsync();

            return productSection.ID;
        }

        public async Task<int> Update(ProductSectionDTO model)
        {
            var section = _DBContext.Find<ProductSection>(model.ID);

            if (section == null)
            {
                return 0;
            }

            var productSection = await _DBContext.SectionProducts
                .Where(sp => sp.SectionID == section.ID)
                .ToListAsync();


            _DBContext.RemoveRange(productSection);

            await _DBContext.SaveChangesAsync();

            section.Title = model.Title;
            section.BadgeText = model.BadgeText;
            section.BadgeColor = model.BadgeColor;
            section.DisplayOrder = model.DisplayOrder;
            section.BadgeColor = model.BadgeColor;
            section.CategoryID = model.CategoryID;
            section.SubCategoryID = model.SubCategoryID;

            _DBContext.Update(section);

            var newSectionProducts = model.Products.Select(p => new SectionProducts
            {
                ProductID = p.ID.Value,
                SectionID = section.ID
            })
             .ToList();

            await _DBContext.AddRangeAsync(newSectionProducts);

            await _DBContext.SaveChangesAsync();

            return section.ID;
        }

        public async Task<bool> Delete(int sectionID)
        {
            var sectionProducsts = await _DBContext.SectionProducts
                .Where(sp => sp.SectionID == sectionID)
                .ToListAsync();

            _DBContext.RemoveRange(sectionProducsts);

            var section = _DBContext.Find<ProductSection>(sectionID);

            if (section == null)
            {
                return false;
            }

            _DBContext.Remove(section);

            return await _DBContext.SaveChangesAsync() > 0;
        }

        private static List<ProductImageDTO> MapCardImages(ICollection<ProductImage>? productImages)
        {
            if (productImages == null || productImages.Count == 0)
            {
                return [];
            }

            var mainImage = ResolveMainImage(productImages);
            var hoverImage = ResolveHoverImage(productImages, mainImage);
            var images = new List<ProductImageDTO>();

            if (mainImage != null)
            {
                images.Add(new ProductImageDTO
                {
                    ID = mainImage.ID,
                    ImageUrl = mainImage.ImageUrl,
                    IsMain = true,
                });
            }

            if (hoverImage != null)
            {
                images.Add(new ProductImageDTO
                {
                    ID = hoverImage.ID,
                    ImageUrl = hoverImage.ImageUrl,
                    IsMain = false,
                });
            }

            return images;
        }

        private static ProductImage? ResolveMainImage(ICollection<ProductImage> productImages)
        {
            ProductImage? fallback = null;

            foreach (var image in productImages)
            {
                if (fallback == null)
                {
                    fallback = image;
                }

                if (image.IsMain)
                {
                    return image;
                }
            }

            return fallback;
        }

        private static ProductImage? ResolveHoverImage(
            ICollection<ProductImage> productImages,
            ProductImage? mainImage)
        {
            if (mainImage == null)
            {
                return null;
            }

            foreach (var image in productImages)
            {
                if (image.ID != mainImage.ID)
                {
                    return image;
                }
            }

            return null;
        }
    }
}