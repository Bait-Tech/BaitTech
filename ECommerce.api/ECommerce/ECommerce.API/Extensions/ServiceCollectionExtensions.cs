

using ECommerce.Services.Services.BaseServices.CrudServices;

namespace ECommerce.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddMyAppServices(this IServiceCollection services)
        {
            services.AddScoped(typeof(ICrudService<>), typeof(CrudService<>));

            return services;
        }
    }
}
