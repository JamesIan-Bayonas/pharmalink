using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Sales
{
    public class CreateSaleRequestDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "Cart cannot be empty")]
        public List<SaleItemDto>? Items { get; set; }
    }
}
