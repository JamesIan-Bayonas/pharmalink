using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PharmaLink.API.DTOs.Sales
{
    public class SaleResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime TransactionDate { get; set; }
        public List<SaleItemResponseDto> Items { get; set; } = new List<SaleItemResponseDto>();
    }

    public class SaleItemResponseDto
    {
        [Required]
        public required int Id { get; set; }

        [Required]
        public required int MedicineId { get; set; }
        [Required]
        public required string MedicineName { get; set;  } // fetch this via JOIN
        [Required]
        public required int Quantity { get; set; }
        [Required]
        public required decimal UnitPrice { get; set; }
        [Required]
        public decimal SubTotal => Quantity * UnitPrice;
    }
}