namespace PharmaLink.API.DTOs.Auth
{
    using System.ComponentModel.DataAnnotations;

    // 1. Auth DTOs
    public class UserRegisterDto
    {
        [Required]
        public required string UserName { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public required string Password { get; set; }

        [Required]
        public required string Role { get; set; }
    }
}
