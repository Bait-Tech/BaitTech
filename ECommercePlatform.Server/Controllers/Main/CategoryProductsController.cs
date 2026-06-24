using ECommercePlatform.Server.Services.Main.CategoryProducts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.Main
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryProductsController : ControllerBase
    {
        private readonly ICategoryProductsService _categoryProductsService;

        public CategoryProductsController(ICategoryProductsService categoryProductsService)
        {
            _categoryProductsService = categoryProductsService;
        }


        [HttpGet("Products")]
        public async Task<IActionResult> GetProducts([FromQuery] int? categoryID, [FromQuery] int? subCategoryID)
        {
            if (categoryID.HasValue)
            {
                var result = await _categoryProductsService.GetProductsByCategoryID(categoryID.Value);
                return Ok(result);
            }

            if (subCategoryID.HasValue)
            {
                var result = await _categoryProductsService.GetProductsBySubCategoryID(subCategoryID.Value);
                return Ok(result);
            }

            return BadRequest();
        }
    }
}
