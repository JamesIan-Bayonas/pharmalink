using Dapper;
using Npgsql;
using PharmaLink.API.DTOs.Dashboard;
using PharmaLink.API.Interfaces.RepositoryInterface;

namespace PharmaLink.API.Repositories
{
    public class DashboardRepository(IConfiguration configuration) : IDashboardRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<DashboardStatsDto> GetDailyStatsAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);

            // In PostgreSQL:
            // 1. COALESCE instead of ISNULL
            // 2. CURRENT_DATE instead of CAST(GETDATE() AS DATE)
            // 3. (CURRENT_DATE + INTERVAL '90 days') instead of DATEADD
            // 4. TO_CHAR("TransactionDate", 'Dy') returns 'Mon', 'Tue'
            const string sql = @"
                -- 1. Total Revenue Today
                SELECT COALESCE(SUM(""TotalAmount""), 0) FROM ""Sales"" 
                WHERE CAST(""TransactionDate"" AS DATE) = CURRENT_DATE;

                -- 2. Transactions Today
                SELECT COUNT(*) FROM ""Sales"" 
                WHERE CAST(""TransactionDate"" AS DATE) = CURRENT_DATE;

                -- 3. Low Stock Items
                SELECT COUNT(*) FROM ""Medicines"" WHERE ""StockQuantity"" <= 10;

                -- 4. Expiring Soon Items (90 Days)
                SELECT COUNT(*) FROM ""Medicines"" WHERE ""ExpiryDate"" <= (CURRENT_DATE + INTERVAL '90 days');

                -- 5. Total Medicines
                SELECT COUNT(*) FROM ""Medicines"";

                -- 6. Weekly Sales Trend (Last 7 Days)
                SELECT 
                    TO_CHAR(""TransactionDate"", 'Dy') as ""DateLabel"",
                    COALESCE(SUM(""TotalAmount""), 0) as ""TotalAmount""
                FROM ""Sales""
                WHERE ""TransactionDate"" >= (CURRENT_DATE - INTERVAL '6 days')
                GROUP BY CAST(""TransactionDate"" AS DATE), TO_CHAR(""TransactionDate"", 'Dy')
                ORDER BY CAST(""TransactionDate"" AS DATE);
            ";

            await connection.OpenAsync();
            using var multi = await connection.QueryMultipleAsync(sql);

            var stats = new DashboardStatsDto
            {
                TotalRevenueToday = await multi.ReadSingleAsync<decimal>(),
                TotalSalesToday = await multi.ReadSingleAsync<int>(),
                LowStockItems = await multi.ReadSingleAsync<int>(),
                ExpiringSoonItems = await multi.ReadSingleAsync<int>(),
                TotalMedicines = await multi.ReadSingleAsync<int>()
            };

            stats.WeeklySales = (await multi.ReadAsync<SalesTrendDto>()).ToList();

            return stats;
        }
    }
}