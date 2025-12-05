using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Medicines
{
    public class CreateMedicineDto
    {
        [Required]
        public string? Name { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }
    }
}