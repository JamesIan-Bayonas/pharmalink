// REMOVE THIS LINE: using BCrypt.Net; 
// We don't need it if we use the full name below.

using Microsoft.IdentityModel.Tokens;
using PharmaLink.API.DTOs.Auth;
using PharmaLink.API.DTOs.Users;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;
using PharmaLink.API.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PharmaLink.API.Services
{
    public class AuthService(IUserRepository userRepository, ITokenService tokenService) : IAuthService
    {
        public async Task<string> RegisterAsync(User user, string password,string role)
        {
            // Checks if user exist's
            var existingUser = await userRepository.GetByUsernameAsync(user.UserName);
            if (existingUser != null)
                throw new Exception("Username already exists.");

            // Use BCrypt.Net.BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.PasswordHash = passwordHash;

            role = string.IsNullOrEmpty(role) ? "User" : role;

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
        public async Task<bool> UpdateUserAsync(int id, UserUpdateDto request)
        {
            var user = await userRepository.GetByIdAsync(id);
            if (user == null) return false;

            user.UserName = request.Username;

            // Update Password (ONLY if provided)
            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            // Save changes via Repository
            return await userRepository.UpdateAsync(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await userRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
        {
            // 1. Get raw entities from Repository
            var users = await userRepository.GetAllAsync();

            // 2. Map Entity -> DTO (Manual Mapping)
            // We strictly select ONLY the fields we want to show.
            return users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Role = u.Role,
                ProfileImagePath = u.ProfileImagePath // Include the image path we added earlier!
            });
        }
    }
}