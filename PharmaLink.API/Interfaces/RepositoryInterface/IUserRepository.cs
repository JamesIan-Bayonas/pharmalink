using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.RepositoryInterface
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task<int> CreateAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task<IEnumerable<User>> GetAllAsync();
        Task<bool> DeleteAsync(int id); 
        Task<bool> UpdateAsync(User user); // For changing roles/passwords
        Task<bool> UpdateProfileImageAsync(int userId, string imagePath);
    }
}
