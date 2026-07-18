using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.DTOs.Category;
using ECommercePlatform.Server.Entities.Main;
using ECommercePlatform.Server.Helpers.ImageHelper;
using ECommercePlatform.Server.Services.Base.Crud;
using Microsoft.EntityFrameworkCore;
using static System.Net.Mime.MediaTypeNames;

namespace ECommercePlatform.Server.Services.Main.Category
{
    public class CategoryService : CrudService<Entities.Main.Category>, ICategoryService
    {
        private readonly ApplicationDBContext _context;
        private readonly ImageHelperService _imageHelper;

        public CategoryService(ApplicationDBContext context, ImageHelperService imageHelper) : base(context)
        {
            _context = context;
            _imageHelper = imageHelper;
        }
        public async Task<List<CategoryDTO>> GetAllCategories()
        {
            return await _context.Categories
                .Select(c => new CategoryDTO
                {
                    ID = c.ID,
                    ImageUrl = c.ImageUrl,
                    Name = c.EnglishName
                })
                .ToListAsync();
        }

        public async Task<int> InsertAsync(CategoryDTO categoryDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var category = new Entities.Main.Category
                {
                    EnglishName = categoryDto.Name,
                    ArabicName = categoryDto.Name
                };



                category.ImageUrl = await ResolveImageUrlAsync(categoryDto.ImageFile, categoryDto.ImageUrl, "categories");

                await _context.Categories.AddAsync(category);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();


                return category.ID;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> UpdateAsync(CategoryDTO categoryDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var category = await _context.Categories.FindAsync(categoryDto.ID);

                if (category == null)
                {
                    return false;
                }

                category.EnglishName = categoryDto.Name;

                if (categoryDto.ImageFile != null || !string.IsNullOrWhiteSpace(categoryDto.ImageUrl))
                {
                    if (categoryDto.ImageFile != null && !string.IsNullOrEmpty(category.ImageUrl))
                    {
                        await _imageHelper.DeleteImage(category.ImageUrl);
                    }
                    category.ImageUrl = await ResolveImageUrlAsync(categoryDto.ImageFile, categoryDto.ImageUrl, "categories");
                }

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
        public async Task<bool> DeleteListAsync(List<int> categoriesIDs)
        {
            var categories = await _context
                .Categories
                .Where(c => categoriesIDs.Contains(c.ID))
            .ToListAsync();

            foreach (var category in categories)
            {
                if (!string.IsNullOrEmpty(category.ImageUrl))
                {
                    await _imageHelper.DeleteImage(category.ImageUrl);
                }
            }

            _context.RemoveRange(categories);

            return await _context.SaveChangesAsync() > 0;
        }

        private async Task<string?> ResolveImageUrlAsync(IFormFile? imageFile, string? imageUrl, string folderName)
        {
            if (imageFile != null)
            {
                return await _imageHelper.AddImage(imageFile, folderName);
            }

            if (!string.IsNullOrWhiteSpace(imageUrl))
            {
                return imageUrl.Trim();
            }

            return null;
        }
    }
}
