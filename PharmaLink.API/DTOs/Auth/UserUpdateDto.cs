using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Auth
{
    public class UserUpdateDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string? Password { get; set; } // Optional: Leave null if not changing
        public string? Role { get; set; }
    }
}