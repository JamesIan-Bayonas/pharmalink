using Dapper;
using Microsoft.Data.SqlClient;
using PharmaLink.API.DTOs.Medicines;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using System.Data;
using System.Text;

namespace PharmaLink.API.Repositories
{
    public class MedicineRepository(IConfiguration configuration) : IMedicineRepository
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection string not found");

        public async Task<Medicine?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "SELECT * FROM Medicines WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<Medicine>(sql, new { Id = id });
        }

        public async Task<Medicine?> GetByNameAsync(string name)
        {
            using var connection = new SqlConnection(_connectionString);

            // Use LOWER() to ignore casing and LTRIM/RTRIM to ignore hidden spaces
            // Ensures "  Butamirate Citrate  " matches "butamirate citrate"
            string sql = @"
                SELECT * FROM Medicines 
                WHERE LOWER(LTRIM(RTRIM(Name))) = LOWER(LTRIM(RTRIM(@Name)))";

            return await connection.QuerySingleOrDefaultAsync<Medicine>(sql, new { Name = name });
        }

        public async Task<(IEnumerable<Medicine>, int)> GetAllAsync(MedicineParams parameters)
        {
            using var connection = new SqlConnection(_connectionString);

            // Start building the query
            var sqlBuilder = new System.Text.StringBuilder("SELECT * FROM Medicines WHERE 1=1 ");

            // We need to build the Count query identically to ensure pagination is correct
            // Note: We construct the WHERE clause first, then append it to count later to avoid duplication code

            var dbParams = new DynamicParameters();

            // Dynamic Filtering (Search)
            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                sqlBuilder.Append(" AND Name LIKE @SearchTerm");
                dbParams.Add("SearchTerm", $"%{parameters.SearchTerm}%");
            }

            if (parameters.CategoryId.HasValue)
            {
                sqlBuilder.Append(" AND CategoryId = @CategoryId");
                dbParams.Add("CategoryId", parameters.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(parameters.Filter))
            {
                if (parameters.Filter.ToLower() == "low")
                {
                    sqlBuilder.Append(" AND StockQuantity <= 10");
                }
                else if (parameters.Filter.ToLower() == "expiring")
                {
                    // 90 Days expiry threshold
                    sqlBuilder.Append(" AND ExpiryDate <= DATEADD(day, 90, GETDATE())");
                }
            }

            // Dynamic Sorting
            string sortQuery = parameters.SortBy?.ToLower() switch
            {
                "price" => "ORDER BY Price ASC",
                "price_desc" => "ORDER BY Price DESC",
                "expiry" => "ORDER BY ExpiryDate ASC",
                "name_desc" => "ORDER BY Name DESC",
                _ => "ORDER BY Name ASC"
            };

            // 4. Prepare Count Query (Must match the WHERE clause of data query)
            // We extract the "WHERE..." part from sqlBuilder to ensure Count matches Data
            string whereClause = sqlBuilder.ToString().Substring(sqlBuilder.ToString().IndexOf("WHERE"));
            string countSql = $"SELECT COUNT(*) FROM Medicines {whereClause}";

            // 5. Append Sort and Pagination to Data Query
            sqlBuilder.Append($" {sortQuery}");
            sqlBuilder.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");

            dbParams.Add("Offset", (parameters.PageNumber - 1) * parameters.PageSize);
            dbParams.Add("PageSize", parameters.PageSize);

            // 6. Execute Queries
            int totalCount = await connection.ExecuteScalarAsync<int>(countSql, dbParams);
            var items = await connection.QueryAsync<Medicine>(sqlBuilder.ToString(), dbParams);

            return (items, totalCount);
        }

        public async Task<int> CreateAsync(Medicine medicine)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = @"
                INSERT INTO Medicines (CategoryId, Name, Description, StockQuantity, Price, ExpiryDate)
                VALUES (@CategoryId, @Name, @Description, @StockQuantity, @Price, @ExpiryDate);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            return await connection.QuerySingleAsync<int>(sql, medicine);
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
                using var connection = new SqlConnection(_connectionString);
                int rows = await connection.ExecuteAsync(sql, parameters);
                return rows > 0;
            }
        }
        public async Task<bool> UpdateAsync(Medicine medicine)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = @"
                UPDATE Medicines 
                SET Name = @Name, 
                    Description = @Description, -- Added this line
                    CategoryId = @CategoryId, 
                    StockQuantity = @StockQuantity, 
                    Price = @Price, 
                    ExpiryDate = @ExpiryDate
                    WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, medicine);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            string sql = "DELETE FROM Medicines WHERE Id = @Id";

            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }

        public async Task<(IEnumerable<Medicine>, int)> GetAllPagedAsync(MedicineParams parameters)
        {
            using var connection = new SqlConnection(_connectionString);
            var sqlBuilder = new StringBuilder("SELECT * FROM Medicines WHERE 1=1 ");
            var dbParams = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                sqlBuilder.Append(" AND Name LIKE @Search");
                dbParams.Add("Search", $"%{parameters.SearchTerm}%");
            }

            // --- NEW FILTER LOGIC START ---
            if (!string.IsNullOrWhiteSpace(parameters.Filter))
            {
                if (parameters.Filter.ToLower() == "low")
                {
                    sqlBuilder.Append(" AND StockQuantity <= 10"); // Matches Dashboard Logic
                }
                else if (parameters.Filter.ToLower() == "expiring")
                {
                    // 90 Days expiry threshold
                    sqlBuilder.Append(" AND ExpiryDate <= DATEADD(day, 90, GETDATE())");
                }
            }
            // --- NEW FILTER LOGIC END ---

            // Count Total (for pagination)
            string countSql = $"SELECT COUNT(*) FROM Medicines WHERE 1=1 {sqlBuilder.ToString().Substring(sqlBuilder.ToString().IndexOf("WHERE") + 10)}";
            int totalCount = await connection.ExecuteScalarAsync<int>(countSql, dbParams);

            // Apply Sorting & Pagination
            sqlBuilder.Append(" ORDER BY Name ASC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");
            dbParams.Add("Offset", (parameters.PageNumber - 1) * parameters.PageSize);
            dbParams.Add("PageSize", parameters.PageSize);

            var items = await connection.QueryAsync<Medicine>(sqlBuilder.ToString(), dbParams);
            return (items, totalCount);
        }
    }
}