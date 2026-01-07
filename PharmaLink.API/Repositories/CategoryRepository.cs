using Dapper;
using Microsoft.Data.SqlClient;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Data;

namespace PharmaLink.API.Repositories
{
    public class CategoryRepository(IConfiguration configuration) : ICategoryRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<int> CreateAsync(Category category)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = @"
                    INSERT INTO Categories (Name) 
                    VALUES (@Name);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, category);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM Categories";
            return await connection.QueryAsync<Category>(sql);
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM Categories WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Category>(sql, new { Id = id });
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Are there any medicines in this category?
            string checkSql = "SELECT COUNT(*) FROM Medicines WHERE CategoryId = @Id";
            int dependencyCount = await connection.ExecuteScalarAsync<int>(checkSql, new { Id = id });

            if (dependencyCount > 0)
            {
                // Throw an error that the Controller/Frontend can catch.
                throw new InvalidOperationException($"Cannot delete this category. It is currently assigned to {dependencyCount} medicines.");
            }

            string deleteSql = "DELETE FROM Categories WHERE Id = @Id";
            var rows = await connection.ExecuteAsync(deleteSql, new { Id = id });

            if (rows > 0)
            {
                // Optional: Reset Identity if table is empty (keep your existing logic)
                string countSql = "SELECT COUNT(*) FROM Categories";
                int remainingRows = await connection.ExecuteScalarAsync<int>(countSql);
                if (remainingRows == 0)
                {
                    await connection.ExecuteAsync("DBCC CHECKIDENT ('Categories', RESEED, 0)");
                }
            }

            return rows > 0;
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = @"
                    UPDATE Categories 
                    SET Name = @Name 
                    WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, category);
            return rows > 0;
        }
    }
}