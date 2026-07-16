namespace ECommercePlatform.Server.Models.Seed
{
    public static class SeedImageUrls
    {
        private const string SeedImageBasePath = "/assets/images/seed";
        private static readonly Dictionary<string, string[]> ProductImagesByCode = BuildProductImagesByCode();

        public static string GetProductImageUrl(string productCode)
        {
            var urls = GetProductImageUrls(productCode);

            if (urls.Count == 0)
            {
                return GetDefaultProductImageUrl();
            }

            return urls[0];
        }

        public static IReadOnlyList<string> GetProductImageUrls(string productCode)
        {
            if (ProductImagesByCode.TryGetValue(productCode, out var urls))
            {
                return urls;
            }

            return new[] { GetDefaultProductImageUrl() };
        }

        public static string GetCategoryImageUrl(string englishName)
        {
            return englishName switch
            {
                "Electronics" => BuildSeedImagePath("tech-2"),
                "Smart Home" => BuildSeedImagePath("smarthome-1"),
                "Gaming" => BuildSeedImagePath("gaming-1"),
                _ => GetDefaultProductImageUrl()
            };
        }

        public static string GetSubCategoryImageUrl(string englishName)
        {
            return englishName switch
            {
                "Phones" => BuildSeedImagePath("phone-1"),
                "Laptops" => BuildSeedImagePath("laptop-1"),
                "Tablets" => BuildSeedImagePath("tablet-1"),
                "Audio" => BuildSeedImagePath("audio-1"),
                "Wearables" => BuildSeedImagePath("watch-1"),
                "Displays" => BuildSeedImagePath("display-1"),
                "Cameras" => BuildSeedImagePath("camera-1"),
                "Smart Speakers" => BuildSeedImagePath("speaker-1"),
                "Smart Security" => BuildSeedImagePath("smarthome-1"),
                "Controllers" => BuildSeedImagePath("gaming-1"),
                "Peripherals" => BuildSeedImagePath("accessory-1"),
                _ => GetDefaultProductImageUrl()
            };
        }

        public static string GetHeroImageUrl(int index)
        {
            return index switch
            {
                0 => BuildSeedImagePath("hero-1"),
                1 => BuildSeedImagePath("hero-2"),
                2 => BuildSeedImagePath("hero-3"),
                _ => BuildSeedImagePath("hero-1")
            };
        }

        public static bool IsExternalUnsplashUrl(string? imageUrl)
        {
            return !string.IsNullOrWhiteSpace(imageUrl)
                && imageUrl.Contains("images.unsplash.com", StringComparison.OrdinalIgnoreCase);
        }

        public static bool IsLegacySeedImageUrl(string? imageUrl)
        {
            return !string.IsNullOrWhiteSpace(imageUrl)
                && imageUrl.StartsWith("/images/seed/", StringComparison.OrdinalIgnoreCase);
        }

        public static bool NeedsImageUrlRepair(string? imageUrl)
        {
            return IsExternalUnsplashUrl(imageUrl) || IsLegacySeedImageUrl(imageUrl);
        }

        public static string GetDefaultProductImageUrl()
        {
            return BuildSeedImagePath("tech-1");
        }

        private static string BuildSeedImagePath(string fileName)
        {
            return $"{SeedImageBasePath}/{fileName}.jpg";
        }

        private static Dictionary<string, string[]> BuildProductImagesByCode()
        {
            return new Dictionary<string, string[]>
            {
                ["PHN-001"] = new[]
                {
                    BuildSeedImagePath("phone-1"),
                    BuildSeedImagePath("phone-2"),
                    BuildSeedImagePath("phone-3")
                },
                ["PHN-002"] = new[]
                {
                    BuildSeedImagePath("phone-2"),
                    BuildSeedImagePath("phone-3"),
                    BuildSeedImagePath("phone-1")
                },
                ["PHN-003"] = new[]
                {
                    BuildSeedImagePath("phone-3"),
                    BuildSeedImagePath("phone-4")
                },
                ["LPT-001"] = new[]
                {
                    BuildSeedImagePath("laptop-1"),
                    BuildSeedImagePath("laptop-2"),
                    BuildSeedImagePath("tech-2")
                },
                ["LPT-002"] = new[]
                {
                    BuildSeedImagePath("laptop-2"),
                    BuildSeedImagePath("laptop-1"),
                    BuildSeedImagePath("gaming-1")
                },
                ["LPT-003"] = new[]
                {
                    BuildSeedImagePath("laptop-1"),
                    BuildSeedImagePath("tech-2")
                },
                ["TBL-001"] = new[]
                {
                    BuildSeedImagePath("tablet-1"),
                    BuildSeedImagePath("tablet-2"),
                    BuildSeedImagePath("tech-1")
                },
                ["AUD-001"] = new[]
                {
                    BuildSeedImagePath("audio-2"),
                    BuildSeedImagePath("audio-3"),
                    BuildSeedImagePath("audio-4")
                },
                ["AUD-002"] = new[]
                {
                    BuildSeedImagePath("audio-1"),
                    BuildSeedImagePath("audio-5"),
                    BuildSeedImagePath("audio-3")
                },
                ["AUD-003"] = new[]
                {
                    BuildSeedImagePath("speaker-1"),
                    BuildSeedImagePath("audio-4")
                },
                ["WCH-001"] = new[]
                {
                    BuildSeedImagePath("watch-1"),
                    BuildSeedImagePath("watch-2"),
                    BuildSeedImagePath("tech-1")
                },
                ["WCH-002"] = new[]
                {
                    BuildSeedImagePath("watch-2"),
                    BuildSeedImagePath("watch-1")
                },
                ["MON-001"] = new[]
                {
                    BuildSeedImagePath("display-1"),
                    BuildSeedImagePath("laptop-2"),
                    BuildSeedImagePath("tech-2")
                },
                ["TV-001"] = new[]
                {
                    BuildSeedImagePath("display-2"),
                    BuildSeedImagePath("display-1"),
                    BuildSeedImagePath("tech-3")
                },
                ["CAM-001"] = new[]
                {
                    BuildSeedImagePath("camera-1"),
                    BuildSeedImagePath("camera-2"),
                    BuildSeedImagePath("tech-1")
                },
                ["SPK-001"] = new[]
                {
                    BuildSeedImagePath("speaker-1"),
                    BuildSeedImagePath("smarthome-1"),
                    BuildSeedImagePath("audio-4")
                },
                ["SEC-001"] = new[]
                {
                    BuildSeedImagePath("smarthome-1"),
                    BuildSeedImagePath("tech-2")
                },
                ["GAM-001"] = new[]
                {
                    BuildSeedImagePath("gaming-1"),
                    BuildSeedImagePath("gaming-2"),
                    BuildSeedImagePath("accessory-1")
                },
                ["GAM-002"] = new[]
                {
                    BuildSeedImagePath("accessory-1"),
                    BuildSeedImagePath("gaming-2"),
                    BuildSeedImagePath("tech-2")
                },
                ["GAM-003"] = new[]
                {
                    BuildSeedImagePath("gaming-1"),
                    BuildSeedImagePath("gaming-2")
                },
                ["ACC-001"] = new[]
                {
                    BuildSeedImagePath("accessory-1"),
                    BuildSeedImagePath("tech-2")
                },
                ["ACC-002"] = new[]
                {
                    BuildSeedImagePath("accessory-1"),
                    BuildSeedImagePath("tech-1"),
                    BuildSeedImagePath("phone-4")
                }
            };
        }
    }
}
