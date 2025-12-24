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

            // We run multiple queries in one go for speed
            string sql = @"
                -- 1. Revenue & Sales Count (Today)
                SELECT 
                    ISNULL(SUM(TotalAmount), 0) as TotalRevenue, 
                    COUNT(Id) as SalesCount 
                FROM Sales 
                WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE);

                -- 2. Low Stock (Less than 10)
                SELECT COUNT(*) FROM Medicines WHERE StockQuantity < 10;

                -- 3. Expiring Soon (Next 90 days)
                SELECT COUNT(*) FROM Medicines 
                WHERE ExpiryDate <= DATEADD(day, 90, GETDATE()) 
                AND ExpiryDate >= GETDATE();

                -- 4. Total Medicines
                SELECT COUNT(*) FROM Medicines;";

            using var multi = await connection.QueryMultipleAsync(sql);

            // Read the results in order
            var salesData = await multi.ReadFirstAsync(); // dynamic object
            int lowStock = await multi.ReadSingleAsync<int>();
            int expiring = await multi.ReadSingleAsync<int>();
            int totalMeds = await multi.ReadSingleAsync<int>();

            return new DashboardStatsDto
            {
                TotalRevenueToday = (decimal)salesData.TotalRevenue,
                TotalSalesToday = (int)salesData.SalesCount,
                LowStockItems = lowStock,
                ExpiringSoonItems = expiring,
                TotalMedicines = totalMeds
            };
        }
    }
}