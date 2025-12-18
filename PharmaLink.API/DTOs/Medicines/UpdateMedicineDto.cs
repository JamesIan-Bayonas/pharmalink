using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Medicines
{
    public class UpdateMedicineDto
    {
        [Required]
        public required string Name { get; set; }

        public string? Description { get; set; }

        [Required]
        public required int CategoryId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public required int StockQuantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public required decimal Price { get; set; }

        [Required]
        public required DateTime ExpiryDate { get; set; }
    }
}