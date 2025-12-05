namespace PharmaLink.API.DTOs.Medicines
{
    public class MedicineResponseDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int CategoryId { get; set; }
        public int StockQuantity { get; set; }
        public decimal Price { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}