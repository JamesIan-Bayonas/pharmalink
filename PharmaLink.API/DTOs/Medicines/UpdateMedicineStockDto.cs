using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Medicines
{
    public class UpdateMedicineStockDto
    {
        [Required]
        public required int Quantity { set; get; }
    }
}
