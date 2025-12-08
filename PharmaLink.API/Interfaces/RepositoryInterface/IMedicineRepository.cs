using PharmaLink.API.Entities;
using System.Data;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface IMedicineRepository
    {
        Task<Medicine?> GetByIdAsync(int id);
        Task<IEnumerable<Medicine>> GetAllAsync();
        Task<int> CreateAsync(Medicine medicine);
        Task<bool> UpdateStockAsync(int id, int quantityDeducted, IDbTransaction transaction = null);
        Task<bool> UpdateAsync(Medicine medicine);
        Task<bool> DeleteAsync(int id);
    }
}
