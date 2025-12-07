using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Categories
{
    public class CategoryResponseDto
    {
        [Required]
        public required int Id { get; set; }

        [Required]
        public required string Name { get; set; }
    }
}