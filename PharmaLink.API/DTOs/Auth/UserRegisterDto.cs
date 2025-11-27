namespace PharmaLink.API.DTOs.Auth
{
    using System.ComponentModel.DataAnnotations;

    // 1. Auth DTOs
    public class UserRegisterDto
    {
        [Required]
        public string? UserName { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string? Password { get; set; }
    }
}
