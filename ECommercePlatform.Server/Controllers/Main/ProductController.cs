using ECommercePlatform.Server.Controllers.BaseControllers;
using ECommercePlatform.Server.Services.Main.Product;
using Microsoft.AspNetCore.Mvc;

namespace ECommercePlatform.Server.Controllers.Main
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : BaseCrudController<Entities.Main.Product>
    {
        private readonly IProductService _productSerivce;

        public ProductController(IProductService productService) : base(productService)
        {
            _productSerivce = productService;
        }
    }
}
