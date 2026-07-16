namespace ECommercePlatform.Server.Models.Seed
{
    public static class SeedCatalogDefinitions
    {
        public static List<(string EnglishName, string ArabicName)> GetCategories()
        {
            return new List<(string, string)>
            {
                ("Electronics", "إلكترونيات"),
                ("Smart Home", "المنزل الذكي"),
                ("Gaming", "الألعاب")
            };
        }

        public static List<(string EnglishName, string ArabicName, string CategoryEnglishName)> GetSubCategories()
        {
            return new List<(string, string, string)>
            {
                ("Phones", "هواتف", "Electronics"),
                ("Laptops", "حواسيب محمولة", "Electronics"),
                ("Tablets", "أجهزة لوحية", "Electronics"),
                ("Audio", "صوتيات", "Electronics"),
                ("Wearables", "أجهزة قابلة للارتداء", "Electronics"),
                ("Displays", "شاشات", "Electronics"),
                ("Cameras", "كاميرات", "Electronics"),
                ("Smart Speakers", "مكبرات صوت ذكية", "Smart Home"),
                ("Smart Security", "أمن منزلي ذكي", "Smart Home"),
                ("Controllers", "أجهزة تحكم", "Gaming"),
                ("Peripherals", "ملحقات الألعاب", "Gaming")
            };
        }

        public static List<SeedProductDefinition> GetProducts()
        {
            return new List<SeedProductDefinition>
            {
                new SeedProductDefinition
                {
                    Code = "PHN-001",
                    EnglishName = "Galaxy Ultra 5G",
                    ArabicName = "جالاكسي ألترا 5G",
                    Description = "Flagship 5G smartphone with 6.8-inch AMOLED display, 256GB storage, triple camera system, and 5000mAh fast-charging battery.",
                    Price = 899.99m,
                    Discount1Price = 799.99m,
                    StockQuantity = 45,
                    SubCategoryEnglishName = "Phones"
                },
                new SeedProductDefinition
                {
                    Code = "PHN-002",
                    EnglishName = "Pixel Pro Phone",
                    ArabicName = "بيكسل برو",
                    Description = "Premium Android phone with advanced AI camera, 120Hz display, wireless charging, and IP68 water resistance.",
                    Price = 649.99m,
                    StockQuantity = 60,
                    SubCategoryEnglishName = "Phones"
                },
                new SeedProductDefinition
                {
                    Code = "PHN-003",
                    EnglishName = "Budget Phone X",
                    ArabicName = "هاتف اقتصادي X",
                    Description = "Affordable 4G smartphone with 128GB storage, dual SIM support, and all-day battery life for everyday use.",
                    Price = 249.99m,
                    Discount1Price = 199.99m,
                    StockQuantity = 120,
                    SubCategoryEnglishName = "Phones"
                },
                new SeedProductDefinition
                {
                    Code = "LPT-001",
                    EnglishName = "Ultrabook Pro 15",
                    ArabicName = "ألترابوك برو 15",
                    Description = "15-inch ultrabook with Intel Core i7, 16GB RAM, 512GB SSD, and 10-hour battery for work and study.",
                    Price = 1299.99m,
                    Discount1Price = 1199.99m,
                    StockQuantity = 35,
                    SubCategoryEnglishName = "Laptops"
                },
                new SeedProductDefinition
                {
                    Code = "LPT-002",
                    EnglishName = "Gaming Laptop RTX",
                    ArabicName = "لابتوب ألعاب RTX",
                    Description = "High-performance gaming laptop with RTX graphics, 144Hz display, 32GB RAM, and advanced cooling system.",
                    Price = 1899.99m,
                    Discount1Price = 1699.99m,
                    StockQuantity = 25,
                    SubCategoryEnglishName = "Laptops"
                },
                new SeedProductDefinition
                {
                    Code = "LPT-003",
                    EnglishName = "Business Laptop 14",
                    ArabicName = "لابتوب أعمال 14",
                    Description = "Compact 14-inch business laptop with fingerprint reader, backlit keyboard, and enterprise-grade security.",
                    Price = 999.99m,
                    StockQuantity = 40,
                    SubCategoryEnglishName = "Laptops"
                },
                new SeedProductDefinition
                {
                    Code = "TBL-001",
                    EnglishName = "Tablet Pro 11",
                    ArabicName = "تابلت برو 11",
                    Description = "11-inch tablet with stylus support, quad speakers, 256GB storage, and all-day productivity features.",
                    Price = 649.99m,
                    Discount1Price = 549.99m,
                    StockQuantity = 55,
                    SubCategoryEnglishName = "Tablets"
                },
                new SeedProductDefinition
                {
                    Code = "AUD-001",
                    EnglishName = "Wireless Earbuds Pro",
                    ArabicName = "سماعات لاسلكية برو",
                    Description = "Active noise cancelling earbuds with 30-hour total battery, IPX5 rating, and crystal-clear call quality.",
                    Price = 149.99m,
                    Discount1Price = 119.99m,
                    StockQuantity = 90,
                    SubCategoryEnglishName = "Audio"
                },
                new SeedProductDefinition
                {
                    Code = "AUD-002",
                    EnglishName = "Studio Headphones",
                    ArabicName = "سماعات استوديو",
                    Description = "Over-ear studio headphones with Hi-Res audio, memory foam cushions, and detachable cable.",
                    Price = 299.99m,
                    StockQuantity = 70,
                    SubCategoryEnglishName = "Audio"
                },
                new SeedProductDefinition
                {
                    Code = "AUD-003",
                    EnglishName = "Portable Bluetooth Speaker",
                    ArabicName = "مكبر صوت بلوتوث",
                    Description = "Waterproof portable speaker with 360° sound, 20-hour playtime, and USB-C fast charging.",
                    Price = 89.99m,
                    Discount1Price = 69.99m,
                    StockQuantity = 100,
                    SubCategoryEnglishName = "Audio"
                },
                new SeedProductDefinition
                {
                    Code = "WCH-001",
                    EnglishName = "Smart Watch Ultra",
                    ArabicName = "ساعة ذكية ألترا",
                    Description = "Premium smartwatch with GPS, heart rate monitor, sleep tracking, and 7-day battery in smart mode.",
                    Price = 399.99m,
                    Discount1Price = 349.99m,
                    StockQuantity = 65,
                    SubCategoryEnglishName = "Wearables"
                },
                new SeedProductDefinition
                {
                    Code = "WCH-002",
                    EnglishName = "Fitness Tracker Band",
                    ArabicName = "سوار لياقة",
                    Description = "Lightweight fitness band with step counter, SpO2 sensor, and 14-day battery life.",
                    Price = 79.99m,
                    StockQuantity = 150,
                    SubCategoryEnglishName = "Wearables"
                },
                new SeedProductDefinition
                {
                    Code = "MON-001",
                    EnglishName = "27 Inch 4K Monitor",
                    ArabicName = "شاشة 27 بوصة 4K",
                    Description = "27-inch 4K UHD monitor with HDR10, 99% sRGB color accuracy, and adjustable stand.",
                    Price = 449.99m,
                    Discount1Price = 399.99m,
                    StockQuantity = 30,
                    SubCategoryEnglishName = "Displays"
                },
                new SeedProductDefinition
                {
                    Code = "TV-001",
                    EnglishName = "55 Inch Smart TV",
                    ArabicName = "تلفزيون ذكي 55 بوصة",
                    Description = "55-inch 4K Smart TV with HDR, built-in streaming apps, and Dolby Audio surround sound.",
                    Price = 699.99m,
                    StockQuantity = 20,
                    SubCategoryEnglishName = "Displays"
                },
                new SeedProductDefinition
                {
                    Code = "CAM-001",
                    EnglishName = "Mirrorless Camera",
                    ArabicName = "كاميرا بدون مرآة",
                    Description = "24MP mirrorless camera with 4K video recording, dual SD slots, and 5-axis image stabilization.",
                    Price = 849.99m,
                    Discount1Price = 749.99m,
                    StockQuantity = 18,
                    SubCategoryEnglishName = "Cameras"
                },
                new SeedProductDefinition
                {
                    Code = "SPK-001",
                    EnglishName = "Smart Speaker Hub",
                    ArabicName = "مكبر صوت ذكي",
                    Description = "Voice-controlled smart speaker with multi-room audio, smart home integration, and premium sound.",
                    Price = 129.99m,
                    Discount1Price = 99.99m,
                    StockQuantity = 80,
                    SubCategoryEnglishName = "Smart Speakers"
                },
                new SeedProductDefinition
                {
                    Code = "SEC-001",
                    EnglishName = "Smart Security Camera",
                    ArabicName = "كاميرا أمن ذكية",
                    Description = "1080p Wi-Fi security camera with night vision, motion alerts, and cloud storage support.",
                    Price = 89.99m,
                    StockQuantity = 75,
                    SubCategoryEnglishName = "Smart Security"
                },
                new SeedProductDefinition
                {
                    Code = "GAM-001",
                    EnglishName = "Wireless Game Controller",
                    ArabicName = "جهاز تحكم لاسلكي",
                    Description = "Ergonomic wireless controller with haptic feedback, programmable buttons, and 40-hour battery.",
                    Price = 59.99m,
                    StockQuantity = 110,
                    SubCategoryEnglishName = "Controllers"
                },
                new SeedProductDefinition
                {
                    Code = "GAM-002",
                    EnglishName = "Mechanical RGB Keyboard",
                    ArabicName = "لوحة مفاتيح ميكانيكية",
                    Description = "Hot-swappable mechanical keyboard with RGB backlight, anti-ghosting, and aluminum frame.",
                    Price = 129.99m,
                    Discount1Price = 99.99m,
                    StockQuantity = 85,
                    SubCategoryEnglishName = "Peripherals"
                },
                new SeedProductDefinition
                {
                    Code = "GAM-003",
                    EnglishName = "Gaming Mouse Pro",
                    ArabicName = "فأرة ألعاب برو",
                    Description = "High-DPI gaming mouse with adjustable weight, 8 programmable buttons, and braided cable.",
                    Price = 79.99m,
                    StockQuantity = 95,
                    SubCategoryEnglishName = "Peripherals"
                },
                new SeedProductDefinition
                {
                    Code = "ACC-001",
                    EnglishName = "USB-C Hub 7-in-1",
                    ArabicName = "محول USB-C",
                    Description = "7-in-1 USB-C hub with HDMI 4K, SD card reader, 3 USB ports, and 100W power delivery.",
                    Price = 49.99m,
                    StockQuantity = 200,
                    SubCategoryEnglishName = "Peripherals"
                },
                new SeedProductDefinition
                {
                    Code = "ACC-002",
                    EnglishName = "Power Bank 20000mAh",
                    ArabicName = "بطارية محمولة 20000",
                    Description = "20000mAh power bank with dual USB-C ports, 65W fast charging, and LED battery indicator.",
                    Price = 39.99m,
                    Discount1Price = 34.99m,
                    StockQuantity = 250,
                    SubCategoryEnglishName = "Peripherals"
                }
            };
        }
    }
}
