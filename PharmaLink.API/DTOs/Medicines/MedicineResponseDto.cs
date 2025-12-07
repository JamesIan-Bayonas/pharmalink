using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Medicines
{
    public class MedicineResponseDto
    {
        [Required]
        public required int Id { get; set; }
        [Required]
        public required string Name { get; set; }
        [Required]
        public required int CategoryId { get; set; }
        [Required]
        public required int StockQuantity { get; set; } // Matches your fixed spelling
        [Required]
        public required decimal Price { get; set; }
        [Required]
        public required DateTime ExpiryDate { get; set; } // The new column we added

    }
}