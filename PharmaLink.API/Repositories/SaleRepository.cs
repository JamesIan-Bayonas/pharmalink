using Dapper;
using Npgsql;
using PharmaLink.API.DTOs.Sales;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Text;

namespace PharmaLink.API.Repositories
{
    public class SaleRepository(IConfiguration configuration) : ISaleRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<Sale?> GetByIdAsync(int id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT ""Id"", ""UserId"", ""TotalAmount"", ""TransactionDate"" AS ""TransDate"" 
                FROM ""Sales"" 
                WHERE ""Id"" = @Id";
            return await connection.QuerySingleOrDefaultAsync<Sale>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Sale>> GetAllAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT ""Id"", ""UserId"", ""TotalAmount"", ""TransactionDate"" AS ""TransDate"" 
                FROM ""Sales"" 
                ORDER BY ""TransactionDate"" DESC";
            return await connection.QueryAsync<Sale>(sql);
        }

        public async Task<int> CreateSaleTransactionAsync(Sale sale, List<SaleItem> items)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();
            try
            {
                const string saleSql = @"
                    INSERT INTO ""Sales"" (""UserId"", ""TotalAmount"", ""TransactionDate"") 
                    VALUES (@UserId, @TotalAmount, NOW())
                    RETURNING ""Id"";";

                int newSaleId = await connection.QuerySingleAsync<int>(saleSql, sale, transaction);

                foreach (var item in items)
                {
                    item.SaleId = newSaleId;

                    const string itemSql = @"
                        INSERT INTO ""SalesItems"" (""SaleId"", ""MedicineId"", ""Quantity"", ""UnitPrice"")
                        VALUES (@SaleId, @MedicineId, @Quantity, @UnitPrice);";

                    await connection.ExecuteAsync(itemSql, item, transaction);

                    const string stockSql = @"
                        UPDATE ""Medicines"" 
                        SET ""StockQuantity"" = ""StockQuantity"" - @Quantity 
                        WHERE ""Id"" = @MedicineId;";

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
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"SELECT * FROM ""SalesItems"" WHERE ""SaleId"" = @SaleId";
            return await connection.QueryAsync<SaleItem>(sql, new { SaleId = saleId });
        }

        public async Task<bool> DeleteSaleTransactionAsync(int saleId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();
            try
            {
                const string getItemsSql = @"SELECT * FROM ""SalesItems"" WHERE ""SaleId"" = @SaleId";
                var oldItems = await connection.QueryAsync<SaleItem>(getItemsSql, new { SaleId = saleId }, transaction);

                const string restoreStockSql = @"
                    UPDATE ""Medicines"" 
                    SET ""StockQuantity"" = ""StockQuantity"" + @Quantity 
                    WHERE ""Id"" = @MedicineId";

                foreach (var item in oldItems)
                {
                    await connection.ExecuteAsync(restoreStockSql, new { item.Quantity, item.MedicineId }, transaction);
                }

                const string deleteItemsSql = @"DELETE FROM ""SalesItems"" WHERE ""SaleId"" = @SaleId";
                await connection.ExecuteAsync(deleteItemsSql, new { SaleId = saleId }, transaction);

                const string deleteSql = @"DELETE FROM ""Sales"" WHERE ""Id"" = @SaleId";
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
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();
            try
            {
                var oldItems = await connection.QueryAsync<SaleItem>(
                    @"SELECT * FROM ""SalesItems"" WHERE ""SaleId"" = @SaleId", new { SaleId = saleId }, transaction);

                foreach (var item in oldItems)
                {
                    await connection.ExecuteAsync(
                        @"UPDATE ""Medicines"" SET ""StockQuantity"" = ""StockQuantity"" + @Quantity WHERE ""Id"" = @MedicineId",
                        new { item.Quantity, item.MedicineId }, transaction);
                }

                await connection.ExecuteAsync(@"DELETE FROM ""SalesItems"" WHERE ""SaleId"" = @SaleId", new { SaleId = saleId }, transaction);

                foreach (var item in newItems)
                {
                    item.SaleId = saleId;

                    await connection.ExecuteAsync(
                        @"UPDATE ""Medicines"" SET ""StockQuantity"" = ""StockQuantity"" - @Quantity WHERE ""Id"" = @MedicineId",
                        new { item.Quantity, item.MedicineId }, transaction);

                    await connection.ExecuteAsync(
                        @"INSERT INTO ""SalesItems"" (""SaleId"", ""MedicineId"", ""Quantity"", ""UnitPrice"")
                          VALUES (@SaleId, @MedicineId, @Quantity, @UnitPrice)",
                        item, transaction);
                }

                const string updateHeaderSql = @" 
                    UPDATE ""Sales"" 
                    SET ""TotalAmount"" = @TotalAmount, 
                        ""UserId"" = @UserId,
                        ""TransactionDate"" = @TransDate
                    WHERE ""Id"" = @Id";

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

        public async Task<(IEnumerable<Sale>, int)> GetAllPagedAsync(SalesParams parameters)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            var sqlBuilder = new StringBuilder(@"
                SELECT ""Id"", ""UserId"", ""TotalAmount"", ""TransactionDate"" AS ""TransDate"" 
                FROM ""Sales"" WHERE 1=1 ");

            var dbParams = new DynamicParameters();

            if (parameters.StartDate.HasValue)
            {
                sqlBuilder.Append(@" AND ""TransactionDate"" >= @Start");
                dbParams.Add("Start", parameters.StartDate);
            }

            if (parameters.EndDate.HasValue)
            {
                sqlBuilder.Append(@" AND ""TransactionDate"" < @End");
                dbParams.Add("End", parameters.EndDate.Value.AddDays(1));
            }

            string countSqlRaw = sqlBuilder.ToString();
            string countSqlFinal = "SELECT COUNT(*) " + countSqlRaw.Substring(countSqlRaw.IndexOf("FROM"));

            int totalCount = await connection.ExecuteScalarAsync<int>(countSqlFinal, dbParams);

            sqlBuilder.Append(@" ORDER BY ""TransactionDate"" DESC LIMIT @PageSize OFFSET @Offset");
            dbParams.Add("Offset", (parameters.PageNumber - 1) * parameters.PageSize);
            dbParams.Add("PageSize", parameters.PageSize);

            var items = await connection.QueryAsync<Sale>(sqlBuilder.ToString(), dbParams);
            return (items, totalCount);
        }
    }
}