using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface IUserRepository
    {
        // FIX CS8603: Annotate return type as Task<User?> to accurately reflect DB misses
        Task<User?> GetByUsernameAsync(string username);
        Task<int> CreateAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task<IEnumerable<User>> GetAllAsync();
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateAsync(User user);
        Task<bool> UpdateProfileImageAsync(int userId, string imagePath);
    }
}