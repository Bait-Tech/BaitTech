using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.Services.Base.Crud;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Services.Main.Category
{
    public class CategoryService : CrudService<Entities.Main.Category>, ICategoryService
    {
        private readonly ApplicationDBContext _context;
        public CategoryService(ApplicationDBContext context) : base(context)
        {
            _context = context;
        }
    }
}
