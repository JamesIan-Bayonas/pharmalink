// REMOVE THIS LINE: using BCrypt.Net; 
// We don't need it if we use the full name below.

using Microsoft.IdentityModel.Tokens;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PharmaLink.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(User user, string password)
        {
            // Checks if user exist's
            var existingUser = await _userRepository.GetByUsernameAsync(user.UserName);
            if (existingUser != null)
                throw new Exception("Username already exists.");

            // Use BCrypt.Net.BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.PasswordHash = passwordHash;

            // Save User
            user.Role = "User"; // Default User
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
            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "");

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim("uid", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);  
        }
    }
}