using Dapper;
using Microsoft.Data.SqlClient;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Data;

namespace PharmaLink.API.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly string _connectionString;

        public CategoryRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");
        }

        public async Task<int> CreateAsync(Category category)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string sql = @"
                    INSERT INTO Categories (Name) 
                    VALUES (@Name);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
                return await connection.QuerySingleAsync<int>(sql, category);
            }
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string sql = "SELECT * FROM Categories";
                return await connection.QueryAsync<Category>(sql);
            }
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string sql = "SELECT * FROM Categories WHERE Id = @Id";
                return await connection.QuerySingleOrDefaultAsync<Category>(sql, new { Id = id });
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                string sql = "DELETE FROM Categories WHERE Id = @Id";
                var rows = await connection.ExecuteAsync(sql, new { Id = id });
                return rows > 0;
            }
        }
    }
}