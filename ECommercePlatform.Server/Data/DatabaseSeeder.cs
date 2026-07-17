using ECommercePlatform.Server.Entities.HomeSections;
using ECommercePlatform.Server.Entities.Identity;
using ECommercePlatform.Server.Entities.Main;
using ECommercePlatform.Server.Entities.Orders;
using ECommercePlatform.Server.Enums;
using ECommercePlatform.Server.Models.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECommercePlatform.Server.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<ApplicationDBContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();

            var seedSettings = GetSeedSettings(configuration);

            await SeedRolesAsync(roleManager);
            await SeedAdminUserAsync(userManager, seedSettings);

            if (!await IsCatalogSeededAsync(context))
            {
                await SeedCatalogDataAsync(context);
            }

            await RepairStoredUnsplashImageUrlsAsync(context);
        }

        private static SeedSettings GetSeedSettings(IConfiguration configuration)
        {
            var settings = new SeedSettings();
            configuration.GetSection("Seed").Bind(settings);
            return settings;
        }

        private static async Task<bool> IsCatalogSeededAsync(ApplicationDBContext context)
        {
            return await context.Categories.AnyAsync();
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            await EnsureRoleExistsAsync(roleManager, Roles.Admin.ToString());
            await EnsureRoleExistsAsync(roleManager, Roles.Client.ToString());
        }

        private static async Task EnsureRoleExistsAsync(RoleManager<IdentityRole> roleManager, string roleName)
        {
            if (await roleManager.RoleExistsAsync(roleName))
            {
                return;
            }

            await roleManager.CreateAsync(new IdentityRole(roleName));
        }

        private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager, SeedSettings settings)
        {
            var existingUser = await userManager.FindByEmailAsync(settings.AdminEmail);

            if (existingUser is not null)
            {
                await EnsureAdminRoleAsync(userManager, existingUser);
                return;
            }

            var previousAdmin = await userManager.FindByEmailAsync("admin@baittech.com");

            if (previousAdmin is not null)
            {
                await userManager.SetUserNameAsync(previousAdmin, settings.AdminEmail);
                await userManager.SetEmailAsync(previousAdmin, settings.AdminEmail);
                previousAdmin.FirstName = settings.AdminFirstName;
                previousAdmin.LastName = settings.AdminLastName;
                await userManager.UpdateAsync(previousAdmin);
                await EnsureAdminRoleAsync(userManager, previousAdmin);
                return;
            }

            var user = new ApplicationUser
            {
                UserName = settings.AdminEmail,
                Email = settings.AdminEmail,
                FirstName = settings.AdminFirstName,
                LastName = settings.AdminLastName
            };

            var result = await userManager.CreateAsync(user, settings.AdminPassword);

            if (!result.Succeeded)
            {
                return;
            }

            await EnsureAdminRoleAsync(userManager, user);
        }

        private static async Task EnsureAdminRoleAsync(UserManager<ApplicationUser> userManager, ApplicationUser user)
        {
            if (await userManager.IsInRoleAsync(user, Roles.Admin.ToString()))
            {
                return;
            }

            await userManager.AddToRoleAsync(user, Roles.Admin.ToString());
        }

        private static async Task SeedCatalogDataAsync(ApplicationDBContext context)
        {
            var categories = BuildCategories();
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();

            var categoryIdsByName = BuildCategoryIdsByName(categories);
            var subCategories = BuildSubCategories(categoryIdsByName);
            context.SubCategories.AddRange(subCategories);
            await context.SaveChangesAsync();

            var subCategoryIdsByName = BuildSubCategoryIdsByName(subCategories);
            var products = BuildProducts(categoryIdsByName, subCategoryIdsByName);
            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            var productImages = BuildProductImages(products);
            context.ProductImages.AddRange(productImages);
            await context.SaveChangesAsync();

            await SeedHeroSectionAsync(context);
            await SeedProductSectionsAsync(context, categoryIdsByName, subCategoryIdsByName, products);
            await SeedSampleOrderAsync(context, products);
        }

        private static List<Category> BuildCategories()
        {
            var now = DateTime.UtcNow;
            var categories = new List<Category>();
            var categoryDefinitions = SeedCatalogDefinitions.GetCategories();

            foreach (var definition in categoryDefinitions)
            {
                categories.Add(new Category
                {
                    EnglishName = definition.EnglishName,
                    ArabicName = definition.ArabicName,
                    ImageUrl = SeedImageUrls.GetCategoryImageUrl(definition.EnglishName),
                    CreatedAt = now
                });
            }

            return categories;
        }

        private static Dictionary<string, int> BuildCategoryIdsByName(List<Category> categories)
        {
            var categoryIdsByName = new Dictionary<string, int>();

            foreach (var category in categories)
            {
                if (string.IsNullOrWhiteSpace(category.EnglishName))
                {
                    continue;
                }

                categoryIdsByName[category.EnglishName] = category.ID;
            }

            return categoryIdsByName;
        }

        private static List<SubCategory> BuildSubCategories(Dictionary<string, int> categoryIdsByName)
        {
            var now = DateTime.UtcNow;
            var subCategories = new List<SubCategory>();
            var subCategoryDefinitions = SeedCatalogDefinitions.GetSubCategories();

            foreach (var definition in subCategoryDefinitions)
            {
                if (!categoryIdsByName.TryGetValue(definition.CategoryEnglishName, out var categoryId))
                {
                    continue;
                }

                subCategories.Add(new SubCategory
                {
                    EnglishName = definition.EnglishName,
                    ArabicName = definition.ArabicName,
                    CategoryID = categoryId,
                    ImageUrl = SeedImageUrls.GetSubCategoryImageUrl(definition.EnglishName),
                    CreatedAt = now
                });
            }

            return subCategories;
        }

        private static Dictionary<string, int> BuildSubCategoryIdsByName(List<SubCategory> subCategories)
        {
            var subCategoryIdsByName = new Dictionary<string, int>();

            foreach (var subCategory in subCategories)
            {
                if (string.IsNullOrWhiteSpace(subCategory.EnglishName))
                {
                    continue;
                }

                subCategoryIdsByName[subCategory.EnglishName] = subCategory.ID;
            }

            return subCategoryIdsByName;
        }

        private static List<Product> BuildProducts(
            Dictionary<string, int> categoryIdsByName,
            Dictionary<string, int> subCategoryIdsByName)
        {
            var now = DateTime.UtcNow;
            var products = new List<Product>();
            var productDefinitions = SeedCatalogDefinitions.GetProducts();

            foreach (var definition in productDefinitions)
            {
                if (!subCategoryIdsByName.TryGetValue(definition.SubCategoryEnglishName, out var subCategoryId))
                {
                    continue;
                }

                var categoryId = FindCategoryIdForSubCategory(definition.SubCategoryEnglishName, categoryIdsByName, subCategoryIdsByName);

                products.Add(new Product
                {
                    Code = definition.Code,
                    EnglishName = definition.EnglishName,
                    ArabicName = definition.ArabicName,
                    Description = definition.Description,
                    Price = definition.Price,
                    Discount1Price = definition.Discount1Price,
                    StockQuantity = definition.StockQuantity,
                    IsActive = true,
                    CategoryID = categoryId,
                    SubCategoryID = subCategoryId,
                    CreatedAt = now
                });
            }

            return products;
        }

        private static int? FindCategoryIdForSubCategory(
            string subCategoryEnglishName,
            Dictionary<string, int> categoryIdsByName,
            Dictionary<string, int> subCategoryIdsByName)
        {
            var subCategoryDefinitions = SeedCatalogDefinitions.GetSubCategories();

            foreach (var definition in subCategoryDefinitions)
            {
                if (definition.EnglishName != subCategoryEnglishName)
                {
                    continue;
                }

                if (categoryIdsByName.TryGetValue(definition.CategoryEnglishName, out var categoryId))
                {
                    return categoryId;
                }
            }

            return null;
        }

        private static List<ProductImage> BuildProductImages(List<Product> products)
        {
            var images = new List<ProductImage>();

            foreach (var product in products)
            {
                var productCode = product.Code ?? string.Empty;
                var imageUrls = SeedImageUrls.GetProductImageUrls(productCode);
                var imageIndex = 0;

                foreach (var imageUrl in imageUrls)
                {
                    images.Add(new ProductImage
                    {
                        ProductID = product.ID,
                        ImageUrl = imageUrl,
                        IsMain = imageIndex == 0
                    });

                    imageIndex++;
                }
            }

            return images;
        }

        private static async Task SeedHeroSectionAsync(ApplicationDBContext context)
        {
            var heroSection = new HeroSection
            {
                Title = "Welcome to BaitTech",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Images = new List<HeroImage>
                {
                    new HeroImage
                    {
                        IsMain = true,
                        ImageUrl = SeedImageUrls.GetHeroImageUrl(0),
                        LinkUrl = "/products"
                    },
                    new HeroImage
                    {
                        IsMain = false,
                        ImageUrl = SeedImageUrls.GetHeroImageUrl(1),
                        LinkUrl = "/categories"
                    },
                    new HeroImage
                    {
                        IsMain = false,
                        ImageUrl = SeedImageUrls.GetHeroImageUrl(2),
                        LinkUrl = "/products"
                    }
                }
            };

            context.HeroSections.Add(heroSection);
            await context.SaveChangesAsync();
        }

        private static async Task SeedProductSectionsAsync(
            ApplicationDBContext context,
            Dictionary<string, int> categoryIdsByName,
            Dictionary<string, int> subCategoryIdsByName,
            List<Product> products)
        {
            var productsByCode = BuildProductsByCode(products);
            var now = DateTime.UtcNow;

            var bestSellers = CreateProductSection(
                "Best Sellers",
                1,
                "Hot",
                "#FF5722",
                categoryIdsByName["Electronics"],
                null,
                now);

            var newArrivals = CreateProductSection(
                "New Arrivals",
                2,
                "New",
                "#4CAF50",
                categoryIdsByName["Electronics"],
                subCategoryIdsByName["Wearables"],
                now);

            var topDeals = CreateProductSection(
                "Top Deals",
                3,
                "Sale",
                "#E91E63",
                categoryIdsByName["Electronics"],
                null,
                now);

            var gamingGear = CreateProductSection(
                "Gaming Gear",
                4,
                "Pro",
                "#673AB7",
                categoryIdsByName["Gaming"],
                null,
                now);

            var audioCollection = CreateProductSection(
                "Audio Collection",
                5,
                "Sound",
                "#009688",
                categoryIdsByName["Electronics"],
                subCategoryIdsByName["Audio"],
                now);

            var smartHome = CreateProductSection(
                "Smart Home",
                6,
                "Smart",
                "#2196F3",
                categoryIdsByName["Smart Home"],
                null,
                now);

            context.ProductSections.AddRange(bestSellers, newArrivals, topDeals, gamingGear, audioCollection, smartHome);
            await context.SaveChangesAsync();

            var sectionProducts = BuildSectionProducts(
                bestSellers,
                newArrivals,
                topDeals,
                gamingGear,
                audioCollection,
                smartHome,
                productsByCode);

            context.SectionProducts.AddRange(sectionProducts);
            await context.SaveChangesAsync();
        }

        private static ProductSection CreateProductSection(
            string title,
            int displayOrder,
            string badgeText,
            string badgeColor,
            int categoryId,
            int? subCategoryId,
            DateTime createdAt)
        {
            return new ProductSection
            {
                Title = title,
                DisplayOrder = displayOrder,
                IsActive = true,
                BadgeText = badgeText,
                BadgeColor = badgeColor,
                CategoryID = categoryId,
                SubCategoryID = subCategoryId,
                CreatedAt = createdAt
            };
        }

        private static Dictionary<string, Product> BuildProductsByCode(List<Product> products)
        {
            var productsByCode = new Dictionary<string, Product>();

            foreach (var product in products)
            {
                if (string.IsNullOrWhiteSpace(product.Code))
                {
                    continue;
                }

                productsByCode[product.Code] = product;
            }

            return productsByCode;
        }

        private static List<SectionProducts> BuildSectionProducts(
            ProductSection bestSellers,
            ProductSection newArrivals,
            ProductSection topDeals,
            ProductSection gamingGear,
            ProductSection audioCollection,
            ProductSection smartHome,
            Dictionary<string, Product> productsByCode)
        {
            var sectionProducts = new List<SectionProducts>();
            var sectionProductDefinitions = new List<(int SectionId, string ProductCode)>
            {
                (bestSellers.ID, "PHN-001"),
                (bestSellers.ID, "LPT-001"),
                (bestSellers.ID, "AUD-001"),
                (bestSellers.ID, "WCH-001"),
                (newArrivals.ID, "TBL-001"),
                (newArrivals.ID, "WCH-002"),
                (newArrivals.ID, "MON-001"),
                (newArrivals.ID, "CAM-001"),
                (topDeals.ID, "PHN-003"),
                (topDeals.ID, "LPT-002"),
                (topDeals.ID, "AUD-003"),
                (topDeals.ID, "ACC-002"),
                (gamingGear.ID, "GAM-001"),
                (gamingGear.ID, "GAM-002"),
                (gamingGear.ID, "GAM-003"),
                (gamingGear.ID, "LPT-002"),
                (audioCollection.ID, "AUD-001"),
                (audioCollection.ID, "AUD-002"),
                (audioCollection.ID, "AUD-003"),
                (smartHome.ID, "SPK-001"),
                (smartHome.ID, "SEC-001"),
                (smartHome.ID, "ACC-001")
            };

            foreach (var definition in sectionProductDefinitions)
            {
                var sectionProduct = CreateSectionProduct(definition.SectionId, productsByCode, definition.ProductCode);

                if (sectionProduct is not null)
                {
                    sectionProducts.Add(sectionProduct);
                }
            }

            return sectionProducts;
        }

        private static SectionProducts? CreateSectionProduct(
            int sectionId,
            Dictionary<string, Product> productsByCode,
            string productCode)
        {
            if (!productsByCode.TryGetValue(productCode, out var product))
            {
                return null;
            }

            return new SectionProducts
            {
                SectionID = sectionId,
                ProductID = product.ID
            };
        }

        private static async Task SeedSampleOrderAsync(ApplicationDBContext context, List<Product> products)
        {
            var productsByCode = BuildProductsByCode(products);
            var phoneProduct = GetProductByCode(productsByCode, "PHN-001");
            var earbudsProduct = GetProductByCode(productsByCode, "AUD-001");

            if (phoneProduct is null || earbudsProduct is null)
            {
                return;
            }

            var order = new Order
            {
                UserName = "John Doe",
                PhoneNumber = "+966500000000",
                Location = "Riyadh, Saudi Arabia",
                CreateDate = DateTime.UtcNow,
                IsConfirmed = false,
                Total = 0m,
                ProductsOrders = new List<ProductsOrders>
                {
                    new ProductsOrders
                    {
                        ProductID = phoneProduct.ID,
                        QTY = 1,
                        UnitPrice = phoneProduct.Discount1Price ?? phoneProduct.Price
                    },
                    new ProductsOrders
                    {
                        ProductID = earbudsProduct.ID,
                        QTY = 2,
                        UnitPrice = earbudsProduct.Discount1Price ?? earbudsProduct.Price
                    }
                }
            };

            order.Total = CalculateOrderTotal(order.ProductsOrders);

            context.Orders.Add(order);
            await context.SaveChangesAsync();
        }

        private static Product? GetProductByCode(Dictionary<string, Product> productsByCode, string productCode)
        {
            if (productsByCode.TryGetValue(productCode, out var product))
            {
                return product;
            }

            return null;
        }

        private static async Task RepairStoredUnsplashImageUrlsAsync(ApplicationDBContext context)
        {
            var hasChanges = false;

            hasChanges = await RepairProductImageUrlsAsync(context) || hasChanges;
            hasChanges = await RepairCategoryImageUrlsAsync(context) || hasChanges;
            hasChanges = await RepairSubCategoryImageUrlsAsync(context) || hasChanges;
            hasChanges = await RepairHeroImageUrlsAsync(context) || hasChanges;

            if (hasChanges)
            {
                await context.SaveChangesAsync();
            }
        }

        private static async Task<bool> RepairProductImageUrlsAsync(ApplicationDBContext context)
        {
            var products = await context.Products
                .Include(product => product.ProductImages)
                .ToListAsync();

            var hasChanges = false;

            foreach (var product in products)
            {
                if (string.IsNullOrWhiteSpace(product.Code))
                {
                    continue;
                }

                if (product.ProductImages is null || product.ProductImages.Count == 0)
                {
                    continue;
                }

                var imageUrls = SeedImageUrls.GetProductImageUrls(product.Code);
                var orderedImages = OrderProductImages(product.ProductImages);
                var imageIndex = 0;

                foreach (var productImage in orderedImages)
                {
                    if (!SeedImageUrls.NeedsImageUrlRepair(productImage.ImageUrl))
                    {
                        imageIndex++;
                        continue;
                    }

                    if (imageIndex >= imageUrls.Count)
                    {
                        break;
                    }

                    productImage.ImageUrl = imageUrls[imageIndex];
                    hasChanges = true;
                    imageIndex++;
                }
            }

            return hasChanges;
        }

        private static List<ProductImage> OrderProductImages(ICollection<ProductImage> productImages)
        {
            var orderedImages = new List<ProductImage>();

            foreach (var productImage in productImages)
            {
                orderedImages.Add(productImage);
            }

            orderedImages.Sort(CompareProductImages);

            return orderedImages;
        }

        private static int CompareProductImages(ProductImage first, ProductImage second)
        {
            if (first.IsMain != second.IsMain)
            {
                return first.IsMain ? -1 : 1;
            }

            return first.ID.CompareTo(second.ID);
        }

        private static async Task<bool> RepairCategoryImageUrlsAsync(ApplicationDBContext context)
        {
            var categories = await context.Categories.ToListAsync();
            var hasChanges = false;

            foreach (var category in categories)
            {
                if (!SeedImageUrls.NeedsImageUrlRepair(category.ImageUrl))
                {
                    continue;
                }

                category.ImageUrl = SeedImageUrls.GetCategoryImageUrl(category.EnglishName ?? string.Empty);
                hasChanges = true;
            }

            return hasChanges;
        }

        private static async Task<bool> RepairSubCategoryImageUrlsAsync(ApplicationDBContext context)
        {
            var subCategories = await context.SubCategories.ToListAsync();
            var hasChanges = false;

            foreach (var subCategory in subCategories)
            {
                if (!SeedImageUrls.NeedsImageUrlRepair(subCategory.ImageUrl))
                {
                    continue;
                }

                subCategory.ImageUrl = SeedImageUrls.GetSubCategoryImageUrl(subCategory.EnglishName ?? string.Empty);
                hasChanges = true;
            }

            return hasChanges;
        }

        private static async Task<bool> RepairHeroImageUrlsAsync(ApplicationDBContext context)
        {
            var heroImages = await context.HeroImages.ToListAsync();
            var hasChanges = false;
            var imageIndex = 0;

            foreach (var heroImage in heroImages)
            {
                if (!SeedImageUrls.NeedsImageUrlRepair(heroImage.ImageUrl))
                {
                    imageIndex++;
                    continue;
                }

                heroImage.ImageUrl = SeedImageUrls.GetHeroImageUrl(imageIndex);
                hasChanges = true;
                imageIndex++;
            }

            return hasChanges;
        }

        private static decimal CalculateOrderTotal(ICollection<ProductsOrders>? lineItems)
        {
            if (lineItems is null)
            {
                return 0m;
            }

            decimal total = 0m;

            foreach (var item in lineItems)
            {
                total += item.UnitPrice * item.QTY;
            }

            return total;
        }
    }
}
