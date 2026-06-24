using ECommercePlatform.Server.Data;
using ECommercePlatform.Server.Services.Base.Crud;

namespace ECommercePlatform.Server.Services.Main.Product
{
    public class ProductService : CrudService<Entities.Main.Product>, IProductService
    {
        private readonly ApplicationDBContext _context;

        public ProductService(ApplicationDBContext context) : base(context)
        {
            _context = context;
        }
    }
}
