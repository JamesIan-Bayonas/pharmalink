using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Sales
{
    public class UpdateSaleDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "Sale must have at least one item.")]
        public List<SaleItemDto> Items { get; set; } = new();
    }
}