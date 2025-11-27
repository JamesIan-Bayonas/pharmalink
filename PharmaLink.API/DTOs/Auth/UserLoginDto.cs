using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Auth
{
    public class UserLoginDto
    {
        [Required]
        public required string Username { get; set; }

        [Required]
        public required string Password { get; set; }
    }
}
