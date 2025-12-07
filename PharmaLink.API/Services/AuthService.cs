// REMOVE THIS LINE: using BCrypt.Net; 
// We don't need it if we use the full name below.

using Microsoft.IdentityModel.Tokens;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using PharmaLink.API.Interfaces.RepositoryInterface;
using PharmaLink.API.Interfaces.ServiceInterface;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PharmaLink.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public AuthService(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        public async Task<string> RegisterAsync(User user, string password,string role)
        {
            // Checks if user exist's
            var existingUser = await _userRepository.GetByUsernameAsync(user.UserName);
            if (existingUser != null)
                throw new Exception("Username already exists.");

            // Use BCrypt.Net.BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.PasswordHash = passwordHash;

            role = string.IsNullOrEmpty(role) ? "User" : role;

            user.Role = role;
            await _userRepository.CreateAsync(user);
            return "User registered successfully.";
        }

        public async Task<string> LoginAsync(string username, string password)
        {
            // Get User
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return null;

            // Implements BCrypt.Net.BCrypt
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            // Generate JWT Token
            return _tokenService.GenerateToken(user);
        }

       
    }
}