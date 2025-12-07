using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface ICategoryRepository
    {
        Task<int> CreateAsync(Category category);
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}