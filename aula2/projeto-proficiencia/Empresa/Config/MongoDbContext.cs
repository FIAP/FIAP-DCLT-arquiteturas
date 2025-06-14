using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Empresas.Config
{
    public sealed class MongoDbContext
    {
        private static readonly Lazy<MongoDbContext> _instance = new Lazy<MongoDbContext>(() => new MongoDbContext());
        private readonly IMongoDatabase _database;
        private MongoClient _client;

        private MongoDbContext()
        {
        }

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetSection("MongoDB:ConnectionString").Value;
            var databaseName = configuration.GetSection("MongoDB:DatabaseName").Value;

            _client = new MongoClient(connectionString);
            _database = _client.GetDatabase(databaseName);
        }

        public static MongoDbContext Instance => _instance.Value;

        public IMongoDatabase Database => _database;
    }
}
