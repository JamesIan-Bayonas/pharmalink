using Microsoft.AspNetCore.Identity;
using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.DTOs.Users;
using PharmaLink.API.Entities;

namespace PharmaLink.API.Interfaces.ServiceInterface
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(User user, string password, string role ); // Returns JWT or Success Msg
        Task<string>? LoginAsync(string username, string password); // Returns JWT Token
        Task<bool> UpdateUserAsync(int id, UserUpdateDto request);
        Task<bool> DeleteUserAsync(int id);

        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    }
}
