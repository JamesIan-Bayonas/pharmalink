using Dapper;
using Microsoft.Data.SqlClient;
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
            using var connection = new SqlConnection(_connectionString);

            // Group sales by date for the last 7 days
            var sql = @"
                
                -- 1. Total Revenue Today
                SELECT ISNULL(SUM(TotalAmount), 0) FROM Sales 
                WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE);

                -- 2. Transactions Today
                SELECT COUNT(*) FROM Sales 
                WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE);

                -- 3. Low Stock Items
                SELECT COUNT(*) FROM Medicines WHERE StockQuantity <= 10;

                -- 4. Expiring Soon Items (90 Days)
                SELECT COUNT(*) FROM Medicines WHERE ExpiryDate <= DATEADD(day, 90, GETDATE());

                -- 5. Total Medicines
                SELECT COUNT(*) FROM Medicines;

                -- 6. NEW: Weekly Sales Trend (Last 7 Days)
                SELECT 
                    FORMAT(TransactionDate, 'ddd') as DateLabel, -- Returns 'Mon', 'Tue'
                    SUM(TotalAmount) as TotalAmount
                FROM Sales
                WHERE TransactionDate >= DATEADD(day, -6, CAST(GETDATE() AS DATE))
                GROUP BY CAST(TransactionDate AS DATE), FORMAT(TransactionDate, 'ddd')
                ORDER BY CAST(TransactionDate AS DATE);
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

            // Read the list for the chart
            stats.WeeklySales = (await multi.ReadAsync<SalesTrendDto>()).ToList();

            return stats;
        }
    }
}