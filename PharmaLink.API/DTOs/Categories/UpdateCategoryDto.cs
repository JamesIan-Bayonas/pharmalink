using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Categories
{
    public class UpdateCategoryDto
    {
        [Required]
        public required string Name { get; set; }
    }
}