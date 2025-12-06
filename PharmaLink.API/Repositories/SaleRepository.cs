using Dapper;
using Microsoft.Data.SqlClient;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using System.Data;

public class SaleRepository : ISaleRepository
{
    private readonly string _connectionString;

    public SaleRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    // Required by ISaleRepository
    public async Task<Sale?> GetByIdAsync(int id)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            const string sql = "SELECT * FROM Sales WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Sale>(sql, new { Id = id });
        }
    }
    public async Task<IEnumerable<Sale>> GetAllAsync()
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            // We use 'TransactionDate AS TransDate' here as well
            const string sql = @"
                SELECT Id, UserId, TotalAmount, TransactionDate AS TransDate 
                FROM Sales";
            return await connection.QueryAsync<Sale>(sql);
        }
    }

    public async Task<int> CreateSaleTransactionAsync(Sale sale, List<SaleItem> items)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            // Begin Transaction: All or Nothing
            using (var transaction = connection.BeginTransaction())
            {
                try
                {
                    // 1. Insert Sale Header and get the new ID
                    string saleSql = @"
                        INSERT INTO Sales (UserId, TotalAmount, TransactionDate) 
                        VALUES (@UserId, @TotalAmount, @TransDate);
                        SELECT CAST(SCOPE_IDENTITY() as int);";

                    int newSaleId = await connection.QuerySingleAsync<int>(saleSql, sale, transaction);

                    // 2. Process Items
                    foreach (var item in items)
                    {
                        item.SaleId = newSaleId;

                        // Insert Sale Item
                        string itemSql = @"
                            INSERT INTO SalesItems (SaleId, MedicinesId, Quantity, UnitPrice)
                            VALUES (@SaleId, @MedicinesId, @Quantity, @UnitPrice)";

                        await connection.ExecuteAsync(itemSql, item, transaction);

                        // 3. Update Inventory (Deduct Stock)
                        string stockSql = @"
                            UPDATE Medicines 
                            SET StockQuantity = StockQuantity - @Quantity 
                            WHERE Id = @MedicinesId";

                        await connection.ExecuteAsync(stockSql, new { Quantity = item.Quantity, MedicinesId = item.MedicinesId }, transaction);
                    }

                    transaction.Commit(); // Save changes
                    return newSaleId;
                }
                catch (Exception)
                {
                    transaction.Rollback(); // Undo everything if error
                    throw;
                }
            }
        }
    }

    public async Task<IEnumerable<SaleItem>> GetItemsBySaleIdAsync(int saleId)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            // Simple select and fetch to get all items belonging to this Sale ID
            string sql = "SELECT * FROM SalesItems WHERE SaleId = @SaleId";
            return await connection.QueryAsync<SaleItem>(sql, new { SaleId = saleId });
        }
    }
}