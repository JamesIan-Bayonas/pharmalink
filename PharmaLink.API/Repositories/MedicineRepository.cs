using Dapper;
using Microsoft.Data.SqlClient;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Data;

public class MedicineRepository : IMedicineRepository
{
    private readonly string _connectionString;

    public MedicineRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");
    }

    public async Task<Medicine?> GetByIdAsync(int id)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            string sql = "SELECT * FROM Medicines WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Medicine>(sql, new { Id = id });
        }
    }

    public async Task<IEnumerable<Medicine>> GetAllAsync()
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            string sql = "SELECT * FROM Medicines";
            return await connection.QueryAsync<Medicine>(sql);
        }
    }

    public async Task<int> CreateAsync(Medicine medicine)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            string sql = @"
            INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate)
            VALUES (@CategoryId, @Name, @StockQuantity, @Price, @ExpiryDate);
            SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, medicine);
        }
    }

    public async Task<bool> UpdateStockAsync(int id, int quantityDeducted, IDbTransaction transaction)
    {
        string sql = "UPDATE Medicines SET StockQuantity = StockQuantity - @Quantity WHERE Id = @Id";
        var parameters = new { Quantity = quantityDeducted, Id = id };

        // IF a transaction is passed (like from SaleService), use it.
        if (transaction != null)
        {
            int rows = await transaction.Connection!.ExecuteAsync(sql, parameters, transaction);
            return rows > 0;
        }
        else
        {
            // ELSE open a new independent connection.
            using (var connection = new SqlConnection(_connectionString))
            {
                int rows = await connection.ExecuteAsync(sql, parameters);
                return rows > 0;
            }
        }
    }
}