using ECommercePlatform.Server.Services.Base.Crud;

namespace ECommercePlatform.Server.Services.Main.SubCategory
{
    public interface ISubCategoryService : ICrudService<Entities.Main.SubCategory>
    {
        Task<List<Entities.Main.SubCategory>> GetByCategoryId(int categoryID);
    }
}
