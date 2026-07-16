using StackExchange.Redis;
using System.Text.Json;

namespace ECommercePlatform.Server.Services.Cashe
{
    public class CasheService : ICasheService
    {
        private readonly IDatabase _CasheDatabase;

        public CasheService(IConnectionMultiplexer connectionMultiplexer)
        {
            _CasheDatabase = connectionMultiplexer.GetDatabase();
        }

        public T GetData<T>(string key)
        {
            var value = _CasheDatabase.StringGet(key);

            if (!string.IsNullOrEmpty(value))

                return JsonSerializer.Deserialize<T>(value);

            return default;
        }

        public object RemoveData(string key)
        {
            var _exist = _CasheDatabase.KeyExists(key);

            if (_exist)
                return _CasheDatabase.KeyDelete(key);

            return false;
        }

        public bool SetData<T>(string key, T value, DateTimeOffset expirationTime)
        {
            var expirtyTime = expirationTime.DateTime.Subtract(DateTime.Now);

            return _CasheDatabase.StringSet(key,JsonSerializer.Serialize(value),expirtyTime);
        }
    }
}