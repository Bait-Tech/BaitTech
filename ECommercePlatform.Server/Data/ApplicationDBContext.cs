using ECommercePlatform.Server.Entities.HomeSections;
using ECommercePlatform.Server.Entities.Identity;
using ECommercePlatform.Server.Entities.Main;
using ECommercePlatform.Server.Entities.Orders;
using ECommercePlatform.Server.Entities.Settings;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Data
{
    public class ApplicationDBContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> Options) : base(Options)
        {
        }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<HeroSection> HeroSections { get; set; }
        public DbSet<ProductSection> ProductSections { get; set; }
        public DbSet<GalleryImage> GalleryImages { get; set; }
        public DbSet<HeroImage> HeroImages { get; set; }
        public DbSet<ImageGallerySection> ImageGallerySections { get; set; }
        public DbSet<SectionProducts> SectionProducts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<ProductsOrders> ProductsOrders { get; set; }
        public DbSet<CompanySettings> CompanySettings { get; set; }
        public DbSet<BackgroundVideoSection> BackgroundVideoSections { get; set; }
    }
}