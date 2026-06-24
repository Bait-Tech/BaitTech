using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.Services.Base.Crud;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.Main.SubCategory
{
    public class SubCategoryService : CrudService<Entities.Main.SubCategory>, ISubCategoryService
    {
        private readonly ApplicationDBContext _context;

        public SubCategoryService(ApplicationDBContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Entities.Main.SubCategory>> GetByCategoryId(int categoryID)
        {
            return await _context.SubCategories
                .Where(sc => sc.CategoryID == categoryID)
                .ToListAsync();
        }

    }
}
