using ECommercePlatform.Server.Controllers.BaseControllers;
using ECommercePlatform.Server.Services.Main.Category;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.Main
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : BaseCrudController<Entities.Main.Category>
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService) : base(categoryService)
        {
            _categoryService = categoryService;
        }
    }
}
