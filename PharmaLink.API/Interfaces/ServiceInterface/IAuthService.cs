using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.DTOs.Users;
using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(User user, string password, string role);
        // FIX CS8603: Mark return types as nullable where failure/not-found states return null
        Task<string?> LoginAsync(string username, string password);
        Task<bool> UpdateUserAsync(int id, UserUpdateDto request);
        Task<bool> DeleteUserAsync(int id);
        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto?> GetCurrentUserAsync(int userId);
    }
}