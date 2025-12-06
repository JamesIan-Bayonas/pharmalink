using System;
using System.Collections.Generic;

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
        public int Id { get; set; }
        public int MedicineId { get; set; }
        public string? MedicineName { get; set;  } // fetch this via JOIN
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal SubTotal => Quantity * UnitPrice;
    }
}