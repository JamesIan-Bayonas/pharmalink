using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Sales
{

    public class SaleItemDto
    {
        [Required]
        public int MedicineId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }
}
