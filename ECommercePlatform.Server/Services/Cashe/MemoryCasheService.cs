using Microsoft.Extensions.Caching.Memory;

namespace ECommercePlatform.Server.Services.Cashe
{
    public class MemoryCasheService : ICasheService
    {
        private readonly IMemoryCache _memoryCache;

        public MemoryCasheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public T GetData<T>(string key)
        {
            return _memoryCache.TryGetValue(key, out T value) ? value : default;
        }

        public object RemoveData(string key)
        {
            _memoryCache.Remove(key);
            return true;
        }

        public bool SetData<T>(string key, T value, DateTimeOffset expirationTime)
        {
            var expiry = expirationTime - DateTimeOffset.Now;
            _memoryCache.Set(key, value, expiry);
            return true;
        }
    }
}
