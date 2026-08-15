namespace PharmaLink.API.Repositories
{
    using Dapper;
    using Npgsql;
    using PharmaLink.API.Entities;
    using PharmaLink.API.Interfaces.RepositoryInterface;

    public class UserRepository(IConfiguration configuration) : IUserRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<User?> GetByIdAsync(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT ""Id"", ""UserName"", ""PasswordHash"", ""Role"", ""ProfileImagePath"" 
                FROM ""Users"" 
                WHERE ""Id"" = @Id";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT ""Id"", ""UserName"", ""PasswordHash"", ""Role"", ""ProfileImagePath"" 
                FROM ""Users"" 
                WHERE LOWER(TRIM(""UserName"")) = LOWER(TRIM(@UserName))";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { UserName = username });
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT ""Id"", ""UserName"", ""PasswordHash"", ""Role"", ""ProfileImagePath"" 
                FROM ""Users"" 
                ORDER BY ""Id"" ASC";
            return await connection.QueryAsync<User>(sql);
        }

        public async Task<int> CreateAsync(User user)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                INSERT INTO ""Users"" (""UserName"", ""PasswordHash"", ""Role"", ""ProfileImagePath"") 
                VALUES (@UserName, @PasswordHash, @Role, @ProfileImagePath)
                RETURNING ""Id"";";
            return await connection.QuerySingleAsync<int>(sql, user);
        }

        public async Task<bool> UpdateAsync(User user)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                UPDATE ""Users"" 
                SET ""UserName"" = @UserName, 
                    ""PasswordHash"" = @PasswordHash,
                    ""ProfileImagePath"" = @ProfileImagePath,
                    ""Role"" = @Role
                WHERE ""Id"" = @Id";
            var rows = await connection.ExecuteAsync(sql, user);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"DELETE FROM ""Users"" WHERE ""Id"" = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }

        public async Task<bool> UpdateProfileImageAsync(int userId, string imagePath)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"UPDATE ""Users"" SET ""ProfileImagePath"" = @Path WHERE ""Id"" = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Path = imagePath, Id = userId });
            return rows > 0;
        }
    }
}