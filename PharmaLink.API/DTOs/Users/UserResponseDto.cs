using System.Runtime.CompilerServices;

namespace PharmaLink.API.DTOs.Users
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? ProfileImagePath { get; set; }
    }
}