using ECommercePlatform.Server.Services.Identity;
using ECommercePlatform.Server.Services.Main.Admin;
using ECommercePlatform.Server.Services.Main.Product;

namespace ECommercePlatform.Server.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddCrudServices(this IServiceCollection services)
        {
            // Register all CRUD services for entities here
            // services.AddScoped(typeof(ICrudService<>), typeof(CrudService<>));

            // specific services to register

            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<IAdminService, AdminService>();
        }
    }
}
