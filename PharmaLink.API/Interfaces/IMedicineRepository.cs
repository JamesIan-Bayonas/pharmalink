using PharmaLink.API.Entities;
using System.Data;

namespace PharmaLink.API.Interfaces
{
    public interface IMedicineRepository
    {
        Task<Medicine?> GetByIdAsync(int id);
        Task<IEnumerable<Medicine>> GetAllAsync();
        Task<int> CreateAsync(Medicine medicine);
        Task<bool> UpdateStockAsync(int id, int quantityDeducted, IDbTransaction transaction = null);
    }
}
