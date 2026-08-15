using Dapper;
using Npgsql;

namespace PharmaLink.API.Utilities
{
    public static class DbSeeder
    {
        public static async Task SeedUsersAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection string not found");

            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            // Check specifically if "admin" exists
            const string checkAdminSql = @"SELECT COUNT(*) FROM ""Users"" WHERE ""UserName"" = @UserName";
            int adminExists = await connection.ExecuteScalarAsync<int>(checkAdminSql, new { UserName = "admin" });

            if (adminExists == 0)
            {
                string adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
                string pharmacistPasswordHash = BCrypt.Net.BCrypt.HashPassword("Pharmacist123!");

                const string insertUserSql = @"
                    INSERT INTO ""Users"" (""UserName"", ""PasswordHash"", ""Role"") 
                    VALUES (@UserName, @PasswordHash, @Role);";

                var defaultUsers = new[]
                {
                    new { UserName = "admin", PasswordHash = adminPasswordHash, Role = "Admin" },
                    new { UserName = "pharmacist", PasswordHash = pharmacistPasswordHash, Role = "Pharmacist" }
                };

                await connection.ExecuteAsync(insertUserSql, defaultUsers);
            }
        }
    }
}