using Dapper;
using Microsoft.Data.SqlClient;
using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Data;
using System.Text;

namespace PharmaLink.API.Repositories
{
    public class SaleRepository(IConfiguration configuration) : ISaleRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection string not found");

        // Required by ISaleRepository
        public async Task<Sale?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            const string sql = "SELECT * FROM Sales WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Sale>(sql, new { Id = id });
        }
        public async Task<IEnumerable<Sale>> GetAllAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            // We use 'TransactionDate AS TransDate' here as well
            const string sql = @"
                SELECT Id, UserId, TotalAmount, TransactionDate AS TransDate 
                FROM Sales";
            return await connection.QueryAsync<Sale>(sql);
        }

        public async Task<int> CreateSaleTransactionAsync(Sale sale, List<SaleItem> items)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Begin Transaction: All or Nothing
            using var transaction = connection.BeginTransaction();
            try
            {
                // Insert Sale Header and get the new ID
                string saleSql = @"
                        INSERT INTO Sales (UserId, TotalAmount, TransactionDate) 
                        VALUES (@UserId, @TotalAmount, GETDATE());
                        SELECT CAST(SCOPE_IDENTITY() as int);";

                int newSaleId = await connection.QuerySingleAsync<int>(saleSql, sale, transaction);

                // Process Items
                foreach (var item in items)
                {
                    item.SaleId = newSaleId;

                    // Insert Sale Item
                    string itemSql = @"
                            INSERT INTO SalesItems (SaleId, MedicineId, Quantity, UnitPrice)
                            VALUES (@SaleId, @MedicineId, @Quantity, @UnitPrice)";

                    await connection.ExecuteAsync(itemSql, item, transaction);

                    // Update Inventory
                    string stockSql = @"
                            UPDATE Medicines 
                            SET StockQuantity = StockQuantity - @Quantity 
                            WHERE Id = @MedicineId";

                    await connection.ExecuteAsync(stockSql, new { item.Quantity, item.MedicineId }, transaction);
                }

                transaction.Commit();
                return newSaleId;
            }
            catch (Exception)
            {
                transaction.Rollback(); 
                throw;
            }
        }

        public async Task<IEnumerable<SaleItem>> GetItemsBySaleIdAsync(int saleId)
        {
            using var connection = new SqlConnection(_connectionString);
            // Simple select and fetch to get all items belonging to this Sale ID
            string sql = "SELECT * FROM SalesItems WHERE SaleId = @SaleId";
            return await connection.QueryAsync<SaleItem>(sql, new { SaleId = saleId });
        }
        public async Task<bool> DeleteSaleTransactionAsync(int saleId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();
            try
            {
                // GET OLD ITEMS (To know what to put back on shelf)
                string getItemsSql = "SELECT * FROM SalesItems WHERE SaleId = @SaleId";
                var oldItems = await connection.QueryAsync<SaleItem>(getItemsSql, new { SaleId = saleId }, transaction);

                // RESTORE STOCK (Reverse the sale)
                string restoreStockSql = "UPDATE Medicines SET StockQuantity = StockQuantity + @Quantity WHERE Id = @MedicineId";
                foreach (var item in oldItems)
                {
                    await connection.ExecuteAsync(restoreStockSql, new { item.Quantity, item.MedicineId }, transaction);
                }

                string deleteSql = "DELETE FROM Sales WHERE Id = @SaleId";
                int rows = await connection.ExecuteAsync(deleteSql, new { SaleId = saleId }, transaction);

                transaction.Commit();
                return rows > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateSaleTransactionAsync(int saleId, Sale saleHeader, List<SaleItem> newItems)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();
            try
            {
                var oldItems = await connection.QueryAsync<SaleItem>("SELECT * FROM SalesItems WHERE SaleId = @SaleId", new { SaleId = saleId }, transaction);
                foreach (var item in oldItems)
                {
                    await connection.ExecuteAsync(
                        "UPDATE Medicines SET StockQuantity = StockQuantity + @Quantity WHERE Id = @MedicineId",
                        new { item.Quantity, item.MedicineId }, transaction);
                }

                await connection.ExecuteAsync("DELETE FROM SalesItems WHERE SaleId = @SaleId", new { SaleId = saleId }, transaction);

                foreach (var item in newItems)
                {
                    item.SaleId = saleId; // Link to existing ID

                    // Deduct New Stock
                    await connection.ExecuteAsync(
                        "UPDATE Medicines SET StockQuantity = StockQuantity - @Quantity WHERE Id = @MedicineId",
                        new { item.Quantity, item.MedicineId }, transaction);

                    // Insert New Item
                    await connection.ExecuteAsync(
                        @"INSERT INTO SalesItems (SaleId, MedicineId, Quantity, UnitPrice)
                          VALUES (@SaleId, @MedicineId, @Quantity, @UnitPrice)",
                        item, transaction);
                }

                string updateHeaderSql = @" 
                    UPDATE Sales 
                    SET TotalAmount = @TotalAmount, 
                        UserId = @UserId,
                        TransactionDate = @TransDate
                    WHERE Id = @Id";

                // Ensure the ID is set in the object
                saleHeader.Id = saleId;

                await connection.ExecuteAsync(updateHeaderSql, saleHeader, transaction);

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // PharmaLink.API/Repositories/SaleRepository.cs
        public async Task<(IEnumerable<Sale>, int)> GetAllPagedAsync(SalesParams parameters)
        {
            using var connection = new SqlConnection(_connectionString);
            var sqlBuilder = new StringBuilder(@"
                SELECT Id, UserId, TotalAmount, TransactionDate AS TransDate 
                FROM Sales WHERE 1=1 ");

            var dbParams = new DynamicParameters();

            if (parameters.StartDate.HasValue)
            {
                sqlBuilder.Append(" AND TransactionDate >= @Start");
                dbParams.Add("Start", parameters.StartDate);
            }

            if (parameters.EndDate.HasValue)
            {
                // We add 1 day to include the full end day (since dates usually have 00:00:00 time)
                // OR just use strictly if you send time. Usually for reports, we want up to the end of that day.
                sqlBuilder.Append(" AND TransactionDate < @End");
                dbParams.Add("End", parameters.EndDate.Value.AddDays(1));
            }

            string countSql = $"SELECT COUNT(*) FROM Sales WHERE 1=1 {sqlBuilder.ToString().Substring(sqlBuilder.ToString().IndexOf("WHERE") + 10)}";
            string countSqlRaw = sqlBuilder.ToString();
            string countSqlFinal = "SELECT COUNT(*) " + countSqlRaw.Substring(countSqlRaw.IndexOf("FROM"));

            int totalCount = await connection.ExecuteScalarAsync<int>(countSqlFinal, dbParams);

            // Apply Pagination
            sqlBuilder.Append(" ORDER BY TransactionDate DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");
            dbParams.Add("Offset", (parameters.PageNumber - 1) * parameters.PageSize);
            dbParams.Add("PageSize", parameters.PageSize);

            var items = await connection.QueryAsync<Sale>(sqlBuilder.ToString(), dbParams);
            return (items, totalCount);
        }
    }
}