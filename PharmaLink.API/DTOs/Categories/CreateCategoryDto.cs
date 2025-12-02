using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Categories
{
    public class CreateCategoryDto
    {
        [Required]
        public string? Name { get; set; }
    }
}