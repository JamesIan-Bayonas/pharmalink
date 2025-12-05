using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces
{
    public interface ICategoryRepository
    {
        Task<int> CreateAsync(Category category);
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}