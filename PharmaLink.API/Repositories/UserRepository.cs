namespace PharmaLink.API.Repositories
{
    using Dapper;
    using Microsoft.Data.SqlClient;
    using PharmaLink.API.Entities;
    using PharmaLink.API.Interfaces.RepositoryInterface;
    using System.ComponentModel.DataAnnotations;
    using System.Data;

    // 1. User Repository (Fully Implemented)
    public class UserRepository(IConfiguration configuration) : IUserRepository
    {
        
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<User?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM Users WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM Users WHERE UserName = @UserName";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { UserName = username });
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM Users";
            return await connection.QueryAsync<User>(sql);
        }

        public async Task<int> CreateAsync(User user)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = @"
                INSERT INTO Users (Username, PasswordHash, Role) 
                VALUES (@Username, @PasswordHash, @Role)
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, user);
        }

        public async Task<bool> UpdateAsync(User user)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = @"
                UPDATE Users 
                SET UserName = @UserName, 
                    PasswordHash = @PasswordHash
                WHERE Id = @Id";
            var rows = await connection.ExecuteAsync(sql, user);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "DELETE FROM Users WHERE Id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
}
