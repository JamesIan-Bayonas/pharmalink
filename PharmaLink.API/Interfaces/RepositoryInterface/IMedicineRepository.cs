using PharmaLink.API.DTOs.Medicines;
using PharmaLink.API.Entities;
using System.Data;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface IMedicineRepository
    {
        Task<Medicine?> GetByIdAsync(int id);
        Task<(IEnumerable<Medicine>, int)> GetAllAsync(MedicineParams parameters);
        Task<int> CreateAsync(Medicine medicine);
        Task<Medicine?> GetByNameAsync(string name);
        // FIX CS8625: Mark IDbTransaction as nullable (IDbTransaction?) to accept default null
        Task<bool> UpdateStockAsync(int id, int quantityDeducted, IDbTransaction? transaction = null);
        Task<bool> UpdateAsync(Medicine medicine);
        Task<bool> DeleteAsync(int id);
    }
}