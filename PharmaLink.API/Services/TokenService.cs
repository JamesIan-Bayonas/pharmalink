using Microsoft.IdentityModel.Tokens;
using PharmaLink.API.Entities;
using PharmaLink.API.Interfaces.ServiceInterface;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PharmaLink.API.Services
{
    public class TokenService(IConfiguration configuration) : ITokenService
    {
        public string GenerateToken(User user)
        {
            var jwtKey = configuration["JwtSettings:Key"] ?? "this_is_a_very_long_super_secret_key_for_pharmalink_security";
            var key = Encoding.UTF8.GetBytes(jwtKey);

            // FIX CS8604: Null-coalesce UserName and Role to ensure non-null string values for Claims
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName ?? string.Empty),
                new("uid", user.Id.ToString()),
                new(ClaimTypes.Role, user.Role ?? string.Empty)
            };

            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}