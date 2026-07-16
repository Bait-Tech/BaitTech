using ECommercePlatform.Server.Helpers.ImageHelper;
using ECommercePlatform.Server.Services.Cashe;
using StackExchange.Redis;
using ECommercePlatform.Server.Services.HomePageCustomize.Hero;
using ECommercePlatform.Server.Services.HomePageCustomize.Products;
using ECommercePlatform.Server.Services.Identity;
using ECommercePlatform.Server.Services.Main.Admin;
using ECommercePlatform.Server.Services.Main.Category;
using ECommercePlatform.Server.Services.Main.CategoryProducts;
using ECommercePlatform.Server.Services.Main.Product;
using ECommercePlatform.Server.Services.Main.Settings;
using ECommercePlatform.Server.Services.Main.SubCategory;
using ECommercePlatform.Server.Services.Dashboard;
using ECommercePlatform.Server.Services.Orders;

namespace ECommercePlatform.Server.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddCrudServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register all CRUD services for entities here
            // services.AddScoped(typeof(ICrudService<>), typeof(CrudService<>));

            // specific services to register
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICategoryProductsService, CategoryProductsService>();
            services.AddScoped<ISubCategoryService, SubCategoryService>();
            services.AddScoped<ImageHelperService>();
            services.AddScoped<IHeroSectionService, HeroSectionService>();
            services.AddScoped<IProductsSectionService, ProductsSectionService>();
            RegisterCacheService(services, configuration);
            services.AddScoped<IOrdersService, OrdersService>();
            services.AddScoped<ICompanySettingsService, CompanySettingsService>();
            services.AddScoped<IDashboardService, DashboardService>();
        }

        private static void RegisterCacheService(IServiceCollection services, IConfiguration configuration)
        {
            var useMemoryCache = configuration.GetValue<bool>("Cache:UseMemoryCache");

            if (useMemoryCache)
            {
                services.AddMemoryCache();
                services.AddScoped<ICasheService, MemoryCasheService>();
                return;
            }

            var redisConnection = configuration.GetConnectionString("Redis") ?? "localhost:6379,abortConnect=false";
            services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));
            services.AddScoped<ICasheService, CasheService>();
        }
    }
}