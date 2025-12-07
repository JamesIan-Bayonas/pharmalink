namespace PharmaLink.API.DTOs.Medicines
{
    public class MedicineResponseDto
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required int CategoryId { get; set; }
        public required int StockQuantity { get; set; } // Matches your fixed spelling
        public required decimal Price { get; set; }
        public required DateTime ExpiryDate { get; set; } // The new column we added

    }
}