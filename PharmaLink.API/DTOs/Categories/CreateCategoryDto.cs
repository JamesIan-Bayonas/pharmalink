using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Categories
{
    public class CreateCategoryDto
    {
        [Required]
        public required string Name { get; set; }
    }
}