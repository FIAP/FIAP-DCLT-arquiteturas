using Empresas.Config;
using Empresas.Entities;
using MongoDB.Driver;

namespace Empresas.Resources.Repositories
{
    public class EmpresaRepository : Interfaces.IRepository<Empresa>
    {
        private readonly IMongoCollection<Empresa> _collection;

        public EmpresaRepository()
        {
            // Obter a coleção do MongoDB para a entidade Empresa
            _collection = MongoDbContext.Instance.Database.GetCollection<Empresa>("empresas");
        }

        public async Task<IEnumerable<Empresa>> GetAllAsync()
        {
            return await _collection.Find(emp => true).ToListAsync();
        }

        public async Task<Empresa> GetByIdAsync(int id)
        {
            return await _collection.Find(emp => emp.Id == id).FirstOrDefaultAsync();
        }

        public async Task AddAsync(Empresa entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        public async Task UpdateAsync(int id, Empresa entity)
        {
            await _collection.ReplaceOneAsync(emp => emp.Id == id, entity);
        }

        public async Task DeleteAsync(int id)
        {
            await _collection.DeleteOneAsync(emp => emp.Id == id);
        }
    }

}
