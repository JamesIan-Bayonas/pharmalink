using Dapper;
using Npgsql;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;

namespace PharmaLink.API.Repositories
{
    public class CategoryRepository(IConfiguration configuration) : ICategoryRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<int> CreateAsync(Category category)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                INSERT INTO ""Categories"" (""Name"") 
                VALUES (@Name)
                RETURNING ""Id"";";
            return await connection.QuerySingleAsync<int>(sql, category);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"SELECT ""Id"", ""Name"" FROM ""Categories"" ORDER BY ""Id"" ASC";
            return await connection.QueryAsync<Category>(sql);
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"SELECT ""Id"", ""Name"" FROM ""Categories"" WHERE ""Id"" = @Id";
            return await connection.QuerySingleOrDefaultAsync<Category>(sql, new { Id = id });
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            const string checkSql = @"SELECT COUNT(*) FROM ""Medicines"" WHERE ""CategoryId"" = @Id";
            int dependencyCount = await connection.ExecuteScalarAsync<int>(checkSql, new { Id = id });

            if (dependencyCount > 0)
            {
                throw new InvalidOperationException($"Cannot delete this category. It is currently assigned to {dependencyCount} medicines.");
            }

            const string deleteSql = @"DELETE FROM ""Categories"" WHERE ""Id"" = @Id";
            var rows = await connection.ExecuteAsync(deleteSql, new { Id = id });

            return rows > 0;
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                UPDATE ""Categories"" 
                SET ""Name"" = @Name 
                WHERE ""Id"" = @Id";

            var rows = await connection.ExecuteAsync(sql, category);
            return rows > 0;
        }
    }
}