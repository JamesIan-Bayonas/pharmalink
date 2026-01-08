using AutoMapper;
using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.DTOs.Users;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;
using PharmaLink.API.Repositories;

namespace PharmaLink.API.Services
{
    public class AuthService(IUserRepository userRepository, ITokenService tokenService, IMapper mapper) : IAuthService 
    {

        public async Task<UserResponseDto> GetCurrentUserAsync(int userId)
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            return mapper.Map<UserResponseDto>(user);
        }

        public async Task<string> RegisterAsync(User user, string password, string role)
        {
            // Check if user exists
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

        public async Task<string> LoginAsync(string username, string password)
        {
            // Get User
            var user = await userRepository.GetByUsernameAsync(username);
            if (user == null) return null;

            // Implements BCrypt.Net.BCrypt
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            // Generate JWT Token
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

            // 3. Update Role (Only if provided AND not null)
            // This prevents "My Profile" (which sends null Role) from wiping the user's role
            if (!string.IsNullOrEmpty(request.Role))
            {
                user.Role = request.Role;
            }

            // 4. Save to Database
            return await userRepository.UpdateAsync(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await userRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
         
            var users = await userRepository.GetAllAsync();
            return mapper.Map<IEnumerable<UserResponseDto>>(users); // Map Entities to DTOs, using auto-mapper
        }
    }
}