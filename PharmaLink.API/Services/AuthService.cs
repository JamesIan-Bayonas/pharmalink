using AutoMapper;
using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.DTOs.Users;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;

namespace PharmaLink.API.Services
{
    public class AuthService(IUserRepository userRepository, ITokenService tokenService, IMapper mapper) : IAuthService
    {
        // FIX CS8603: Signature matches nullable return Task<UserResponseDto?>
        public async Task<UserResponseDto?> GetCurrentUserAsync(int userId)
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            return mapper.Map<UserResponseDto>(user);
        }

        public async Task<string> RegisterAsync(User user, string password, string role)
        {
            // FIX CS8604: Guard against null or empty UserName before passing to repository query
            if (string.IsNullOrWhiteSpace(user.UserName))
            {
                throw new ArgumentException("Username cannot be empty or null.");
            }

            var existingUser = await userRepository.GetByUsernameAsync(user.UserName);
            if (existingUser != null) throw new Exception("Username already exists.");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.PasswordHash = passwordHash;

            if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                role = "Admin";
            }
            else
            {
                role = "Pharmacist";
            }

            user.Role = role;
            await userRepository.CreateAsync(user);
            return "User registered successfully.";
        }

        // FIX CS8603: Correct task syntax Task<string?> to allow returning null on failed logins
        public async Task<string?> LoginAsync(string username, string password)
        {
            var user = await userRepository.GetByUsernameAsync(username);
            if (user == null) return null;

            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            return tokenService.GenerateToken(user);
        }

        public async Task<bool> UpdateUserAsync(int userId, UserUpdateDto request)
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.UserName = request.Username;

            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                user.Role = request.Role;
            }

            return await userRepository.UpdateAsync(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await userRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await userRepository.GetAllAsync();
            return mapper.Map<IEnumerable<UserResponseDto>>(users);
        }
    }
}